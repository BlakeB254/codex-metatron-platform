# Monorepo Migration Checklist

## Pre-Migration Checklist

### 1. Preparation Phase
- [ ] Review current monorepo structure
- [ ] Identify all services and applications to extract
- [ ] Document all environment variables and configurations
- [ ] Create backup of current repository state
- [ ] Ensure all changes are committed
- [ ] Notify team members about the migration

### 2. Repository Setup
- [ ] Create GitHub organization (if not exists)
- [ ] Create individual repositories for each service:
  - [ ] `cdx-core-server`
  - [ ] `cdx-pharaoh`
  - [ ] `cdx-client-template`
  - [ ] Future service repositories (auth, tenant, cms, etc.)
- [ ] Configure repository settings (branch protection, secrets, etc.)

## Migration Execution

### 3. Run Migration Scripts
- [ ] Run `./scripts/monorepo-migration/01-prepare-migration.sh`
  - [ ] Verify backup branch created
  - [ ] Review generated documentation in `docs/migration-artifacts/`
- [ ] Run `./scripts/monorepo-migration/02-extract-services.sh`
  - [ ] Verify services extracted to temp directories
  - [ ] Review extracted code for completeness
- [ ] Push extracted services to their repositories:
  ```bash
  cd ../temp-cdx-core-server && git push -u origin main
  cd ../temp-cdx-pharaoh && git push -u origin main
  cd ../temp-cdx-client-template && git push -u origin main
  ```
- [ ] Run `./scripts/monorepo-migration/03-add-submodules.sh`
  - [ ] Verify submodules added correctly
  - [ ] Test submodule initialization
- [ ] Run `./scripts/monorepo-migration/04-update-build-system.sh`
  - [ ] Review and apply new configuration files
  - [ ] Update package.json with package.json.new
  - [ ] Update nx.json with nx.json.new

### 4. Configuration Updates
- [ ] Update `.gitmodules` with correct repository URLs
- [ ] Configure environment variables in each submodule
- [ ] Set up npm registry for shared libraries (if using private packages)
- [ ] Update CI/CD secrets in each repository

### 5. Testing Phase
- [ ] Run `npm run init` to initialize all submodules
- [ ] Test local development workflow:
  - [ ] `npm run dev` - Test basic development
  - [ ] `npm run dev:all` - Test all services together
- [ ] Test build process:
  - [ ] `npm run build:libs`
  - [ ] `npm run build:apps`
- [ ] Test with Docker Compose:
  - [ ] `docker-compose up`
  - [ ] Verify all services start correctly
- [ ] Run tests:
  - [ ] `npm run test:libs`
  - [ ] `npm run test:apps`

## Post-Migration Tasks

### 6. CI/CD Setup
- [ ] Configure GitHub Actions for main repository
- [ ] Set up CI/CD for each submodule repository
- [ ] Configure deployment pipelines
- [ ] Set up automated dependency updates

### 7. Documentation
- [ ] Update main README.md with new structure
- [ ] Document submodule workflow for developers
- [ ] Create troubleshooting guide
- [ ] Update onboarding documentation

### 8. Team Training
- [ ] Conduct team training on new workflow
- [ ] Document common git submodule commands
- [ ] Create quick reference guide
- [ ] Set up support channel for questions

### 9. Cleanup
- [ ] Remove temporary extraction directories
- [ ] Archive old branches
- [ ] Update project boards and issues
- [ ] Close migration-related tickets

## Rollback Plan (If Needed)

### Emergency Rollback Steps
1. [ ] Stop all development on migration branch
2. [ ] Checkout backup branch: `git checkout backup/pre-submodule-migration-XXXXXX`
3. [ ] Create new branch from backup: `git checkout -b main-rollback`
4. [ ] Force push to main (after team coordination): `git push --force origin main-rollback:main`
5. [ ] Notify all team members
6. [ ] Document lessons learned

## Success Criteria

- [ ] All services running independently
- [ ] Development workflow functional
- [ ] CI/CD pipelines passing
- [ ] No degradation in build times
- [ ] Team successfully using new structure
- [ ] Documentation complete and accurate

## Common Issues and Solutions

### Issue: Submodule not initialized
```bash
git submodule update --init --recursive
```

### Issue: Submodule on wrong commit
```bash
cd apps/service-name
git checkout main
git pull origin main
cd ../..
git add apps/service-name
git commit -m "Update service-name submodule"
```

### Issue: Permission denied when accessing submodule
- Check GitHub access tokens
- Ensure SSH keys are configured
- Verify repository permissions

### Issue: Build fails after migration
- Check shared library paths
- Verify all dependencies installed
- Review environment variables

## Git Submodule Quick Reference

```bash
# Clone repository with submodules
git clone --recursive <repo-url>

# Initialize submodules in existing repo
git submodule update --init --recursive

# Update all submodules to latest
git submodule update --remote --merge

# Work in a submodule
cd apps/service-name
git checkout main
# make changes
git add .
git commit -m "Update"
git push origin main
cd ../..
git add apps/service-name
git commit -m "Update service-name submodule"

# Check submodule status
git submodule status

# Run command in all submodules
git submodule foreach 'git status'
```

## Timeline Estimate

- **Week 1**: Preparation and repository setup
- **Week 2**: Service extraction and testing
- **Week 3**: Submodule integration and build system updates
- **Week 4**: Testing, documentation, and team training
- **Week 5**: Production migration and monitoring
- **Week 6**: Stabilization and optimization

## Sign-off

- [ ] Technical Lead Approval: _________________ Date: _______
- [ ] DevOps Lead Approval: _________________ Date: _______
- [ ] Team Lead Approval: _________________ Date: _______
- [ ] Migration Complete: Date: _______