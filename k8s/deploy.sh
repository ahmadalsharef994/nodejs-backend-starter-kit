#!/bin/bash

# Kubernetes Deployment Script for Node.js Backend Starter Kit
# This script deploys the application with all necessary components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Node.js Backend Starter Kit to Kubernetes${NC}"
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

# Create namespace if it doesn't exist
echo -e "${GREEN}📦 Creating namespace (if not exists)...${NC}"
kubectl create namespace default --dry-run=client -o yaml | kubectl apply -f -

# Apply RBAC first
echo -e "${GREEN}🔐 Applying RBAC configuration...${NC}"
kubectl apply -f k8s/rbac.yaml

# Apply ConfigMap and Secrets
echo -e "${GREEN}⚙️ Applying ConfigMap and Secrets...${NC}"
kubectl apply -f k8s/configmap.yaml

# Deploy MongoDB (optional - for development)
echo -e "${GREEN}🗄️ Deploying MongoDB (development only)...${NC}"
kubectl apply -f k8s/mongodb.yaml

# Wait for MongoDB to be ready
echo -e "${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s

# Deploy the main application
echo -e "${GREEN}🚀 Deploying Node.js Backend...${NC}"
kubectl apply -f k8s/deployment.yaml

# Create Services
echo -e "${GREEN}🌐 Creating Services...${NC}"
kubectl apply -f k8s/service.yaml

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to be ready...${NC}"
kubectl wait --for=condition=available deployment/nodejs-backend-deployment --timeout=300s

# Apply HPA
echo -e "${GREEN}📈 Setting up Horizontal Pod Autoscaler...${NC}"
kubectl apply -f k8s/hpa.yaml

# Apply Network Policies (optional)
echo -e "${GREEN}🔒 Applying Network Policies...${NC}"
kubectl apply -f k8s/network-policy.yaml

# Apply Ingress (optional)
if kubectl get ingressclass nginx &> /dev/null; then
    echo -e "${GREEN}🌍 Applying Ingress configuration...${NC}"
    kubectl apply -f k8s/ingress.yaml
else
    echo -e "${YELLOW}⚠️ NGINX Ingress Controller not found. Skipping Ingress deployment.${NC}"
fi

# Display deployment status
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "=================================================="
echo -e "${GREEN}📊 Deployment Status:${NC}"
kubectl get deployments,pods,services,hpa -l app=nodejs-backend

echo ""
echo -e "${GREEN}🔍 Useful Commands:${NC}"
echo "• View pods: kubectl get pods -l app=nodejs-backend"
echo "• View logs: kubectl logs -l app=nodejs-backend -f"
echo "• View services: kubectl get svc -l app=nodejs-backend"
echo "• View HPA status: kubectl get hpa"
echo "• Port forward: kubectl port-forward svc/nodejs-backend-service 3000:80"
echo "• Scale deployment: kubectl scale deployment nodejs-backend-deployment --replicas=3"

# Get LoadBalancer IP/URL
echo ""
echo -e "${GREEN}🌐 Access Information:${NC}"
LB_IP=$(kubectl get svc nodejs-backend-lb -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
LB_HOSTNAME=$(kubectl get svc nodejs-backend-lb -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ "$LB_IP" != "pending" ] && [ "$LB_IP" != "" ]; then
    echo "• LoadBalancer IP: http://$LB_IP"
elif [ "$LB_HOSTNAME" != "" ]; then
    echo "• LoadBalancer Hostname: http://$LB_HOSTNAME"
else
    echo "• LoadBalancer IP: pending (use 'kubectl get svc nodejs-backend-lb' to check)"
fi

echo "• Health Check: /health"
echo "• API Metrics: /api-metrics"
echo "• API Base URL: /v1"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
