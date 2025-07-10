# Codex Metatron Platform Documentation

Welcome to the comprehensive documentation for the Codex Metatron Platform - a modular, multi-tenant platform built with extraction-ready monorepo architecture.

## 📚 Documentation Structure

### 🏗️ Platform Overview
- [**Platform Overview**](platform/README.md) - High-level platform architecture and concepts
- [**Getting Started**](platform/getting-started.md) - Quick start guide for developers
- [**Technology Stack**](platform/tech-stack.md) - Technologies and tools used across the platform

### 🚀 Applications
- [**CDX Pharaoh**](apps/cdx-pharaoh/README.md) - Admin control panel application
- [**Core Server**](apps/core-server/README.md) - Legacy monolithic server application
- [**Client Template**](apps/client-template/README.md) - Template for client applications

### ⚙️ Services  
- [**API Gateway**](services/api-gateway/README.md) - Request routing and load balancing
- [**Auth Service**](services/auth-service/README.md) - Authentication and authorization
- [**CRM Service**](services/crm-service/README.md) - Customer relationship management
- [**Analytics Service**](services/analytics-service/README.md) - Data analytics and reporting
- [**Notification Service**](services/notification-service/README.md) - Email, SMS, and push notifications

### 📦 Libraries
- [**UI Components**](libs/ui-components/README.md) - Reusable React component library
- [**UI Library**](libs/ui/README.md) - Advanced UI components with Storybook
- [**Shared Libraries**](libs/shared/README.md) - Common utilities and types

### 🛠️ Development
- [**Development Setup**](development/setup.md) - Local development environment setup
- [**Component Development**](development/components.md) - Component development guidelines
- [**Database Setup**](development/database.md) - Database configuration and migrations
- [**Testing Strategy**](development/testing.md) - Testing guidelines and best practices
- [**Code Style**](development/code-style.md) - Coding standards and conventions

### 🚀 Deployment
- [**Deployment Guide**](deployment/README.md) - Deployment strategies and environments
- [**Database Deployment**](deployment/database.md) - Database deployment and migrations
- [**Docker Setup**](deployment/docker.md) - Containerization and orchestration
- [**CI/CD Pipeline**](deployment/ci-cd.md) - Continuous integration and deployment

### 🔒 Security
- [**Security Overview**](security/README.md) - Security architecture and practices
- [**Database Security**](security/database.md) - Database security configuration
- [**API Security**](security/api-security.md) - API authentication and authorization
- [**Secrets Management**](security/secrets.md) - Managing environment variables and secrets

### 🏗️ Architecture
- [**System Architecture**](architecture/system-overview.md) - High-level system design
- [**Multi-Database Architecture**](architecture/multi-database.md) - Database architecture and tenant isolation
- [**Microservices Architecture**](architecture/microservices.md) - Service decomposition strategy
- [**Extraction Strategy**](architecture/extraction-strategy.md) - Monorepo to multi-repo migration

### 📖 Guides
- [**API Integration Guide**](guides/api-integration.md) - How to integrate with platform APIs
- [**SDK Usage Guide**](guides/sdk-usage.md) - Using the platform SDKs
- [**Troubleshooting**](guides/troubleshooting.md) - Common issues and solutions
- [**Migration Guide**](guides/migration.md) - Migrating from legacy systems

## 🔍 Quick Navigation

### For New Developers
1. Start with [Platform Overview](platform/README.md)
2. Follow [Getting Started](platform/getting-started.md)
3. Set up [Development Environment](development/setup.md)

### For Service Developers
1. Review [Microservices Architecture](architecture/microservices.md)
2. Check [Service-specific documentation](services/)
3. Follow [Development Guidelines](development/)

### For DevOps Engineers
1. Review [Deployment Guide](deployment/README.md)
2. Set up [CI/CD Pipeline](deployment/ci-cd.md)
3. Configure [Security](security/)

### For Integration Partners
1. Read [API Integration Guide](guides/api-integration.md)
2. Use [SDK Documentation](guides/sdk-usage.md)
3. Check [Troubleshooting](guides/troubleshooting.md)

## 📋 Documentation Standards

- **Markdown Format**: All documentation uses GitHub-flavored markdown
- **Clear Structure**: Each document has clear headings and navigation
- **Code Examples**: Include practical examples where applicable
- **Keep Updated**: Documentation is updated with code changes
- **Cross-References**: Link between related documents

## 🤝 Contributing

When adding new features or services:
1. Update relevant documentation in the appropriate `docs/` subdirectory
2. Add links to the main navigation in this README
3. Follow the established documentation structure
4. Include code examples and practical guidance

## 📞 Support

- **Technical Issues**: See [Troubleshooting Guide](guides/troubleshooting.md)
- **Development Questions**: Check service-specific documentation
- **Architecture Questions**: Review [Architecture Documentation](architecture/)

---

*Last Updated: $(date '+%Y-%m-%d')*
*Platform Version: 1.0.0*