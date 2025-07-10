# Monorepo Migration Guide with Git Submodules

## Overview

This guide documents the migration of the Codex Metatron Platform from a traditional monorepo to a Git submodule-based monorepo structure. This approach provides better separation of concerns, independent versioning, and flexible deployment strategies.

## Current Structure Analysis

### Existing Monorepo Layout
```
codex-metatron-platform/
├── apps/
│   ├── cdx-pharaoh/        # Admin dashboard (React + Vite)
│   ├── client-template/    # Client app template
│   └── core-server/        # Core API server (Node.js + Express)
├── libs/
│   ├── infrastructure/     # Logging, monitoring utilities
│   ├── shared/            # Shared types, utilities, database
│   └── ui/                # UI component library
├── database/              # Database schemas
├── deployment/            # Deployment configurations
└── docs/                  # Documentation
```

### Technology Stack
- **Monorepo Tool**: Nx (already configured)
- **Package Manager**: npm with workspaces
- **Main Apps**:
  - `cdx-pharaoh`: Admin dashboard (React + TypeScript + Vite)
  - `core-server`: Backend API (Node.js + Express + TypeScript)
  - `client-template`: Template for tenant apps

## Proposed Submodule Structure

### Repository Architecture
```
codex-metatron-platform/          # Main monorepo (orchestrator)
├── apps/                         # Submodules for applications
│   ├── cdx-pharaoh/             # → Submodule: github.com/org/cdx-pharaoh
│   ├── core-server/             # → Submodule: github.com/org/cdx-core-server
│   └── client-template/         # → Submodule: github.com/org/cdx-client-template
├── services/                     # Submodules for microservices
│   ├── auth-service/            # → Submodule: github.com/org/cdx-auth-service
│   ├── tenant-service/          # → Submodule: github.com/org/cdx-tenant-service
│   └── cms-service/             # → Submodule: github.com/org/cdx-cms-service
├── libs/                        # Shared libraries (remain in main repo)
│   ├── infrastructure/
│   ├── shared/
│   └── ui/
├── deployment/                  # Deployment configs (main repo)
├── database/                    # Database schemas (main repo)
└── scripts/                     # Management scripts (main repo)
```

## Migration Strategy

### Phase 1: Preparation
1. **Backup Current State**
   - Create a full backup branch
   - Document all current dependencies
   - Export environment configurations

2. **Create Repository Structure**
   - Create individual repositories for each service/app
   - Initialize with proper .gitignore and README files
   - Set up basic CI/CD templates

3. **Extract Shared Dependencies**
   - Identify truly shared code
   - Package shared libraries for npm publishing
   - Update import paths

### Phase 2: Service Extraction
1. **Extract Core Server**
   ```bash
   # Create new repository
   git subtree split --prefix=apps/core-server -b core-server-branch
   
   # Push to new repository
   cd ..
   git clone https://github.com/org/cdx-core-server.git
   cd cdx-core-server
   git pull ../codex-metatron-platform core-server-branch
   ```

2. **Extract Admin Dashboard**
   ```bash
   git subtree split --prefix=apps/cdx-pharaoh -b cdx-pharaoh-branch
   ```

3. **Extract Client Template**
   ```bash
   git subtree split --prefix=apps/client-template -b client-template-branch
   ```

### Phase 3: Submodule Integration
1. **Remove Original Directories**
   ```bash
   git rm -r apps/core-server
   git rm -r apps/cdx-pharaoh
   git rm -r apps/client-template
   git commit -m "Remove apps before adding as submodules"
   ```

2. **Add as Submodules**
   ```bash
   git submodule add https://github.com/org/cdx-core-server.git apps/core-server
   git submodule add https://github.com/org/cdx-pharaoh.git apps/cdx-pharaoh
   git submodule add https://github.com/org/cdx-client-template.git apps/client-template
   ```

### Phase 4: Update Build System
1. Update package.json scripts
2. Configure Nx for submodule awareness
3. Update CI/CD pipelines

## Benefits of This Approach

### 1. Independent Development
- Each service can have its own release cycle
- Teams can work independently
- Different tech stacks per service possible

### 2. Better Access Control
- Granular permissions per repository
- Service-specific CI/CD secrets
- Audit trails per service

### 3. Flexible Deployment
- Deploy services independently
- Scale services based on load
- Different deployment strategies per service

### 4. Improved Testing
- Service-specific test suites
- Faster CI/CD pipelines
- Isolated integration testing

## Considerations and Challenges

### 1. Dependency Management
- **Challenge**: Managing shared dependencies across submodules
- **Solution**: Publish shared libs to private npm registry

### 2. Development Workflow
- **Challenge**: More complex local development setup
- **Solution**: Docker Compose for local development

### 3. Version Synchronization
- **Challenge**: Keeping compatible versions across services
- **Solution**: Automated compatibility testing in CI

### 4. Initial Setup Complexity
- **Challenge**: More repositories to manage
- **Solution**: Automation scripts and templates

## Alternative Approaches Considered

### 1. Lerna Monorepo
- **Pros**: Simpler than submodules, good npm integration
- **Cons**: All code still in one repository

### 2. Nx Integrated Monorepo
- **Pros**: Powerful build caching, great DX
- **Cons**: Single repository, complex for large teams

### 3. Separate Repositories (No Monorepo)
- **Pros**: Complete independence
- **Cons**: Difficult to manage shared code

## Rollback Plan

If the migration needs to be reverted:

1. **Merge Submodules Back**
   ```bash
   git submodule deinit -f apps/core-server
   git rm -f apps/core-server
   # Copy the latest code back
   cp -r ../cdx-core-server apps/core-server
   git add apps/core-server
   ```

2. **Restore Original Structure**
   - Revert to backup branch
   - Re-apply any critical updates

3. **Update CI/CD**
   - Restore original pipelines
   - Update deployment scripts

## Success Criteria

- [ ] All services running independently
- [ ] CI/CD pipelines functional for each service
- [ ] Development workflow documented and tested
- [ ] Team trained on new workflow
- [ ] Rollback procedure tested
- [ ] Performance metrics maintained or improved

## Timeline

### Week 1-2: Preparation
- Repository creation
- Documentation
- Team training

### Week 3-4: Service Extraction
- Extract and test each service
- Update dependencies

### Week 5-6: Integration
- Add submodules
- Update build systems
- Test deployments

### Week 7-8: Stabilization
- Fix issues
- Optimize workflows
- Final documentation