#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Setting up local development environment...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Create local Kubernetes cluster using Kind
echo -e "${GREEN}Creating local Kubernetes cluster...${NC}"
kind create cluster --name hd-project --config kind-config.yaml

# Build and load Docker images
echo -e "${GREEN}Building and loading Docker images...${NC}"
docker build -t hd-project-frontend:latest ./frontend
docker build -t hd-project-backend:latest ./backend

kind load docker-image hd-project-frontend:latest --name hd-project
kind load docker-image hd-project-backend:latest --name hd-project

# Create monitoring namespace
echo -e "${GREEN}Creating monitoring namespace...${NC}"
kubectl create namespace monitoring

# Install Prometheus Operator CRDs
echo -e "${GREEN}Installing Prometheus Operator CRDs...${NC}"
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/example/prometheus-operator-crd/monitoring.coreos.com_prometheusrules.yaml

# Apply Kubernetes configurations
echo -e "${GREEN}Applying Kubernetes configurations...${NC}"
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/configmap.yaml
kubectl apply -f k8s/base/secret.yaml
kubectl apply -f k8s/base/backend-deployment.yaml
kubectl apply -f k8s/base/frontend-deployment.yaml
kubectl apply -f k8s/base/backend-service.yaml
kubectl apply -f k8s/base/frontend-service.yaml

# Apply monitoring configurations
echo -e "${GREEN}Setting up monitoring...${NC}"
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/grafana-dashboards.yaml
kubectl apply -f monitoring/alert-rules.yaml

# Wait for pods to be ready
echo -e "${GREEN}Waiting for pods to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=backend --timeout=300s -n hd-project
kubectl wait --for=condition=ready pod -l app=frontend --timeout=300s -n hd-project

# Port forward services
echo -e "${GREEN}Setting up port forwarding...${NC}"
kubectl port-forward svc/frontend 3000:80 -n hd-project &
kubectl port-forward svc/backend 8080:8080 -n hd-project &
kubectl port-forward svc/prometheus-server 9090:9090 -n monitoring &
kubectl port-forward svc/grafana 3001:3000 -n monitoring &

echo -e "${GREEN}Local development environment is ready!${NC}"
echo -e "Frontend: http://localhost:3000"
echo -e "Backend: http://localhost:8080"
echo -e "Prometheus: http://localhost:9090"
echo -e "Grafana: http://localhost:3001" 