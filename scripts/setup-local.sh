#!/bin/bash

# Create kind cluster
kind create cluster --name local-cluster --config kind-config.yaml

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress controller to be ready
echo "Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Wait for cert-manager to be ready
echo "Waiting for cert-manager to be ready..."
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=90s

# Create cluster issuer for local development
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
EOF

# Create namespace for our application
kubectl create namespace production

# Create secret for database credentials
kubectl create secret generic db-credentials \
  --namespace production \
  --from-literal=url='postgresql://postgres:postgres@postgres:5432/mydb'

# Create secret for Grafana admin credentials
kubectl create secret generic grafana-admin-credentials \
  --namespace production \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=admin

# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace production \
  -f monitoring/prometheus-values.yaml

# Install Grafana
helm install grafana grafana/grafana \
  --namespace production \
  -f monitoring/grafana-values.yaml

# Update hosts file for local domain
echo "127.0.0.1 local-app.com" | sudo tee -a /etc/hosts

echo "Local setup completed! You can now deploy your application using:"
echo "helm install app ./k8s/helm-charts/app --namespace production" 