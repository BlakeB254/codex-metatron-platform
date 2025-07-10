# Component Registry - Codex Metatron Platform

## Component States
- **Planned**: Component identified and planned for development
- **In Development**: Component being created/modified
- **Active**: Component approved and available for use
- **Deprecated**: Component scheduled for removal

## Platform Architecture Components

### Core Server Components
**TenantMiddleware** (`apps/core-server/src/middleware/tenant.ts`)
- Status: Planned
- Purpose: Extract tenant context from API keys
- Dependencies: pg, jsonwebtoken
- Priority: High

**AuthMiddleware** (`apps/core-server/src/middleware/auth.ts`)
- Status: Planned
- Purpose: JWT token validation and user authentication
- Dependencies: jsonwebtoken
- Priority: High

**HealthController** (`apps/core-server/src/controllers/health.ts`)
- Status: Planned
- Purpose: Service health check endpoints
- Dependencies: pg
- Priority: High

**TenantController** (`apps/core-server/src/controllers/tenant.ts`)
- Status: Planned
- Purpose: Tenant CRUD operations
- Dependencies: pg, bcrypt
- Priority: High

### CDXPharaoh Dashboard Components

**Dashboard** (`apps/cdx-pharaoh/src/components/Dashboard.tsx`)
- Status: Planned
- Purpose: Main dashboard with service health monitoring
- Props: services[], tenants[], loading
- Dependencies: React, Next.js, TailwindCSS
- Priority: High

**ServiceHealthIndicator** (`apps/cdx-pharaoh/src/components/ServiceHealthIndicator.tsx`)
- Status: Planned
- Purpose: Real-time service status display (green/red indicators)
- Props: service: Service, refreshInterval: number
- Dependencies: React, SWR
- Priority: High

**TenantTable** (`apps/cdx-pharaoh/src/components/TenantTable.tsx`)
- Status: Planned
- Purpose: Tenant management table with CRUD operations
- Props: tenants[], onEdit, onDelete, onAdd
- Dependencies: React, TailwindCSS
- Priority: High

**TenantForm** (`apps/cdx-pharaoh/src/components/TenantForm.tsx`)
- Status: Planned
- Purpose: Create/edit tenant modal form
- Props: tenant?: Tenant, onSubmit, onCancel
- Dependencies: React Hook Form, Zod validation
- Priority: Medium

**SystemStats** (`apps/cdx-pharaoh/src/components/SystemStats.tsx`)
- Status: Planned
- Purpose: System metrics and statistics display
- Props: stats: SystemStats
- Dependencies: React, Chart.js
- Priority: Medium

### Client Template Components

**Layout** (`apps/client-template/src/components/Layout.tsx`)
- Status: Planned
- Purpose: Standard layout for tenant applications
- Props: children, tenant
- Dependencies: React, Next.js
- Priority: Medium

**AuthProvider** (`apps/client-template/src/components/AuthProvider.tsx`)
- Status: Planned
- Purpose: Authentication context provider
- Props: children, apiKey
- Dependencies: React Context, NextAuth.js
- Priority: Medium

**ApiClient** (`apps/client-template/src/lib/api-client.ts`)
- Status: Planned
- Purpose: Pre-configured API client for tenant applications
- Dependencies: Axios, JWT handling
- Priority: Medium

### Shared Library Components

**DatabaseConnection** (`libs/shared/database/connection.ts`)
- Status: Planned
- Purpose: Database connection management with tenant isolation
- Dependencies: pg, @neondatabase/serverless
- Priority: High

**TenantContext** (`libs/shared/tenant-context/index.ts`)
- Status: Planned
- Purpose: Tenant context management utilities
- Dependencies: Express Request types
- Priority: High

**ApiResponse** (`libs/shared/types/api.ts`)
- Status: Planned
- Purpose: Standardized API response types
- Dependencies: TypeScript
- Priority: Medium

**ErrorHandler** (`libs/shared/utils/error-handler.ts`)
- Status: Planned
- Purpose: Centralized error handling utilities
- Dependencies: Express
- Priority: Medium

## UI Component Library

### Base Components
**Button** (`libs/ui/src/components/Button.tsx`)
- Status: Planned
- Purpose: Reusable button component with variants
- Props: variant, size, disabled, loading, children
- Variants: primary, secondary, danger, ghost
- Dependencies: React, TailwindCSS
- Priority: Medium

**Modal** (`libs/ui/src/components/Modal.tsx`)
- Status: Planned
- Purpose: Reusable modal component
- Props: isOpen, onClose, title, children
- Dependencies: React, Headless UI
- Priority: Medium

**Table** (`libs/ui/src/components/Table.tsx`)
- Status: Planned
- Purpose: Data table component with sorting and pagination
- Props: columns, data, sortable, pagination
- Dependencies: React, TailwindCSS
- Priority: Low

**Form** (`libs/ui/src/components/Form.tsx`)
- Status: Planned
- Purpose: Form wrapper with validation
- Props: schema, onSubmit, children
- Dependencies: React Hook Form, Zod
- Priority: Low

## Service Components

### Health Monitoring
**HealthChecker** (`libs/shared/monitoring/health-checker.ts`)
- Status: Planned
- Purpose: Service health checking utility
- Dependencies: axios, node-cron
- Priority: High

**ServiceRegistry** (`libs/shared/monitoring/service-registry.ts`)
- Status: Planned
- Purpose: Service discovery and registration
- Dependencies: pg
- Priority: Medium

### Database Management
**MasterDbService** (`libs/shared/database/master-db.ts`)
- Status: Planned
- Purpose: Master database operations
- Dependencies: pg
- Priority: High

**TenantDbService** (`libs/shared/database/tenant-db.ts`)
- Status: Planned
- Purpose: Tenant database operations with isolation
- Dependencies: pg
- Priority: High

**MigrationRunner** (`libs/shared/database/migrations.ts`)
- Status: Planned
- Purpose: Database schema migration utilities
- Dependencies: pg
- Priority: Medium

## Component Development Standards

### File Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── feature/         # Feature-specific components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── services/            # API service classes
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Naming Conventions
- **Components**: PascalCase (e.g., `TenantTable`)
- **Files**: PascalCase for components (e.g., `TenantTable.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useHealthCheck`)
- **Services**: PascalCase with "Service" suffix (e.g., `TenantService`)
- **Types**: PascalCase (e.g., `TenantData`)

### Component Props Interface
```typescript
interface ComponentNameProps {
  // Required props (no default values)
  data: DataType;
  onAction: (item: DataType) => void;
  
  // Optional props (with defaults)
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  
  // Children and className for flexibility
  children?: React.ReactNode;
  className?: string;
}
```

### Error Handling Standards
- All components must handle loading states
- Error boundaries for critical components
- Graceful degradation for non-critical features
- User-friendly error messages

## Sacred Geometry Design System

### Spacing Scale (TailwindCSS)
- `gr-1`: 5px (0.3125rem)
- `gr-2`: 8px (0.5rem)
- `gr-3`: 13px (0.8125rem)
- `gr-4`: 21px (1.3125rem)
- `gr-5`: 34px (2.125rem)
- `gr-6`: 55px (3.4375rem)
- `gr-7`: 89px (5.5625rem)
- `gr-8`: 144px (9rem)

### Typography Scale
- `text-xs`: 10px (Small labels, captions)
- `text-sm`: 16px (Body text, inputs)
- `text-md`: 26px (Subheadings)
- `text-lg`: 42px (Page headings)
- `text-xl`: 68px (Hero text)

### Color System
- **Primary**: Yellow (#F59E0B) - Used for CDXPharaoh branding
- **Success**: Green (#10B981) - Service health indicators
- **Danger**: Red (#EF4444) - Error states and warnings
- **Info**: Blue (#3B82F6) - Information and links
- **Gray Scale**: Gray-50 to Gray-900 for backgrounds and text

## Component Testing Standards

### Testing Requirements
- **Unit Tests**: All utility functions and services
- **Component Tests**: React components with React Testing Library
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user flows (future)

### Test File Structure
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── services/
│   ├── TenantService.ts
│   └── __tests__/
│       └── TenantService.test.ts
```

## Development Workflow

### Component Creation Process
1. **Planning**: Define component purpose and interface
2. **Design**: Create component structure and props
3. **Implementation**: Write component with TypeScript
4. **Testing**: Add unit tests and integration tests
5. **Documentation**: Update component registry
6. **Review**: Code review and approval

### Component Update Process
1. **Identify Need**: Document required changes
2. **Impact Assessment**: Check dependent components
3. **Implementation**: Make changes with backward compatibility
4. **Testing**: Update tests and verify no regressions
5. **Documentation**: Update component registry
6. **Migration**: Update dependent components if needed

## Component Dependencies

### External Dependencies
- **React**: ^18.0.0 (UI components)
- **Next.js**: ^14.0.0 (SSR and routing)
- **TailwindCSS**: ^3.0.0 (Styling)
- **TypeScript**: ^5.0.0 (Type safety)
- **React Hook Form**: ^7.0.0 (Form handling)
- **Zod**: ^3.0.0 (Schema validation)
- **SWR**: ^2.0.0 (Data fetching)
- **Headless UI**: ^1.0.0 (Accessible components)

### Internal Dependencies
- **Shared Types**: Common TypeScript interfaces
- **Shared Utils**: Common utility functions
- **API Client**: Standardized API communication
- **Theme System**: Design system implementation

## Future Component Roadmap

### Phase 1 (MVP - 72 Hours)
- Core server components
- CDXPharaoh dashboard
- Basic tenant management
- Health monitoring

### Phase 2 (Post-MVP)
- Advanced UI components
- Data visualization components
- Real-time notifications
- Advanced form components

### Phase 3 (Future)
- Mobile-responsive components
- Advanced analytics components
- Multi-language support
- Accessibility enhancements

## Last Updated: July 10, 2025