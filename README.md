# Multi-Tenant SaaS Task Management Platform

A scalable, secure, and cost-efficient task management platform built with Kubernetes, demonstrating advanced cloud orchestration and multi-tenancy.

## Architecture Overview

### Components
- **Frontend**: Vue.js application served via Nginx
- **Backend**: Node.js (Fastify) REST API
- **Database**: PostgreSQL with schema-based tenant isolation
- **Authentication**: JWT-based authentication
- **Infrastructure**: Kubernetes with Terraform and Helm
- **Monitoring**: Prometheus, Grafana, and Loki

### Key Features
- Multi-tenant architecture with isolated workspaces
- Schema-based database isolation
- Kubernetes-native deployment
- Auto-scaling based on custom metrics
- Comprehensive monitoring and observability
- CI/CD pipeline with GitHub Actions

## Project Structure
```
.
├── frontend/           # Vue.js application
├── backend/           # Node.js Fastify API
├── k8s/              # Kubernetes configurations
│   ├── base/         # Kustomize base configurations
│   └── helm-charts/  # Helm charts for deployment
├── terraform/        # Infrastructure as Code
├── monitoring/       # Prometheus, Grafana, and Loki configs
├── migrations/       # Database migration files
└── scripts/          # Utility scripts
```

## Prerequisites
- Docker
- Kubernetes (Kind for local development)
- Terraform
- Helm
- Node.js
- PostgreSQL

## Getting Started

1. Clone the repository
2. Set up local development environment:
   ```bash
   # Start local Kubernetes cluster
   ./scripts/setup-local.sh
   
   # Install dependencies
   npm install
   
   # Run database migrations
   node scripts/db-migrate.js
   
   # Start development servers
   npm run dev
   ```

3. Deploy to production:
   ```bash
   # Initialize Terraform
   terraform init
   
   # Apply infrastructure
   terraform apply
   
   # Deploy application
   helm upgrade --install task-management ./k8s/helm-charts
   ```

## Development

### Local Development
- Frontend: `npm run dev` in frontend directory
- Backend: `npm run dev` in backend directory
- Database: Docker Compose for local PostgreSQL

### Database Management
- Run migrations: `node scripts/db-migrate.js`
- Create new tenant: `./scripts/manage-tenant.js create <name> <email> <password> [adminName]`
- Delete tenant: `./scripts/manage-tenant.js delete <tenantId>`
- List tenants: `./scripts/manage-tenant.js list`

### Testing
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`

## Monitoring
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`
- Loki: `http://localhost:3100`

## License
MIT

## Author
Siddhant Gupta 