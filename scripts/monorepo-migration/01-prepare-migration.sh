#!/bin/bash

# Monorepo Migration Script - Phase 1: Preparation
# This script prepares the current monorepo for migration to a submodule structure

set -e

echo "============================================"
echo "Monorepo Migration - Phase 1: Preparation"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo "Error: This script must be run from the monorepo root directory"
    exit 1
fi

# Create backup branch
echo "Creating backup branch..."
BACKUP_BRANCH="backup/pre-submodule-migration-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BACKUP_BRANCH"
git add -A
git commit -m "Backup: Pre-submodule migration state" || echo "No changes to commit"
git checkout main

echo "✓ Backup created at branch: $BACKUP_BRANCH"

# Document current state
echo "Documenting current dependencies..."
mkdir -p docs/migration-artifacts

# Save package.json files
echo "Saving package.json files..."
find . -name "package.json" -not -path "./node_modules/*" -exec cp --parents {} docs/migration-artifacts/ \;

# Save current git log
echo "Saving git history..."
git log --oneline --graph --all > docs/migration-artifacts/git-history-pre-migration.txt

# Document environment variables
echo "Documenting environment variables..."
cat > docs/migration-artifacts/environment-variables.md << EOF
# Environment Variables Documentation

## Core Server Environment Variables
- PORT
- DATABASE_URL
- JWT_SECRET
- NODE_ENV

## Admin Dashboard Environment Variables
- VITE_API_URL
- VITE_APP_NAME

## Client Template Environment Variables
- REACT_APP_API_URL
- REACT_APP_TENANT_ID

Note: Update these in each submodule's repository settings or .env files
EOF

# Create repository structure documentation
echo "Creating repository structure plan..."
cat > docs/migration-artifacts/repository-structure.md << EOF
# Repository Structure Plan

## Main Repository
- **Name**: codex-metatron-platform
- **Purpose**: Orchestrator monorepo containing shared libraries and configurations

## Application Repositories
1. **cdx-core-server**
   - Path: apps/core-server
   - Description: Core API server
   - Tech: Node.js + Express + TypeScript

2. **cdx-pharaoh**
   - Path: apps/cdx-pharaoh
   - Description: Admin dashboard
   - Tech: React + TypeScript + Vite

3. **cdx-client-template**
   - Path: apps/client-template
   - Description: Template for tenant applications
   - Tech: React + TypeScript

## Service Repositories (Future)
1. **cdx-auth-service**
2. **cdx-tenant-service**
3. **cdx-cms-service**
4. **cdx-notification-service**
5. **cdx-analytics-service**
EOF

echo "✓ Documentation created in docs/migration-artifacts/"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "Warning: You have uncommitted changes. Please commit or stash them before proceeding."
    exit 1
fi

echo ""
echo "============================================"
echo "Phase 1 Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Review the documentation in docs/migration-artifacts/"
echo "2. Create the individual repositories on GitHub"
echo "3. Run ./scripts/monorepo-migration/02-extract-services.sh"
echo ""