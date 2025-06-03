# Troubleshooting Guide

## Table of Contents
1. [Build Issues](#build-issues)
2. [Test Failures](#test-failures)
3. [Deployment Problems](#deployment-problems)
4. [Runtime Issues](#runtime-issues)
5. [Monitoring Alerts](#monitoring-alerts)
6. [Security Issues](#security-issues)

## Build Issues

### Docker Build Failures
1. **Error**: `failed to compute cache key`
   - **Solution**: Clear Docker build cache
   ```bash
   docker builder prune
   ```

2. **Error**: `no space left on device`
   - **Solution**: Clean up unused Docker resources
   ```bash
   docker system prune -a
   ```

3. **Error**: `permission denied`
   - **Solution**: Check file permissions and Docker context
   ```bash
   chmod -R 755 .
   ```

### Jenkins Build Failures
1. **Error**: `workspace is locked`
   - **Solution**: Clear workspace lock
   ```bash
   rm -rf /var/jenkins_home/workspace/*/workspace@tmp
   ```

2. **Error**: `out of memory`
   - **Solution**: Increase Jenkins memory limits
   ```yaml
   resources:
     limits:
       memory: "4Gi"
   ```

## Test Failures

### Unit Tests
1. **Error**: `test timeout`
   - **Solution**: Increase test timeout
   ```java
   @Test(timeout = 5000)
   ```

2. **Error**: `flaky tests`
   - **Solution**: Add retry mechanism
   ```java
   @Retry(maxAttempts = 3)
   ```

### Integration Tests
1. **Error**: `database connection failed`
   - **Solution**: Check database health
   ```bash
   kubectl get pods -n hd-project
   ```

2. **Error**: `service unavailable`
   - **Solution**: Verify service health
   ```bash
   kubectl describe svc backend -n hd-project
   ```

## Deployment Problems

### Kubernetes Issues
1. **Error**: `ImagePullBackOff`
   - **Solution**: Check image registry access
   ```bash
   kubectl describe pod <pod-name> -n hd-project
   ```

2. **Error**: `CrashLoopBackOff`
   - **Solution**: Check pod logs
   ```bash
   kubectl logs <pod-name> -n hd-project
   ```

3. **Error**: `Pending`
   - **Solution**: Check resource constraints
   ```bash
   kubectl describe node
   ```

### Port Forwarding Issues
1. **Error**: `address already in use`
   - **Solution**: Kill existing port forwards
   ```bash
   lsof -i :<port>
   kill -9 <PID>
   ```

2. **Error**: `unable to forward port`
   - **Solution**: Check pod status
   ```bash
   kubectl get pods -n hd-project
   ```

## Runtime Issues

### Application Errors
1. **Error**: `500 Internal Server Error`
   - **Solution**: Check application logs
   ```bash
   kubectl logs -f deployment/backend -n hd-project
   ```

2. **Error**: `Connection Refused`
   - **Solution**: Verify service endpoints
   ```bash
   kubectl get endpoints -n hd-project
   ```

### Database Issues
1. **Error**: `connection pool exhausted`
   - **Solution**: Adjust connection pool size
   ```yaml
   spring:
     datasource:
       hikari:
         maximum-pool-size: 20
   ```

2. **Error**: `deadlock detected`
   - **Solution**: Check transaction isolation
   ```sql
   SHOW transaction_isolation;
   ```

## Monitoring Alerts

### High Error Rate
1. **Alert**: `HighErrorRate`
   - **Solution**: Check application logs
   ```bash
   kubectl logs -f deployment/backend -n hd-project
   ```

2. **Alert**: `HighLatency`
   - **Solution**: Check resource usage
   ```bash
   kubectl top pods -n hd-project
   ```

### Resource Issues
1. **Alert**: `HighMemoryUsage`
   - **Solution**: Scale up resources
   ```bash
   kubectl scale deployment backend --replicas=3 -n hd-project
   ```

2. **Alert**: `HighCPUUsage`
   - **Solution**: Optimize CPU usage
   ```bash
   kubectl describe pod <pod-name> -n hd-project
   ```

## Security Issues

### Dependency Vulnerabilities
1. **Alert**: `CriticalVulnerability`
   - **Solution**: Update dependencies
   ```bash
   ./gradlew dependencyUpdates
   ```

2. **Alert**: `OutdatedPackage`
   - **Solution**: Update package versions
   ```bash
   npm audit fix
   ```

### Container Security
1. **Alert**: `ContainerVulnerability`
   - **Solution**: Update base image
   ```dockerfile
   FROM openjdk:17-jdk-slim
   ```

2. **Alert**: `PrivilegedContainer`
   - **Solution**: Remove privileges
   ```yaml
   securityContext:
     privileged: false
   ```

## Common Commands

### Kubernetes
```bash
# Check pod status
kubectl get pods -n hd-project

# View pod logs
kubectl logs -f <pod-name> -n hd-project

# Describe resource
kubectl describe <resource> <name> -n hd-project

# Port forward
kubectl port-forward svc/<service> <local-port>:<remote-port> -n hd-project
```

### Docker
```bash
# List containers
docker ps -a

# View container logs
docker logs <container-id>

# Remove containers
docker rm -f $(docker ps -aq)

# Clean up images
docker image prune -a
```

### Monitoring
```bash
# Check Prometheus targets
curl localhost:9090/api/v1/targets

# View Grafana dashboards
open http://localhost:3001

# Check alert rules
kubectl get prometheusrules -n monitoring
```

## Best Practices
1. Always check logs first
2. Verify resource availability
3. Check network connectivity
4. Validate configuration
5. Monitor system metrics
6. Keep documentation updated
7. Use proper error handling
8. Implement health checks
9. Set up proper logging
10. Maintain backup procedures 