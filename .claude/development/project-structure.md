# Project Structure - Codex Metatron Platform

## Overview
This document defines the official project structure for the Codex Metatron Platform monorepo. All development must follow this structure to ensure consistency and maintainability.

## Root Structure
```
codex-metatron-platform/
├── .claude/                    # Claude Code documentation
│   ├── README.md              # Main development guide
│   ├── project/               # Project requirements and architecture
│   ├── development/           # Development guidelines and standards
│   ├── security/              # Security protocols and checklists
│   ├── deployment/            # Deployment guides and configurations
│   ├── quality/               # Quality assurance and testing
│   └── workflows/             # Git workflows and processes
├── apps/                      # Applications (deployable services)
│   ├── core-server/           # Main API gateway and tenant routing
│   ├── cdx-pharaoh/           # SuperAdmin dashboard (React + Vite)
│   ├── client-template/       # Template for tenant applications (Next.js)
│   └── services/              # Microservices
│       ├── cms-service/       # Content Management Service
│       ├── auth-service/      # Authentication Service
│       ├── billing-service/   # Billing and Subscription Service
│       ├── crm-service/       # Customer Relationship Management
│       ├── client-service/    # Client Data Management
│       └── admin-service/     # Admin Operations Service
├── libs/                      # Shared libraries and utilities
│   ├── shared/                # Core shared functionality
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   ├── database/          # Database connection and utilities
│   │   └── tenant-context/    # Tenant isolation utilities
│   ├── ui/                    # Shared UI component library
│   │   ├── src/
│   │   │   ├── atoms/         # Basic UI elements
│   │   │   ├── molecules/     # Simple component combinations
│   │   │   ├── organisms/     # Complex UI sections
│   │   │   └── templates/     # Page-level layouts
│   │   └── themes/            # Sacred geometry theme system
│   └── infrastructure/        # Infrastructure utilities
│       ├── monitoring/        # Health checks and metrics
│       └── logging/           # Centralized logging
├── packages/                  # NPM packages (for publishing)
│   ├── cms-sdk/               # CMS integration SDK
│   └── create-codex-app/      # CLI tool for app creation
├── database/                  # Database schemas and migrations
│   ├── master-schema.sql      # Master database schema
│   ├── tenant-schema.sql      # Tenant database schema
│   └── migrations/            # Database migration scripts
├── deployment/                # Deployment configurations
│   ├── docker/                # Docker configurations
│   ├── k8s/                   # Kubernetes manifests
│   └── nginx/                 # Nginx configurations
├── scripts/                   # Utility scripts
│   ├── setup.ts              # Project setup script
│   ├── seed.ts               # Database seeding
│   └── migrate.ts            # Migration runner
└── docs/                      # Additional documentation
    ├── api/                   # API documentation
    └── setup/                 # Setup guides
```

## Applications (`apps/`)

### Core Server (`apps/core-server/`)
**Purpose**: Main API gateway with tenant routing and authentication
**Technology**: Express.js + TypeScript
**Port**: 3000

```
apps/core-server/
├── src/
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Express middleware
│   │   ├── tenant.ts         # Tenant context extraction
│   │   ├── auth-middleware.ts # JWT authentication
│   │   └── error-handler.ts   # Error handling
│   ├── routes/                # API route definitions
│   │   ├── auth.ts           # Authentication routes
│   │   ├── tenant.ts         # Tenant management
│   │   ├── health.ts         # Health check endpoints
│   │   └── service.ts        # Service management
│   ├── services/              # Business logic services
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   └── server.ts             # Main server entry point
├── package.json
└── tsconfig.json
```

### CDXPharaoh Dashboard (`apps/cdx-pharaoh/`)
**Purpose**: SuperAdmin dashboard for platform management
**Technology**: React + Vite + TypeScript
**Port**: 5173

```
apps/cdx-pharaoh/
├── src/
│   ├── components/            # React components
│   │   ├── Layout.tsx        # Main layout wrapper
│   │   ├── Header.tsx        # Header component
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   └── dashboard/        # Dashboard-specific components
│   │       ├── ServiceHealthGrid.tsx
│   │       ├── SystemStatsCards.tsx
│   │       ├── RecentActivity.tsx
│   │       ├── TenantQuickView.tsx
│   │       ├── SystemMetrics.tsx
│   │       └── AlertsList.tsx
│   ├── contexts/              # React context providers
│   │   └── AuthContext.tsx   # Authentication context
│   ├── pages/                 # Page components
│   │   ├── LoginPage.tsx     # Login interface
│   │   ├── DashboardPage.tsx # Main dashboard
│   │   ├── TenantsPage.tsx   # Tenant management
│   │   ├── ServicesPage.tsx  # Service monitoring
│   │   └── SettingsPage.tsx  # System settings
│   ├── services/              # API service functions
│   │   └── authService.ts    # Authentication API calls
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── App.tsx               # Main application component
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Client Template (`apps/client-template/`)
**Purpose**: Template for tenant Next.js applications
**Technology**: Next.js 14+ + TypeScript + TailwindCSS
**Port**: 3001

```
apps/client-template/
├── app/                       # Next.js App Router
│   ├── [...slug]/             # Dynamic CMS routes
│   │   └── page.tsx          # CMS page renderer
│   ├── api/                   # API routes
│   │   └── revalidate/       # ISR revalidation
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/                # React components
│   ├── cms/                  # CMS-specific components
│   │   ├── Hero.tsx          # Hero section
│   │   ├── Features.tsx      # Features grid
│   │   ├── Testimonials.tsx  # Testimonials section
│   │   └── CTA.tsx           # Call-to-action
│   ├── theme/                # Theme-specific components
│   │   ├── ancient-khemet/   # Egyptian theme
│   │   ├── emerald-tablets/  # Mystical theme
│   │   ├── knights-templar/  # Medieval theme
│   │   ├── skybound/         # Celestial theme
│   │   └── sttc/             # Modern tech theme
│   └── layout/               # Layout components
├── lib/                      # Utility libraries
│   ├── cms-config.ts         # CMS configuration
│   └── component-map.ts      # Component registry
├── .env.example              # Environment template
└── README.md                 # Integration guide
```

### Microservices (`apps/services/`)

Each microservice follows this structure:

```
apps/services/[service-name]/
├── src/
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── models/                # Data models
│   ├── middleware/            # Service-specific middleware
│   ├── routes/                # API routes
│   ├── types/                 # TypeScript types
│   └── main.ts               # Service entry point
├── tests/                     # Service tests
├── package.json
└── tsconfig.json
```

## Libraries (`libs/`)

### Shared Library (`libs/shared/`)
**Purpose**: Core shared functionality across all applications

```
libs/shared/
├── types/                     # TypeScript type definitions
│   ├── tenant.ts             # Tenant-related types
│   ├── auth.ts               # Authentication types
│   ├── api.ts                # API response types
│   └── index.ts              # Type exports
├── utils/                     # Utility functions
│   ├── api-client.ts         # API client utilities
│   ├── validation.ts         # Input validation
│   ├── date-helpers.ts       # Date manipulation
│   └── index.ts              # Utility exports
├── database/                  # Database utilities
│   ├── connection.ts         # Database connection manager
│   ├── tenant-db.ts          # Tenant database utilities
│   └── migrations.ts         # Migration helpers
└── tenant-context/            # Tenant isolation utilities
    ├── middleware.ts         # Tenant middleware
    ├── context.ts            # Tenant context manager
    └── index.ts              # Context exports
```

### UI Library (`libs/ui/`)
**Purpose**: Shared UI components with atomic design principles

```
libs/ui/
├── src/
│   ├── atoms/                 # Basic building blocks
│   │   ├── Button/           # Button component
│   │   ├── Input/            # Input component
│   │   ├── Text/             # Text component
│   │   └── index.ts          # Atom exports
│   ├── molecules/             # Simple combinations
│   │   ├── Card/             # Card component
│   │   ├── SearchBox/        # Search component
│   │   └── index.ts          # Molecule exports
│   ├── organisms/             # Complex sections
│   │   ├── Header/           # Header component
│   │   ├── Footer/           # Footer component
│   │   └── index.ts          # Organism exports
│   └── templates/             # Page layouts
│       ├── LandingPage/      # Landing page template
│       └── index.ts          # Template exports
├── themes/                    # Sacred geometry themes
│   ├── ancient-khemet.ts     # Egyptian theme
│   ├── emerald-tablets.ts    # Mystical theme
│   ├── knights-templar.ts    # Medieval theme
│   ├── skybound.ts           # Celestial theme
│   ├── sttc.ts               # Modern tech theme
│   └── index.ts              # Theme exports
├── package.json
└── tsconfig.json
```

## Packages (`packages/`)

### CMS SDK (`packages/cms-sdk/`)
**Purpose**: NPM package for CMS integration
**Package Name**: `@codex-metatron/cms-sdk`

```
packages/cms-sdk/
├── src/
│   ├── client/                # CMS client
│   │   └── cms-client.ts     # Main CMS client class
│   ├── components/            # React components
│   │   ├── CMSRenderer.tsx   # Component renderer
│   │   ├── CMSPage.tsx       # Page component
│   │   └── index.tsx         # Component exports
│   ├── hooks/                 # React hooks
│   │   ├── use-cms.ts        # CMS hook
│   │   └── index.ts          # Hook exports
│   ├── types/                 # TypeScript types
│   │   └── index.ts          # Type definitions
│   └── index.ts              # Main package export
├── package.json
└── tsconfig.json
```

### CLI Tool (`packages/create-codex-app/`)
**Purpose**: CLI for creating new client applications
**Package Name**: `create-codex-app`

```
packages/create-codex-app/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # CLI commands
│   ├── templates/            # Project templates
│   └── utils/                # CLI utilities
├── bin/
│   └── create-codex-app.js   # Executable script
├── package.json
└── README.md
```

## Naming Conventions

### Applications
- **Folder Names**: kebab-case (`core-server`, `cdx-pharaoh`)
- **File Names**: PascalCase for components (`DashboardPage.tsx`)
- **File Names**: kebab-case for utilities (`auth-service.ts`)

### Libraries
- **Folder Names**: kebab-case (`shared`, `ui`)
- **Component Names**: PascalCase (`Button`, `ServiceHealthGrid`)
- **Hook Names**: camelCase with "use" prefix (`useCMS`, `useAuth`)

### Types
- **Interface Names**: PascalCase (`TenantData`, `ServiceHealth`)
- **Type Names**: PascalCase (`ApiResponse`, `ComponentProps`)
- **Enum Names**: PascalCase (`ServiceStatus`, `TenantTier`)

## Development Workflow

### Adding New Applications
1. Create directory in `apps/`
2. Initialize with proper package.json
3. Add to workspace configuration
4. Follow established patterns

### Adding New Libraries
1. Create directory in `libs/`
2. Set up atomic design structure (for UI)
3. Configure TypeScript properly
4. Export through index files

### Adding New Packages
1. Create directory in `packages/`
2. Set up for NPM publishing
3. Configure build process
4. Add proper documentation

## Import Patterns

### Internal Imports
```typescript
// From shared libraries
import { TenantData } from '@codex-metatron/shared/types';
import { DatabaseManager } from '@codex-metatron/shared/database';

// From UI library
import { Button, Card } from '@codex-metatron/ui';

// Relative imports within same app
import { Header } from '../components/Header';
import { useAuth } from '../hooks/useAuth';
```

### External Package Imports
```typescript
// Published packages
import { cms } from '@codex-metatron/cms-sdk';

// Standard npm packages
import React from 'react';
import axios from 'axios';
```

## Build and Deployment

### Development
```bash
# Start all applications
npm run dev

# Start specific application
npm run dev:server
npm run dev:admin
npm run dev:client
```

### Production Build
```bash
# Build all applications
npm run build

# Build specific application
npm run build:server
npm run build:admin
```

### Testing
```bash
# Run all tests
npm run test

# Test specific application
npm run test:server
npm run test:admin
```

## File Organization Rules

1. **No deeply nested directories** (max 3 levels in components)
2. **Group by feature**, not by file type
3. **Index files** for clean imports
4. **Consistent naming** across all applications
5. **Proper separation** of concerns

## Quality Standards

- **TypeScript strict mode** enabled everywhere
- **ESLint** configuration consistent across apps
- **Prettier** for code formatting
- **Jest** for testing
- **Proper error handling** in all applications
- **Comprehensive logging** with structured format

This structure ensures scalability, maintainability, and clear separation of concerns while enabling code sharing and consistent development patterns across the platform.