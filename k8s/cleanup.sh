#!/bin/bash

# Kubernetes Cleanup Script for Node.js Backend Starter Kit
# This script removes all deployed resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Cleaning up Node.js Backend Starter Kit from Kubernetes${NC}"
echo "=================================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if we're connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Not connected to a Kubernetes cluster${NC}"
    exit 1
fi

# Get current context
CONTEXT=$(kubectl config current-context)
echo -e "${YELLOW}📋 Current Kubernetes context: ${CONTEXT}${NC}"

# Confirm deletion
read -p "Are you sure you want to delete all resources? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
    exit 0
fi

# Delete Ingress
echo -e "${GREEN}🌍 Removing Ingress...${NC}"
kubectl delete -f k8s/ingress.yaml --ignore-not-found=true

# Delete Network Policies
echo -e "${GREEN}🔒 Removing Network Policies...${NC}"
kubectl delete -f k8s/network-policy.yaml --ignore-not-found=true

# Delete HPA
echo -e "${GREEN}📈 Removing Horizontal Pod Autoscaler...${NC}"
kubectl delete -f k8s/hpa.yaml --ignore-not-found=true

# Delete Services
echo -e "${GREEN}🌐 Removing Services...${NC}"
kubectl delete -f k8s/service.yaml --ignore-not-found=true

# Delete main application
echo -e "${GREEN}🚀 Removing Node.js Backend Deployment...${NC}"
kubectl delete -f k8s/deployment.yaml --ignore-not-found=true

# Delete MongoDB (if exists)
echo -e "${GREEN}🗄️ Removing MongoDB...${NC}"
kubectl delete -f k8s/mongodb.yaml --ignore-not-found=true

# Delete ConfigMap and Secrets
echo -e "${GREEN}⚙️ Removing ConfigMap and Secrets...${NC}"
kubectl delete -f k8s/configmap.yaml --ignore-not-found=true

# Delete RBAC
echo -e "${GREEN}🔐 Removing RBAC configuration...${NC}"
kubectl delete -f k8s/rbac.yaml --ignore-not-found=true

# Check remaining resources
echo -e "${GREEN}🔍 Checking for remaining resources...${NC}"
REMAINING_PODS=$(kubectl get pods -l app=nodejs-backend --no-headers 2>/dev/null | wc -l)
REMAINING_SERVICES=$(kubectl get svc -l app=nodejs-backend --no-headers 2>/dev/null | wc -l)

if [ "$REMAINING_PODS" -eq 0 ] && [ "$REMAINING_SERVICES" -eq 0 ]; then
    echo -e "${GREEN}✅ All resources cleaned up successfully!${NC}"
else
    echo -e "${YELLOW}⚠️ Some resources may still be terminating. Check with:${NC}"
    echo "• kubectl get pods -l app=nodejs-backend"
    echo "• kubectl get svc -l app=nodejs-backend"
fi

echo ""
echo -e "${GREEN}🎉 Cleanup completed!${NC}"
