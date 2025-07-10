# Codex Metatron Platform Overview

The Codex Metatron Platform is a modular, multi-tenant platform designed with extraction-ready monorepo architecture. It provides a comprehensive suite of services for building and managing multi-tenant applications.

## 🎯 Platform Vision

Build a scalable, secure, and maintainable platform that can:
- **Scale with your business** - From monorepo to microservices
- **Secure multi-tenant architecture** - Proper tenant isolation and security
- **Developer-friendly** - Clear APIs, comprehensive documentation, and modern tooling
- **Future-proof** - Designed for extraction and independent service deployment

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Codex Metatron Platform                 │
├─────────────────────────────────────────────────────────────┤
│  Apps                Services              Libraries        │
│  ┌─────────────┐    ┌─────────────┐      ┌─────────────┐   │
│  │ CDX Pharaoh │    │ API Gateway │      │ UI Library  │   │
│  │ (Admin)     │    │             │      │             │   │
│  └─────────────┘    └─────────────┘      └─────────────┘   │
│  ┌─────────────┐    ┌─────────────┐      ┌─────────────┐   │
│  │ Core Server │    │ Auth Service│      │ Shared Libs │   │
│  │ (Legacy)    │    │             │      │             │   │
│  └─────────────┘    └─────────────┘      └─────────────┘   │
│  ┌─────────────┐    ┌─────────────┐      ┌─────────────┐   │
│  │ Client      │    │ CRM Service │      │ UI Components│   │
│  │ Template    │    │             │      │             │   │
│  └─────────────┘    └─────────────┘      └─────────────┘   │
│                     ┌─────────────┐                        │
│                     │ Analytics   │                        │
│                     │ Service     │                        │
│                     └─────────────┘                        │
│                     ┌─────────────┐                        │
│                     │Notification │                        │
│                     │ Service     │                        │
│                     └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────────────┐
                    │ Neon PostgreSQL │
                    │   Multi-tenant  │
                    │    Database     │
                    └─────────────────┘
```

## 🚀 Core Applications

### CDX Pharaoh (Admin Panel)
- **Purpose**: Super admin control panel for platform management
- **Technology**: React + TypeScript + Vite + TailwindCSS
- **Features**: User management, tenant administration, system monitoring
- **Location**: `apps/cdx-pharaoh/`

### Core Server (Legacy)
- **Purpose**: Monolithic server application (being decomposed)
- **Technology**: Node.js + Express + TypeScript
- **Status**: Being migrated to microservices
- **Location**: `apps/core-server/`

### Client Template
- **Purpose**: Template for building client applications
- **Technology**: React + TypeScript + Vite
- **Use Case**: Starting point for new client apps
- **Location**: `apps/client-template/`

## ⚙️ Microservices

### API Gateway
- **Purpose**: Request routing, load balancing, and API management
- **Technology**: Node.js + Express + TypeScript
- **Features**: Authentication middleware, rate limiting, service discovery
- **Location**: `services/api-gateway/`

### Auth Service
- **Purpose**: Authentication and authorization
- **Technology**: Node.js + Express + JWT + bcrypt
- **Features**: User authentication, role-based access control, session management
- **Location**: `services/auth-service/`

### CRM Service
- **Purpose**: Customer relationship management
- **Technology**: Node.js + Express + TypeScript
- **Features**: Customer management, interaction tracking, sales pipeline
- **Location**: `services/crm-service/`

### Analytics Service
- **Purpose**: Data analytics and reporting
- **Technology**: Node.js + Express + TypeScript
- **Features**: Usage analytics, performance metrics, business intelligence
- **Location**: `services/analytics-service/`

### Notification Service
- **Purpose**: Multi-channel notifications
- **Technology**: Node.js + Express + TypeScript
- **Features**: Email, SMS, push notifications, notification templates
- **Location**: `services/notification-service/`

## 📦 Shared Libraries

### UI Library
- **Purpose**: Advanced React components with Storybook
- **Technology**: React + TypeScript + Storybook + Jest
- **Features**: Design system components, interactive documentation
- **Location**: `libs/ui/`

### UI Components
- **Purpose**: Basic reusable React components
- **Technology**: React + TypeScript + Rollup
- **Features**: Atomic design components, utility functions
- **Location**: `libs/ui-components/`

### Shared Libraries
- **Purpose**: Common utilities, types, and business logic
- **Technology**: TypeScript
- **Features**: Database utilities, type definitions, helper functions
- **Location**: `libs/shared/`

## 🗄️ Database Architecture

### Multi-Tenant Design
- **Master Database**: Central tenant and user management
- **Tenant Isolation**: Schema-based or database-based isolation
- **Technology**: Neon PostgreSQL with connection pooling
- **Security**: Row-level security, encrypted connections

### Key Tables
- **Users**: User accounts and authentication
- **Tenants**: Tenant configuration and settings
- **Permissions**: Role-based access control
- **Audit Logs**: Security and compliance tracking

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Role-Based Access Control**: Granular permissions
- **Multi-Factor Authentication**: Enhanced security (planned)
- **Session Management**: Secure session handling

### Data Security
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: TLS/SSL connections
- **Input Validation**: Server-side validation
- **SQL Injection Protection**: Parameterized queries

### Tenant Isolation
- **Schema Isolation**: Separate schemas per tenant
- **Data Segregation**: Strict tenant data boundaries
- **Access Controls**: Tenant-scoped API access
- **Audit Trails**: Comprehensive logging

## 🛠️ Development Tools

### Monorepo Management
- **NX**: Build system and dependency management
- **TypeScript**: Type safety across all services
- **ESLint + Prettier**: Code quality and formatting
- **Jest**: Unit and integration testing

### Development Experience
- **Hot Reload**: Fast development iteration
- **Type Checking**: Compile-time error detection
- **Code Generation**: Automated boilerplate
- **Documentation**: Comprehensive docs and examples

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Matrix Testing**: Multiple Node.js versions
- **Service Isolation**: Independent service testing
- **Extraction Readiness**: Validation for service extraction

## 📈 Scalability Strategy

### Current State: Monorepo
- **Unified Development**: Single repository for all services
- **Shared Dependencies**: Common libraries and tools
- **Cross-Service Types**: Shared TypeScript interfaces
- **Integrated Testing**: End-to-end testing across services

### Future State: Microservices
- **Independent Repositories**: Each service in its own repo
- **Autonomous Teams**: Team ownership of services
- **Independent Deployment**: Service-specific CI/CD
- **API Contracts**: Stable interfaces between services

### Migration Path
- **Phase 1**: Service boundaries defined ✅
- **Phase 2**: Independent builds validated ✅
- **Phase 3**: Extract high-value services
- **Phase 4**: Gradual migration to microservices

## 🎯 Business Value

### For Developers
- **Rapid Development**: Shared components and utilities
- **Type Safety**: End-to-end TypeScript integration
- **Modern Tooling**: Latest React, Node.js, and TypeScript
- **Clear Architecture**: Well-defined service boundaries

### For Operations
- **Scalable Deployment**: Container-ready services
- **Monitoring**: Built-in health checks and metrics
- **Security**: Comprehensive security measures
- **Maintainability**: Clean code and documentation

### For Business
- **Multi-Tenant Ready**: Support multiple customers
- **Rapid Feature Development**: Reusable components
- **Compliance**: Security and audit capabilities
- **Cost Effective**: Efficient resource utilization

## 📚 Next Steps

1. **Getting Started**: Follow the [Getting Started Guide](getting-started.md)
2. **Development Setup**: Configure your [Development Environment](../development/setup.md)
3. **Architecture Deep Dive**: Read the [System Architecture](../architecture/system-overview.md)
4. **API Integration**: Check the [API Integration Guide](../guides/api-integration.md)

## 📞 Support

- **Technical Documentation**: See service-specific docs in [Services](../services/)
- **Development Questions**: Check [Development Guides](../development/)
- **Architecture Questions**: Review [Architecture Documentation](../architecture/)
- **Troubleshooting**: See [Troubleshooting Guide](../guides/troubleshooting.md)

---

*For detailed technical specifications, see individual service documentation.*