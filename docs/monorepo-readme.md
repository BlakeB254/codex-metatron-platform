# Codex Metatron Platform - Monorepo with Submodules

A modern, scalable multi-tenant platform built with a Git submodule-based monorepo architecture.

## 🏗️ Architecture Overview

This repository serves as the orchestrator for the Codex Metatron Platform, managing multiple services as Git submodules while keeping shared libraries and configurations in the main repository.

### Repository Structure

```
codex-metatron-platform/
├── apps/                    # Application submodules
│   ├── core-server/         # Core API server (Node.js + Express)
│   ├── cdx-pharaoh/        # Admin dashboard (React + Vite)
│   └── client-template/     # Tenant application template
├── services/               # Microservice submodules (future)
│   ├── auth-service/       # Authentication service
│   ├── tenant-service/     # Tenant management
│   └── cms-service/        # Content management
├── libs/                   # Shared libraries (main repo)
│   ├── shared/             # Shared utilities and types
│   ├── ui/                 # UI component library
│   └── infrastructure/     # Logging and monitoring
├── database/               # Database schemas and migrations
├── deployment/             # Docker and Kubernetes configs
├── docs/                   # Documentation
└── scripts/                # Development and deployment scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Git 2.13+ (for submodule support)
- Docker and Docker Compose (for local development)

### Initial Setup

```bash
# Clone the repository with all submodules
git clone --recursive https://github.com/codex-metatron/codex-metatron-platform.git
cd codex-metatron-platform

# Or if you already cloned without --recursive
git submodule update --init --recursive

# Install all dependencies
npm run install:all

# Set up development environment
./scripts/helpers/setup-dev-environment.sh
```

### Development

```bash
# Start all services in development mode
npm run dev

# Start specific services
npm run dev:server      # Core API server
npm run dev:admin       # Admin dashboard
npm run dev:client      # Client template

# Using Docker Compose (recommended for full stack)
docker-compose up
```

## 📦 Package Scripts

### Development
- `npm run dev` - Start core server and admin dashboard
- `npm run dev:all` - Start all services including client template
- `npm run dev:server` - Start only the core server
- `npm run dev:admin` - Start only the admin dashboard
- `npm run dev:client` - Start only the client template

### Building
- `npm run build` - Build shared libraries and all applications
- `npm run build:libs` - Build only shared libraries
- `npm run build:apps` - Build only applications

### Testing
- `npm run test` - Run tests for libraries and all applications
- `npm run test:libs` - Test only shared libraries
- `npm run test:apps` - Test only applications

### Submodule Management
- `npm run init` - Initialize all submodules and install dependencies
- `npm run update-submodules` - Update all submodules to latest
- `./scripts/submodule-manager.sh status` - Check submodule status

### Maintenance
- `npm run clean` - Clean all node_modules
- `npm run install:all` - Install dependencies everywhere
- `npm run format` - Format all code
- `npm run lint` - Lint all code

## 🔧 Submodule Management

We provide a comprehensive submodule manager script for common operations:

```bash
# Basic operations
./scripts/submodule-manager.sh init          # Initialize all submodules
./scripts/submodule-manager.sh update        # Update to latest
./scripts/submodule-manager.sh status        # Show status
./scripts/submodule-manager.sh install       # Install dependencies

# Development workflow
./scripts/submodule-manager.sh branch feature/new-feature
./scripts/submodule-manager.sh checkout main
./scripts/submodule-manager.sh pull
./scripts/submodule-manager.sh push

# Run commands across all submodules
./scripts/submodule-manager.sh foreach "npm install"
./scripts/submodule-manager.sh foreach "git status"
```

## 🔄 Development Workflow

### Working with Submodules

1. **Start work on a feature:**
   ```bash
   # Create feature branch in all repos
   ./scripts/submodule-manager.sh branch feature/my-feature
   ```

2. **Make changes in a submodule:**
   ```bash
   cd apps/core-server
   # Make your changes
   git add .
   git commit -m "Add new API endpoint"
   git push origin feature/my-feature
   ```

3. **Update the main repository:**
   ```bash
   cd ../..
   git add apps/core-server
   git commit -m "Update core-server submodule"
   git push origin feature/my-feature
   ```

4. **Pull latest changes:**
   ```bash
   ./scripts/submodule-manager.sh pull
   ```

### Creating a New Service

1. **Create the repository:**
   ```bash
   # Create repository on GitHub first, then:
   ./scripts/submodule-manager.sh add \
     https://github.com/codex-metatron/new-service.git \
     services/new-service
   ```

2. **Set up the service:**
   ```bash
   cd services/new-service
   # Set up your service code
   npm init -y
   # Add your code, package.json scripts, etc.
   ```

3. **Update build system:**
   ```bash
   # Update package.json scripts to include new service
   # Update CI/CD configuration
   # Update Docker Compose if needed
   ```

## 🏗️ Project Structure Details

### Applications (`apps/`)

#### Core Server (`apps/core-server`)
- **Technology**: Node.js + Express + TypeScript
- **Purpose**: Main API server and authentication
- **Key Features**: Multi-tenant support, RESTful API, JWT authentication

#### Admin Dashboard (`apps/cdx-pharaoh`)
- **Technology**: React + TypeScript + Vite + TailwindCSS
- **Purpose**: Platform administration interface
- **Key Features**: Tenant management, system monitoring, user administration

#### Client Template (`apps/client-template`)
- **Technology**: React + TypeScript + Vite
- **Purpose**: Template for tenant-specific applications
- **Key Features**: Customizable branding, tenant-specific features

### Shared Libraries (`libs/`)

#### UI Components (`libs/ui`)
- Reusable React components
- TailwindCSS styling
- Storybook documentation
- Sacred geometry design system

#### Shared Utilities (`libs/shared`)
- Common TypeScript types
- Utility functions
- Validation schemas
- Constants and configurations

#### Infrastructure (`libs/infrastructure`)
- Logging utilities
- Monitoring and metrics
- Error handling
- Performance tracking

## 🚢 Deployment

### Local Development
```bash
# Using npm scripts
npm run dev

# Using Docker Compose (full stack)
docker-compose up
```

### Production Deployment

Each service can be deployed independently:

1. **Core Server**: Deploy to your preferred Node.js hosting platform
2. **Admin Dashboard**: Build and deploy as static assets
3. **Client Template**: Template for tenant deployments

### Environment Variables

Each service manages its own environment variables. See individual service repositories for specific requirements.

## 🧪 Testing

### Running Tests
```bash
# All tests
npm run test

# Specific test suites
npm run test:libs
npm run test:apps

# Individual service tests
cd apps/core-server && npm test
```

### Test Structure
- **Unit Tests**: Each service and library has its own test suite
- **Integration Tests**: Cross-service integration testing
- **E2E Tests**: Full application flow testing

## 📚 Documentation

- **API Documentation**: See individual service repositories
- **Component Documentation**: Run `npm run storybook` in `libs/ui`
- **Architecture Decisions**: See `docs/` directory
- **Migration Guide**: See `docs/monorepo-migration-guide.md`

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes in appropriate submodules
4. Test your changes: `npm run test`
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all CI checks pass

### Code Style
- ESLint and Prettier configurations are enforced
- Run `npm run format` before committing
- Follow the established patterns in each service

## 🔧 Troubleshooting

### Common Issues

#### Submodule Not Initialized
```bash
git submodule update --init --recursive
```

#### Submodule on Wrong Commit
```bash
cd apps/service-name
git checkout main
git pull origin main
cd ../..
git add apps/service-name
git commit -m "Update service-name submodule"
```

#### Build Failures
1. Ensure all dependencies are installed: `npm run install:all`
2. Check shared library versions
3. Verify environment variables
4. Check individual service logs

#### Permission Issues
- Verify GitHub access tokens
- Check SSH key configuration
- Ensure repository permissions

### Getting Help

1. Check the troubleshooting guide: `docs/troubleshooting.md`
2. Review individual service documentation
3. Check GitHub Issues
4. Contact the development team

## 📊 Monitoring and Analytics

- **Performance Monitoring**: Integrated with each service
- **Error Tracking**: Centralized error reporting
- **Usage Analytics**: Platform-wide usage tracking
- **Health Checks**: Automated service health monitoring

## 🔐 Security

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encryption at rest and in transit
- **Security Headers**: Comprehensive security header configuration
- **Dependency Scanning**: Automated vulnerability scanning

## 📈 Performance

- **Caching**: Redis-based caching strategy
- **CDN**: Static asset delivery optimization
- **Database**: Optimized queries and indexing
- **Monitoring**: Real-time performance tracking

## 🚀 Roadmap

- [ ] Microservices extraction
- [ ] Kubernetes deployment
- [ ] Advanced monitoring and alerting
- [ ] Multi-region deployment
- [ ] Enhanced security features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Technical Lead**: [Name]
- **DevOps Lead**: [Name]
- **Frontend Lead**: [Name]
- **Backend Lead**: [Name]

---

For more detailed information, see the individual service repositories and documentation in the `docs/` directory.