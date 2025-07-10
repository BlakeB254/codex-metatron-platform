# Getting Started with Codex Metatron Platform

This guide will help you quickly set up and start developing on the Codex Metatron Platform.

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites Check
```bash
# Check Node.js version (18+ required, 20+ recommended)
node --version

# Check npm version
npm --version

# Check if you have PostgreSQL client tools
psql --version
```

### 2. Clone and Install
```bash
# Clone the repository
git clone https://github.com/BlakeB254/codex-metatron-platform.git
cd codex-metatron-platform

# Install all dependencies (this will take a few minutes)
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your database credentials
# Use your favorite editor: nano, vim, vscode, etc.
nano .env
```

Required environment variables:
```bash
# Your Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require

# Same as DATABASE_URL for now
MASTER_DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require

# JWT secrets (change these in production!)
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
```

### 4. Database Validation
```bash
# Test your database connection
npm run validate:db

# If that works, you're ready to go!
```

### 5. Start Development
```bash
# Start all services (recommended for beginners)
npm run dev:all

# This will start:
# - API Gateway (Port 3000)
# - Auth Service (Port 3001)
# - CRM Service (Port 3002)
# - Analytics Service (Port 3003)
# - Notification Service (Port 3004)
# - CDX Pharaoh Admin Panel (Port 5173)
```

### 6. Verify Setup
Open your browser and visit:
- **Admin Panel**: http://localhost:5173
- **API Health Check**: http://localhost:3000/health

## 🎯 Your First Steps

### 1. Explore the Admin Panel
- Visit http://localhost:5173
- Login with: `superadmin@codexmetatron.com` / `changeme123`
- **Important**: Change this password immediately!

### 2. Check Service Health
```bash
# Test individual services
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # CRM Service
```

### 3. Explore the API
```bash
# Get API status
curl http://localhost:3000/api/v1/status

# Test authentication (this should fail without token)
curl http://localhost:3000/api/v1/users
```

## 🛠️ Development Workflow

### Starting Services Individually
```bash
# Start only what you need for development

# API Gateway (main entry point)
npm run dev:gateway

# Authentication service
npm run dev:auth

# CRM service
npm run dev:crm

# Admin panel
npm run dev:admin
```

### Working with the Database
```bash
# Test database connection
npm run test:neon-local "your-connection-string"

# Run database migrations (if available)
npm run db:migrate

# Seed test data (if available)
npm run db:seed
```

### Building and Testing
```bash
# Build all services
npm run build

# Run all tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📁 Project Structure Overview

```
codex-metatron-platform/
├── apps/                    # Applications
│   ├── cdx-pharaoh/        # Admin panel (React)
│   ├── core-server/        # Legacy server (being migrated)
│   └── client-template/    # Template for new apps
├── services/               # Microservices
│   ├── api-gateway/        # Main API gateway
│   ├── auth-service/       # Authentication
│   ├── crm-service/        # Customer management
│   ├── analytics-service/  # Analytics and reporting
│   └── notification-service/ # Notifications
├── libs/                   # Shared libraries
│   ├── ui/                 # UI component library
│   ├── ui-components/      # Basic components
│   └── shared/             # Common utilities
├── docs/                   # Documentation (you are here!)
├── scripts/                # Utility scripts
└── database/               # Database schemas
```

## 🧭 Where to Go Next

### For Frontend Developers
1. **Start with CDX Pharaoh**: `apps/cdx-pharaoh/`
2. **Explore UI Components**: `libs/ui/` and `libs/ui-components/`
3. **Read Component Docs**: [Component Development Guide](../development/components.md)

### For Backend Developers
1. **Check out services**: `services/` directory
2. **Start with API Gateway**: `services/api-gateway/`
3. **Read API Docs**: [API Integration Guide](../guides/api-integration.md)

### For DevOps Engineers
1. **Review deployment**: [Deployment Guide](../deployment/README.md)
2. **Check CI/CD**: `.github/workflows/`
3. **Read extraction strategy**: [Extraction Strategy](../architecture/extraction-strategy.md)

### For Product Managers
1. **Platform Overview**: [Platform README](README.md)
2. **Business Requirements**: [Product Requirements](product-requirements.md)
3. **Architecture Overview**: [System Architecture](../architecture/system-overview.md)

## 🚨 Common Issues

### Database Connection Issues
```bash
# Check your .env file has correct DATABASE_URL
cat .env | grep DATABASE_URL

# Test connection directly
npm run test:neon-local "your-connection-string"

# Check if Neon database is accessible
ping your-neon-hostname
```

### Port Conflicts
If you get "port already in use" errors:
```bash
# Check what's using the port
lsof -i :3000  # or whatever port is conflicting

# Kill the process if needed
kill -9 PID

# Or use different ports in .env file
```

### Node.js Version Issues
```bash
# Check your Node.js version
node --version

# If < 18, update Node.js
# Use nvm (recommended): nvm install 20 && nvm use 20
# Or download from: https://nodejs.org/
```

### Permission Issues
```bash
# If you get permission errors with npm
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Or use sudo (not recommended)
sudo npm install
```

## 💡 Pro Tips

### 1. Use Service-Specific Development
Instead of running all services, run only what you need:
```bash
# Working on auth? Just run auth + gateway
npm run dev:gateway &
npm run dev:auth &
npm run dev:admin  # If you need the UI
```

### 2. Monitor Service Health
Keep health checks open in browser tabs:
- http://localhost:3000/health (Gateway)
- http://localhost:3001/health (Auth)
- http://localhost:3002/health (CRM)

### 3. Use the Database Validation
Before starting development each day:
```bash
npm run validate:db
```

### 4. Keep Documentation Updated
When you add features, update the relevant docs in `docs/`

## 📞 Getting Help

- **Troubleshooting**: [Troubleshooting Guide](../guides/troubleshooting.md)
- **Service Issues**: Check service-specific docs in `docs/services/`
- **Development Questions**: See [Development Guides](../development/)
- **GitHub Issues**: Report bugs and request features

## ✅ Success Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured
- [ ] Database connection validated
- [ ] All services starting successfully
- [ ] Admin panel accessible at http://localhost:5173
- [ ] API health checks passing
- [ ] Default login working (and password changed!)

**🎉 Congratulations! You're ready to start developing on the Codex Metatron Platform.**

---

*Next: [Development Setup](../development/setup.md) for advanced configuration*