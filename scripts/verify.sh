#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
        return 0
    else
        echo -e "${RED}✗ $1${NC}"
        return 1
    fi
}

# Function to check if pods are running
check_pods_running() {
    local namespace=$1
    local label=$2
    local count=$(kubectl get pods -n $namespace -l $label -o jsonpath='{.items[*].status.phase}' | tr ' ' '\n' | grep -c "Running")
    if [ $count -gt 0 ]; then
        echo -e "${GREEN}✓ $label pods are running in $namespace${NC}"
        return 0
    else
        echo -e "${RED}✗ $label pods are not running in $namespace${NC}"
        return 1
    fi
}

echo -e "${YELLOW}Starting project verification...${NC}\n"

# 1. Check cluster status
echo -e "${YELLOW}1. Checking cluster status...${NC}"
kubectl cluster-info
check_status "Cluster is accessible"

kubectl get nodes
check_status "Nodes are available"

# 2. Check namespaces
echo -e "\n${YELLOW}2. Checking namespaces...${NC}"
kubectl get namespaces | grep -E "hd-project|monitoring"
check_status "Required namespaces exist"

# 3. Check application deployments
echo -e "\n${YELLOW}3. Checking application deployments...${NC}"
check_pods_running "hd-project" "app=frontend"
check_pods_running "hd-project" "app=backend"
check_pods_running "hd-project" "app=postgres"

# 4. Check services
echo -e "\n${YELLOW}4. Checking services...${NC}"
kubectl get svc -n hd-project
check_status "Services are configured"

# 5. Check monitoring setup
echo -e "\n${YELLOW}5. Checking monitoring setup...${NC}"
check_pods_running "monitoring" "app.kubernetes.io/name=prometheus"
check_pods_running "monitoring" "app.kubernetes.io/name=grafana"

kubectl get servicemonitors -n monitoring
check_status "Service monitors are configured"

kubectl get prometheusrules -n monitoring
check_status "Prometheus rules are configured"

# 6. Check security
echo -e "\n${YELLOW}6. Checking security configuration...${NC}"
kubectl get networkpolicies -n hd-project
check_status "Network policies are configured"

kubectl get secrets -n hd-project
check_status "Secrets are configured"

# 7. Check documentation
echo -e "\n${YELLOW}7. Checking documentation...${NC}"
if [ -d "docs" ]; then
    echo -e "${GREEN}✓ Documentation directory exists${NC}"
    ls -la docs/
else
    echo -e "${RED}✗ Documentation directory missing${NC}"
fi

# 8. Check high availability
echo -e "\n${YELLOW}8. Checking high availability...${NC}"
kubectl get deployments -n hd-project -o jsonpath='{.items[*].spec.replicas}' | tr ' ' '\n' | while read replicas; do
    if [ $replicas -gt 1 ]; then
        echo -e "${GREEN}✓ Deployment has multiple replicas ($replicas)${NC}"
    else
        echo -e "${RED}✗ Deployment has only one replica${NC}"
    fi
done

# 9. Check resource limits
echo -e "\n${YELLOW}9. Checking resource limits...${NC}"
kubectl get pods -n hd-project -o yaml | grep -A 5 resources
check_status "Resource limits are configured"

# 10. Final status
echo -e "\n${YELLOW}Verification complete!${NC}"
echo -e "Please review the results above and ensure all components are properly configured."
echo -e "If any checks failed, please refer to the troubleshooting guide in docs/troubleshooting.md" 