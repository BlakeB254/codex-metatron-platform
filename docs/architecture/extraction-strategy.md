# Monorepo Extraction Strategy

## Current State
Your monorepo is already well-configured with submodules for future extraction. This document outlines the strategy for maintaining the monorepo while enabling individual repository extraction.

## Repository Structure

### Extraction-Ready Components

#### Services (Ready for Independent Repos)
- `services/auth-service` → `github.com/codex-metatron/cdx-auth-service`
- `services/tenant-service` → `github.com/codex-metatron/cdx-tenant-service` 
- `services/cms-service` → `github.com/codex-metatron/cdx-cms-service`
- `services/notification-service` → `github.com/codex-metatron/cdx-notification-service`
- `services/analytics-service` → `github.com/codex-metatron/cdx-analytics-service`
- `services/api-gateway` → Future: `github.com/codex-metatron/cdx-api-gateway`
- `services/crm-service` → Future: `github.com/codex-metatron/cdx-crm-service`

#### Apps (Ready for Independent Repos)  
- `apps/cdx-pharaoh` → `github.com/codex-metatron/cdx-pharaoh`
- `apps/core-server` → `github.com/codex-metatron/cdx-core-server`
- `apps/client-template` → `github.com/codex-metatron/cdx-client-template`

#### Libraries (Future Extraction Candidates)
- `libs/ui` → Future: `github.com/codex-metatron/cdx-ui-library`
- `libs/ui-components` → Future: `github.com/codex-metatron/cdx-components`
- `libs/shared` → Future: `github.com/codex-metatron/cdx-shared`

## Extraction Benefits

### Independent Development
- Teams can work on services independently
- Separate CI/CD pipelines per service
- Independent versioning and releases
- Isolated security and access controls

### Scalability
- Reduced clone times for individual services
- Faster CI/CD for focused changes
- Independent scaling of development teams
- Cleaner dependency management

## Monorepo Benefits (Current State)

### Cross-Service Development
- Shared types and utilities in `libs/shared`
- Unified build system with NX
- Cross-service testing and integration
- Single source of truth for shared components

### Unified Operations
- Single CI/CD pipeline for integration testing
- Shared tooling and standards
- Simplified dependency management
- Unified documentation and onboarding

## Migration Strategy

### Phase 1: Preparation (Current)
- ✅ Submodules configured for all services/apps
- ✅ NX workspace properly structured
- ✅ Independent package.json per service/app
- ✅ CI pipeline validates independent builds

### Phase 2: Selective Extraction
When to extract a service:
1. **Team Size**: Service has dedicated team (3+ developers)
2. **Release Cadence**: Service needs independent release cycle
3. **External Usage**: Service consumed by external teams/projects
4. **Compliance**: Service has specific security/compliance requirements

### Phase 3: Gradual Migration
1. Extract service to independent repo
2. Update submodule reference in monorepo
3. Maintain both during transition period
4. Remove from monorepo when fully independent

## Extraction Process

### 1. Service Extraction
```bash
# Extract service history
git subtree push --prefix=services/auth-service origin auth-service-branch

# Create new repository
gh repo create codex-metatron/cdx-auth-service --public

# Push extracted history
git push git@github.com:codex-metatron/cdx-auth-service.git auth-service-branch:main

# Add as submodule
git submodule add https://github.com/codex-metatron/cdx-auth-service.git services/auth-service-extracted
```

### 2. Maintain Both During Transition
- Keep original service in monorepo for stability
- Develop in extracted repo
- Sync changes during transition period
- Update CI/CD to work with both

### 3. Complete Migration
- Remove original service directory
- Update all references to use submodule
- Archive transition branches

## Repository Naming Convention

### Consistent Naming
- Platform Monorepo: `codex-metatron-platform`
- Services: `cdx-{service-name}-service`
- Apps: `cdx-{app-name}`
- Libraries: `cdx-{library-name}`

### GitHub Organization Structure
```
github.com/codex-metatron/
├── codex-metatron-platform/          # Main monorepo
├── cdx-auth-service/                 # Extracted service
├── cdx-tenant-service/               # Extracted service
├── cdx-pharaoh/                      # Extracted app
├── cdx-core-server/                  # Extracted app
├── cdx-ui-library/                   # Future: Extracted library
└── cdx-shared/                       # Future: Shared utilities
```

## Current Recommendations

### Keep as Monorepo For Now
Your current setup is optimal because:
1. **Active Development**: Rapid cross-service changes
2. **Shared Components**: Heavy usage of `libs/shared` and `libs/ui`
3. **Integration Testing**: Complex inter-service dependencies
4. **Team Size**: Single or small team managing multiple services

### Extract When Ready
Consider extraction when:
1. **Service Maturity**: Service has stable API and minimal cross-service changes
2. **Team Growth**: Dedicated teams per service
3. **External Consumers**: Other teams/projects need the service
4. **Deployment Independence**: Service needs independent deployment cycles

## Tooling Support

### NX Configuration
- ✅ Workspace properly configured for both monorepo and extraction
- ✅ Build targets work independently per service/app
- ✅ Dependency graph tracks inter-service dependencies

### CI/CD Pipeline
- ✅ Tests each service/app independently
- ✅ Validates extraction readiness
- ✅ Supports both monorepo and multi-repo workflows

### Development Experience
- ✅ Unified development environment
- ✅ Shared tooling and standards
- ✅ Cross-service type checking and linting

## Next Steps

1. **Monitor Growth**: Track when services become extraction candidates
2. **Prepare Libraries**: Structure `libs/` for potential extraction
3. **Documentation**: Maintain extraction procedures
4. **Team Planning**: Plan service ownership as team grows

Your monorepo is excellently positioned for both current unified development and future extraction as your platform scales.