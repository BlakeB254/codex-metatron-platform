# Development Environment Setup

Comprehensive guide for setting up a robust development environment for the Codex Metatron Platform.

## 🎯 Development Environment Overview

The Codex Metatron Platform supports several development approaches:
- **Full Stack Development**: Run all services locally
- **Service-Focused Development**: Run only specific services
- **Frontend-Only Development**: Use remote APIs for backend services
- **API-Only Development**: Focus on backend services

## 🛠️ Required Tools

### Essential Tools
```bash
# Node.js (18+ required, 20+ recommended)
node --version  # Should be 18.0.0 or higher

# npm (comes with Node.js)
npm --version   # Should be 8.0.0 or higher

# Git for version control
git --version

# PostgreSQL client tools
psql --version
```

### Recommended Tools
```bash
# Docker for containerized development
docker --version
docker-compose --version

# GitHub CLI for repository management
gh --version

# jq for JSON processing
jq --version
```

## 🚀 Initial Setup

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/BlakeB254/codex-metatron-platform.git
cd codex-metatron-platform

# Install all dependencies (this includes workspaces)
npm install

# Verify NX is working
npx nx --version
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Create service-specific environment files
cp apps/cdx-pharaoh/.env.example apps/cdx-pharaoh/.env
```

### 3. Database Setup
```bash
# Test database connection
npm run validate:db

# Or test with direct connection string
npm run test:neon-local "postgresql://user:pass@host/db?sslmode=require"
```

## 🏗️ Development Modes

### Mode 1: Full Platform Development
**Use Case**: Working on cross-service features, integration testing

```bash
# Start everything
npm run dev:all

# Services running:
# - API Gateway: http://localhost:3000
# - Auth Service: http://localhost:3001
# - CRM Service: http://localhost:3002
# - Analytics Service: http://localhost:3003
# - Notification Service: http://localhost:3004
# - CDX Pharaoh: http://localhost:5173
```

### Mode 2: Service-Focused Development
**Use Case**: Working on specific service functionality

```bash
# Option A: Gateway + Specific Service
npm run dev:gateway &
npm run dev:auth &      # Replace with your target service
npm run dev:admin       # Optional: if you need UI

# Option B: Individual service development
cd services/auth-service
npm run dev

# Option C: Service with dependencies
npm run dev:gateway &   # Always needed as main entry
npm run dev:crm &       # Your target service
npm run dev:auth        # If CRM depends on auth
```

### Mode 3: Frontend-Only Development
**Use Case**: Working on UI components, admin panel

```bash
# Start only frontend applications
npm run dev:admin       # CDX Pharaoh admin panel

# Configure to use remote/staging APIs in .env:
VITE_API_URL=https://your-staging-api.com
```

### Mode 4: API-Only Development
**Use Case**: Backend service development, API testing

```bash
# Start core services only
npm run dev:services

# Test with curl or Postman
curl http://localhost:3000/health
```

## 📁 Project Structure Deep Dive

### Workspace Organization
```
codex-metatron-platform/
├── apps/                    # Standalone applications
│   ├── cdx-pharaoh/        # Admin panel (React + Vite)
│   ├── core-server/        # Legacy monolith (Express)
│   └── client-template/    # Template for new apps
├── services/               # Microservices
│   ├── api-gateway/        # Main API gateway (Express)
│   ├── auth-service/       # Authentication (Express + JWT)
│   ├── crm-service/        # Customer management (Express)
│   ├── analytics-service/  # Data analytics (Express)
│   └── notification-service/ # Notifications (Express)
├── libs/                   # Shared libraries
│   ├── ui/                 # UI components + Storybook
│   ├── ui-components/      # Basic React components
│   └── shared/             # Common utilities & types
├── docs/                   # Documentation
├── scripts/                # Development & deployment scripts
├── database/               # Database schemas & migrations
└── .github/                # CI/CD workflows
```

### Understanding NX Workspace
```bash
# See project dependency graph
npx nx graph

# See what can be built/tested
npx nx show projects

# Run specific project tasks
npx nx build api-gateway
npx nx test auth-service
npx nx lint cdx-pharaoh
```

## 🔧 Configuration Files

### Root Configuration
- `package.json` - Main package dependencies and scripts
- `nx.json` - NX workspace configuration
- `tsconfig.base.json` - Base TypeScript configuration
- `.env.example` - Environment variable template

### Service Configuration
Each service has its own:
- `package.json` - Service-specific dependencies
- `tsconfig.json` - Service TypeScript config
- `.env.example` - Service environment template

### App Configuration
Each app has its own:
- `package.json` - App dependencies
- `vite.config.ts` (for React apps) - Build configuration
- `tailwind.config.js` - Styling configuration

## 🗄️ Database Development

### Connection Management
```bash
# Test connection
npm run test:neon-local "your-connection-string"

# Validate schema and data
npm run validate:db

# Check database status from any service
curl http://localhost:3000/health  # Should include DB status
```

### Schema Management
```bash
# Database files location
ls database/
# - master-schema.sql      # Main database schema
# - tenant-schema.sql      # Tenant-specific schema
# - schema/complete-schema.sql  # Complete schema

# Apply schema changes (if migration scripts exist)
npm run db:migrate

# Seed test data (if available)
npm run db:seed
```

### Multi-Tenant Development
```bash
# Each tenant gets isolated data
# Current strategy: Schema-based isolation
# Tables: users, tenants, permissions, audit_logs

# Test tenant isolation
# Create test tenant via API or admin panel
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Tenant", "subdomain": "test"}'
```

## 🧪 Testing & Quality

### Running Tests
```bash
# All tests
npm run test

# Specific service tests
npx nx test auth-service

# UI component tests
npx nx test ui

# E2E tests (if configured)
npm run test:e2e
```

### Code Quality
```bash
# Linting
npm run lint
npm run lint:fix  # Auto-fix issues

# Type checking
npm run typecheck

# Formatting
npm run format
npm run format:check
```

### Storybook Development
```bash
# Start Storybook for UI components
npm run storybook

# Build Storybook
npm run build-storybook

# Access at: http://localhost:6006
```

## 🐛 Debugging

### Service Debugging
```bash
# Enable debug logging
DEBUG=true npm run dev:auth

# Or set in .env file
DEBUG_MODE=true
VERBOSE_LOGGING=true
```

### Database Debugging
```bash
# Check database connection
npm run validate:db

# Direct database access (if you have credentials)
psql "postgresql://user:pass@host/db?sslmode=require"

# Check service database connectivity
curl http://localhost:3001/health  # Auth service health
```

### Frontend Debugging
```bash
# React Developer Tools (browser extension)
# Redux DevTools (if using Redux)

# Check console for errors
# Network tab for API calls
# Use browser debugging tools
```

## 🚀 Advanced Development

### Docker Development
```bash
# Start with Docker Compose
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down

# Rebuild images
npm run docker:build
```

### Service Extraction Development
```bash
# Test service independence
npx nx build api-gateway  # Should build independently
npx nx test auth-service  # Should test independently

# Validate extraction readiness
npm run build:services    # All services should build
```

### Performance Monitoring
```bash
# Check service performance
curl http://localhost:3000/api/v1/status

# Monitor memory usage
ps aux | grep node

# Check database performance
npm run validate:db  # Includes performance metrics
```

## 🔐 Security Development

### Environment Security
```bash
# Never commit .env files
git status  # Should not show .env files

# Use .env.example for templates
# Rotate secrets regularly in production
```

### API Security Testing
```bash
# Test without authentication (should fail)
curl http://localhost:3000/api/v1/users

# Test with invalid token (should fail)
curl -H "Authorization: Bearer invalid-token" \
     http://localhost:3000/api/v1/users

# Test CORS
curl -H "Origin: http://evil-site.com" \
     http://localhost:3000/api/v1/health
```

## 🎯 Development Workflows

### Feature Development
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Start relevant services**: `npm run dev:gateway && npm run dev:target-service`
3. **Develop with hot reload**: Changes auto-refresh
4. **Test your changes**: `npm run test`
5. **Validate build**: `npm run build`
6. **Submit PR**: Use the PR template

### Bug Fixing
1. **Reproduce the bug**: Start affected services
2. **Debug**: Use logging, debugger, health checks
3. **Fix and test**: Ensure fix doesn't break other services
4. **Regression test**: Run full test suite

### Performance Optimization
1. **Baseline measurement**: Use validation scripts
2. **Identify bottlenecks**: Database, API, frontend
3. **Optimize**: Database queries, caching, bundling
4. **Measure improvement**: Re-run validation

## 📊 Monitoring & Metrics

### Development Metrics
```bash
# Build times
time npm run build

# Test coverage
npm run test:coverage

# Bundle sizes
npm run build && ls -la dist/
```

### Service Health Monitoring
```bash
# All service health checks
curl http://localhost:3000/health  # Gateway
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # CRM
curl http://localhost:3003/health  # Analytics
curl http://localhost:3004/health  # Notifications
```

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in .env file
2. **Database connection**: Check DATABASE_URL in .env
3. **Node version**: Ensure Node.js 18+
4. **Dependencies**: Run `npm install` in root and service directories

### Getting Help
- **Internal docs**: Check `docs/` directory
- **Service docs**: Each service has its own README
- **Troubleshooting**: [Troubleshooting Guide](../guides/troubleshooting.md)
- **GitHub Issues**: Report bugs and request features

## ✅ Development Checklist

### Daily Development
- [ ] Pull latest changes: `git pull origin main`
- [ ] Install new dependencies: `npm install`
- [ ] Validate database: `npm run validate:db`
- [ ] Start needed services
- [ ] Check health endpoints

### Before Committing
- [ ] Tests pass: `npm run test`
- [ ] Code lints: `npm run lint`
- [ ] Types check: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Documentation updated

### Before PR
- [ ] All services build independently
- [ ] Integration tests pass
- [ ] Documentation is current
- [ ] Security review complete

---

*Next: [Component Development Guide](components.md)*