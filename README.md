# Codex Metatron Platform

A modern, modular multi-tenant platform built with extraction-ready monorepo architecture. Designed to scale from unified development to independent microservices.

## 🏗️ Current Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Codex Metatron Platform                          │
├──────────────────────────────────────────────────────────────────────────┤
│                             API Gateway                                 │
│                         (Port 3000 - Main Entry)                       │
├──────────────────┬───────────────────┬──────────────────┬──────────────────┤
│   Auth Service   │   CRM Service     │ Analytics Service│Notification Svc  │
│   (Port 3001)    │   (Port 3002)     │   (Port 3003)    │   (Port 3004)    │
└──────────────────┴───────────────────┴──────────────────┴──────────────────┘
┌──────────────────────────────────────────────────────────────────────────┐
│                           Client Applications                           │
├──────────────────┬───────────────────┬──────────────────────────────────────┤
│   CDX Pharaoh    │   Core Server     │       Client Template               │
│ (Admin Panel)    │   (Legacy API)    │    (App Template)                    │
│  Port 5173       │   Port 3000       │      Port 3005                       │
│  React + Vite    │  Express + TS     │     React + Next.js                  │
└──────────────────┴───────────────────┴──────────────────────────────────────┘
                                    │
                         ┌──────────────────┐
                         │ Neon PostgreSQL  │
                         │  Multi-tenant    │
                         │    Database      │
                         └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (20.x recommended)
- **PostgreSQL client** tools (psql)
- **Neon PostgreSQL** Database (or local PostgreSQL)
- **Git** for version control

### 1. Clone and Setup
```bash
git clone https://github.com/BlakeB254/codex-metatron-platform.git
cd codex-metatron-platform

# Install all dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env file with your actual database credentials
```

### 2. Database Setup
```bash
# Validate database connection
npm run validate:db

# Test Neon database specifically
npm run test:neon-local "your-neon-connection-string"

# Initialize database schema (if needed)
./scripts/setup-database.sh
```

### 3. Start the Full Platform
```bash
# Start all microservices (Recommended)
npm run dev:all
# This starts:
# - API Gateway (Port 3000)
# - Auth Service (Port 3001) 
# - CRM Service (Port 3002)
# - Analytics Service (Port 3003)
# - Notification Service (Port 3004)
# - CDX Pharaoh Admin (Port 5173)

# OR start individual services
npm run dev:gateway     # API Gateway only
npm run dev:auth        # Auth Service only
npm run dev:crm         # CRM Service only
npm run dev:admin       # CDX Pharaoh Admin Panel only
```

### 4. Access Applications

#### Production URLs
- **🎛️ CDX Pharaoh (Admin Panel)**: http://localhost:5173
- **🚪 API Gateway (Main Entry)**: http://localhost:3000
- **🔐 Auth Service**: http://localhost:3001
- **👥 CRM Service**: http://localhost:3002
- **📊 Analytics Service**: http://localhost:3003
- **📧 Notification Service**: http://localhost:3004

#### Health Checks
- **Platform Health**: http://localhost:3000/health
- **Service Status**: http://localhost:3000/api/v1/status

#### Default Access
- **Default Login**: superadmin@codexmetatron.com / changeme123
- ⚠️ **IMPORTANT**: Change the default password immediately!

## 📋 Available Scripts

### Development
```bash
npm run dev:all         # Start all services and apps
npm run dev:services    # Start all microservices only
npm run dev:gateway     # Start API Gateway
npm run dev:auth        # Start Auth Service  
npm run dev:crm         # Start CRM Service
npm run dev:analytics   # Start Analytics Service
npm run dev:notifications # Start Notification Service
npm run dev:admin       # Start CDX Pharaoh Admin Panel
npm run dev:legacy      # Start legacy Core Server
```

### Database Operations
```bash
npm run validate:db     # Comprehensive database validation
npm run test:neon-local # Test Neon database connection
npm run db:setup        # Initialize database schema
npm run db:seed         # Seed with sample data
npm run db:migrate      # Run database migrations
```

### Building & Testing
```bash
npm run build           # Build all projects
npm run build:services  # Build all services
npm run build:admin     # Build admin panel
npm run test            # Run all tests
npm run test:services   # Test all services
npm run test:ui         # Test UI libraries
npm run lint            # Lint all code
npm run typecheck       # TypeScript type checking
```

### Docker Operations
```bash
npm run docker:up       # Start with Docker Compose
npm run docker:down     # Stop Docker containers
npm run docker:logs     # View container logs
npm run docker:build    # Build Docker images
```

## 🎯 Platform Components

### 🛡️ Core Services

#### API Gateway (`services/api-gateway`)
- **Purpose**: Main entry point, request routing, load balancing
- **Technology**: Node.js + Express + TypeScript
- **Port**: 3000
- **Features**: Authentication middleware, rate limiting, service discovery

#### Auth Service (`services/auth-service`)
- **Purpose**: Authentication and authorization
- **Technology**: Node.js + Express + JWT + bcrypt
- **Port**: 3001
- **Features**: User authentication, RBAC, session management

#### CRM Service (`services/crm-service`)
- **Purpose**: Customer relationship management
- **Technology**: Node.js + Express + TypeScript
- **Port**: 3002  
- **Features**: Customer management, interaction tracking, sales pipeline

#### Analytics Service (`services/analytics-service`)
- **Purpose**: Data analytics and reporting
- **Technology**: Node.js + Express + TypeScript
- **Port**: 3003
- **Features**: Usage analytics, performance metrics, business intelligence

#### Notification Service (`services/notification-service`)
- **Purpose**: Multi-channel notifications
- **Technology**: Node.js + Express + TypeScript  
- **Port**: 3004
- **Features**: Email, SMS, push notifications, templates

### 🖥️ Applications

#### CDX Pharaoh (`apps/cdx-pharaoh`)
- **Purpose**: Super admin control panel
- **Technology**: React + TypeScript + Vite + TailwindCSS
- **Port**: 5173
- **Features**: User management, tenant administration, system monitoring

#### Core Server (`apps/core-server`) - Legacy
- **Purpose**: Monolithic server (being decomposed)
- **Technology**: Node.js + Express + TypeScript
- **Port**: 3000 (overlaps with gateway - being migrated)
- **Status**: Being migrated to microservices

#### Client Template (`apps/client-template`)
- **Purpose**: Template for new client applications
- **Technology**: React + TypeScript + Next.js
- **Port**: 3005
- **Use Case**: Starting point for tenant applications

### 📦 Shared Libraries

#### UI Library (`libs/ui`)
- **Purpose**: Advanced React components with Storybook
- **Technology**: React + TypeScript + Storybook + Jest
- **Features**: Design system, interactive documentation

#### UI Components (`libs/ui-components`)
- **Purpose**: Basic reusable React components  
- **Technology**: React + TypeScript + Rollup
- **Features**: Atomic design components, utility functions

#### Shared Libraries (`libs/shared`)
- **Purpose**: Common utilities, types, and business logic
- **Technology**: TypeScript
- **Features**: Database utilities, type definitions, helpers

## 🗄️ Database Architecture

### Multi-Tenant Neon PostgreSQL
- **Master Database**: Central tenant and user management
- **Connection Pooling**: Optimized for serverless
- **Schema Isolation**: Tenant-specific data separation
- **Security**: Row-level security, encrypted connections

### Environment Configuration
```bash
# Required in .env file
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
MASTER_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Service Ports (customizable)
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
CRM_SERVICE_PORT=3002
ANALYTICS_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004
PHARAOH_APP_PORT=5173
```

## 🔄 Extraction Strategy

### Current State: Monorepo ✅
- **Unified Development**: Single repository for all services
- **Shared Dependencies**: Common libraries and tools
- **Cross-Service Types**: Shared TypeScript interfaces
- **Integrated Testing**: End-to-end testing across services

### Migration Readiness ✅
- **Independent Builds**: Each service builds independently
- **Service Isolation**: Services can run standalone
- **GitHub Actions**: Validates extraction readiness
- **Documentation**: Complete extraction strategy

### Future State: Microservices 🚀
- **Independent Repositories**: Each service in its own repo
- **Autonomous Teams**: Team ownership of services  
- **Independent Deployment**: Service-specific CI/CD
- **API Contracts**: Stable interfaces between services

## 🛠️ Development Tools

### Monorepo Management
- **NX**: Build system and dependency management
- **TypeScript**: Type safety across all services
- **ESLint + Prettier**: Code quality and formatting
- **Jest**: Unit and integration testing

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Matrix Testing**: Multiple Node.js versions (18.x, 20.x)
- **Service Isolation**: Independent service testing
- **Database Validation**: Neon database connectivity testing

## 📚 Documentation

### Quick Links
- **📖 [Complete Documentation](docs/README.md)** - Comprehensive platform docs
- **🏗️ [Platform Overview](docs/platform/README.md)** - Architecture and concepts
- **⚙️ [Development Setup](docs/development/setup.md)** - Local development guide
- **🔧 [API Integration](docs/guides/api-integration.md)** - Integration guide
- **🚨 [Troubleshooting](docs/guides/troubleshooting.md)** - Common issues and solutions

### Service Documentation
- [API Gateway Docs](docs/services/api-gateway/README.md)
- [Auth Service Docs](docs/services/auth-service/README.md)  
- [CRM Service Docs](docs/services/crm-service/README.md)
- [Analytics Service Docs](docs/services/analytics-service/README.md)
- [Notification Service Docs](docs/services/notification-service/README.md)

## 🎯 Production Readiness

### Security Features ✅
- **JWT Authentication**: Secure, stateless authentication
- **Role-Based Access Control**: Granular permissions
- **Input Validation**: Server-side validation with Zod
- **SQL Injection Protection**: Parameterized queries
- **Environment Security**: Secrets management

### Monitoring & Observability ✅
- **Health Checks**: Service-level health monitoring
- **Database Validation**: Connection and schema testing
- **Error Handling**: Comprehensive error management
- **Audit Logging**: Security and compliance tracking

### Deployment Options
- **Docker**: Container-ready services
- **CI/CD**: GitHub Actions pipeline
- **Database**: Neon PostgreSQL (production-ready)
- **Scaling**: Horizontal service scaling ready

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow development guidelines**: See [Development Docs](docs/development/)
4. **Update documentation**: Keep docs in sync with changes
5. **Submit pull request**: Use the PR template

## 📞 Support & Resources

- **🐛 Issues**: [GitHub Issues](https://github.com/BlakeB254/codex-metatron-platform/issues)
- **📖 Documentation**: [Complete Docs](docs/README.md)
- **🔧 Troubleshooting**: [Troubleshooting Guide](docs/guides/troubleshooting.md)
- **💬 Discussions**: [GitHub Discussions](https://github.com/BlakeB254/codex-metatron-platform/discussions)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🚀 Ready to build something amazing? Start with `npm run dev:all` and visit http://localhost:5173**

*Platform Version: 1.0.0*  
*Last Updated: $(date '+%Y-%m-%d')*