# Kubernetes Deployment Guide

This directory contains all the necessary Kubernetes manifests to deploy the Node.js Backend Starter Kit in a production-ready environment.

## 🏗️ Architecture

The deployment includes:

- **2 Node.js API instances** (with HPA for auto-scaling)
- **MongoDB database** (for development/testing)
- **LoadBalancer service** for external access
- **Ingress controller** support with SSL termination
- **Horizontal Pod Autoscaler** (HPA) for automatic scaling
- **Network policies** for security
- **Resource limits** and health checks
- **RBAC** configuration for security

## 📋 Prerequisites

1. **Kubernetes cluster** (v1.20+ recommended)
2. **kubectl** configured to access your cluster
3. **Docker image** built and pushed to a registry
4. **Ingress controller** (optional, for domain access)
5. **Cert-manager** (optional, for SSL certificates)

## 🚀 Quick Start

### 1. Build and Push Docker Image

```bash
# Build the Docker image
docker build -t your-registry/nodejs-backend:latest .

# Push to your registry
docker push your-registry/nodejs-backend:latest
```

### 2. Update Configuration

Update the image reference in `deployment.yaml`:
```yaml
containers:
- name: nodejs-backend
  image: your-registry/nodejs-backend:latest  # Update this
```

### 3. Configure Environment Variables

Edit `configmap.yaml` to set your environment-specific values:
- MongoDB connection string
- JWT secrets
- Email configuration
- Other service configurations

### 4. Deploy to Kubernetes

```bash
# Deploy everything
./deploy.sh

# Or manually apply manifests
kubectl apply -f configmap.yaml
kubectl apply -f rbac.yaml
kubectl apply -f mongodb.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml
kubectl apply -f ingress.yaml
```

## 📁 Manifest Files

### Core Components

- **`configmap.yaml`** - Configuration data and secrets
- **`deployment.yaml`** - Main application deployment (2 replicas)
- **`service.yaml`** - ClusterIP and LoadBalancer services
- **`hpa.yaml`** - Horizontal Pod Autoscaler configuration

### Infrastructure

- **`mongodb.yaml`** - MongoDB deployment for development
- **`ingress.yaml`** - Ingress configuration with SSL support
- **`network-policy.yaml`** - Network security policies
- **`rbac.yaml`** - Role-based access control

### Scripts

- **`deploy.sh`** - Automated deployment script
- **`cleanup.sh`** - Cleanup script to remove all resources

## ⚙️ Configuration

### Environment Variables

The application uses ConfigMaps and Secrets for configuration:

**ConfigMap** (`nodejs-backend-config`):
- `NODE_ENV` - Environment (production/development)
- `PORT` - Application port (3000)
- `MONGODB_URL` - MongoDB connection string
- `JWT_*` - JWT configuration
- `EMAIL_*` - Email configuration

**Secret** (`nodejs-backend-secrets`):
- `SMTP_*` - Email service credentials
- `SMS_*` - SMS service credentials
- `ELASTIC_*` - Elasticsearch credentials
- `RAZORPAY_*` - Payment gateway credentials
- `CLOUDINARY_*` - File storage credentials

### Resource Limits

Each pod is configured with:
- **CPU**: 250m request, 500m limit
- **Memory**: 256Mi request, 512Mi limit

### Health Checks

- **Liveness probe**: `/health` endpoint
- **Readiness probe**: `/health` endpoint
- **Startup grace period**: 30 seconds

## 🔄 Auto-scaling

The HPA is configured to:
- **Minimum replicas**: 2
- **Maximum replicas**: 10
- **CPU target**: 70%
- **Memory target**: 80%

## 🌐 Access Methods

### 1. LoadBalancer Service

```bash
# Get LoadBalancer IP
kubectl get svc nodejs-backend-lb

# Access the application
curl http://<LOAD_BALANCER_IP>/health
```

### 2. Port Forwarding (Development)

```bash
# Forward local port to service
kubectl port-forward svc/nodejs-backend-service 3000:80

# Access locally
curl http://localhost:3000/health
```

### 3. Ingress (Production)

Configure your domain in `ingress.yaml` and access via:
```
https://api.yourapp.com/health
```

## 🔍 Monitoring

### Health Checks

- **Health endpoint**: `/health`
- **Metrics endpoint**: `/api-metrics`

### Useful Commands

```bash
# View pod status
kubectl get pods -l app=nodejs-backend

# View logs
kubectl logs -l app=nodejs-backend -f

# View services
kubectl get svc -l app=nodejs-backend

# View HPA status
kubectl get hpa

# Scale manually
kubectl scale deployment nodejs-backend-deployment --replicas=3

# Check resource usage
kubectl top pods -l app=nodejs-backend
```

## 🔒 Security

### Network Policies

Network policies are configured to:
- Allow ingress only from Ingress controller
- Allow egress to MongoDB and external services
- Deny all other traffic

### RBAC

Service accounts and roles are configured with minimal permissions:
- Read access to ConfigMaps and Secrets
- Read access to pods and services

## 🚨 Troubleshooting

### Common Issues

1. **Image Pull Errors**
   ```bash
   # Check image availability
   kubectl describe pod <pod-name>
   
   # Update image pull policy
   imagePullPolicy: Always
   ```

2. **Configuration Issues**
   ```bash
   # Check ConfigMap
   kubectl get configmap nodejs-backend-config -o yaml
   
   # Check Secrets
   kubectl get secret nodejs-backend-secrets -o yaml
   ```

3. **Service Discovery**
   ```bash
   # Check service endpoints
   kubectl get endpoints
   
   # Test service connectivity
   kubectl exec -it <pod-name> -- curl nodejs-backend-service/health
   ```

4. **HPA Not Scaling**
   ```bash
   # Check HPA status
   kubectl describe hpa nodejs-backend-hpa
   
   # Check metrics server
   kubectl top pods
   ```

### Debugging Commands

```bash
# Get detailed pod information
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check logs
kubectl logs <pod-name> -c nodejs-backend

# Execute commands in pod
kubectl exec -it <pod-name> -- sh
```

## 🧹 Cleanup

To remove all deployed resources:

```bash
# Use cleanup script
./cleanup.sh

# Or manually delete
kubectl delete -f .
```

## 📊 Production Considerations

1. **Image Registry**: Use a private registry for production
2. **Secrets Management**: Use external secret management (HashiCorp Vault, AWS Secrets Manager)
3. **Database**: Use managed database services instead of in-cluster MongoDB
4. **Monitoring**: Add Prometheus/Grafana for comprehensive monitoring
5. **Logging**: Implement centralized logging (ELK stack)
6. **Backup**: Implement backup strategies for persistent data
7. **SSL Certificates**: Use cert-manager for automatic SSL certificate management

## 📝 Notes

- This setup is optimized for production use with security best practices
- MongoDB deployment is included for development/testing purposes
- For production, consider using managed database services
- Adjust resource limits based on your application's requirements
- Monitor and tune HPA settings based on your traffic patterns
