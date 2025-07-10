#!/bin/bash

# Monorepo Migration Script - Phase 2: Extract Services
# This script extracts services from the monorepo into separate repositories

set -e

echo "============================================"
echo "Monorepo Migration - Phase 2: Extract Services"
echo "============================================"

# Configuration
GITHUB_ORG="codex-metatron"  # Update this to your GitHub organization
SERVICES=(
    "apps/core-server:cdx-core-server"
    "apps/cdx-pharaoh:cdx-pharaoh"
    "apps/client-template:cdx-client-template"
)

# Check prerequisites
if [ ! -f ".gitmodules" ]; then
    echo "Error: .gitmodules file not found. Please ensure it exists before running this script."
    exit 1
fi

# Function to extract a service
extract_service() {
    local SERVICE_PATH=$1
    local REPO_NAME=$2
    
    echo ""
    echo "Extracting $SERVICE_PATH to $REPO_NAME..."
    echo "----------------------------------------"
    
    # Create a branch with the service history
    BRANCH_NAME="${REPO_NAME}-extract"
    
    # Use git subtree to extract the service with history
    echo "Creating subtree branch..."
    git subtree split --prefix="$SERVICE_PATH" -b "$BRANCH_NAME"
    
    # Create a temporary directory for the new repository
    TEMP_DIR="../temp-${REPO_NAME}"
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # Initialize new repository
    git init
    git remote add origin "https://github.com/${GITHUB_ORG}/${REPO_NAME}.git"
    
    # Pull the extracted branch
    git pull ../codex-metatron-platform "$BRANCH_NAME"
    
    # Create initial structure files
    echo "Creating repository structure files..."
    
    # Create README if it doesn't exist
    if [ ! -f "README.md" ]; then
        cat > README.md << EOF
# ${REPO_NAME}

This repository is part of the Codex Metatron Platform.

## Description

$(echo "$REPO_NAME" | sed 's/cdx-//' | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

## Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
\`\`\`

## Part of Codex Metatron Platform

This service is designed to work as part of the larger Codex Metatron Platform.
See the main repository for more information: https://github.com/${GITHUB_ORG}/codex-metatron-platform
EOF
    fi
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.lcov
.nyc_output

# Production
build/
dist/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# TypeScript
*.tsbuildinfo
.tsc-cache/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Temporary files
tmp/
temp/
EOF
    fi
    
    # Create GitHub Actions workflow
    mkdir -p .github/workflows
    cat > .github/workflows/ci.yml << EOF
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
EOF
    
    # Commit initial structure
    git add .
    git commit -m "Initial repository setup for ${REPO_NAME}"
    
    echo "✓ Service extracted to $TEMP_DIR"
    echo "  Ready to push to https://github.com/${GITHUB_ORG}/${REPO_NAME}.git"
    
    # Return to original directory
    cd ../codex-metatron-platform
    
    # Clean up the branch
    git branch -D "$BRANCH_NAME"
}

# Extract each service
for SERVICE in "${SERVICES[@]}"; do
    IFS=':' read -r SERVICE_PATH REPO_NAME <<< "$SERVICE"
    extract_service "$SERVICE_PATH" "$REPO_NAME"
done

echo ""
echo "============================================"
echo "Phase 2 Complete!"
echo "============================================"
echo ""
echo "Extracted services are in temporary directories:"
for SERVICE in "${SERVICES[@]}"; do
    IFS=':' read -r SERVICE_PATH REPO_NAME <<< "$SERVICE"
    echo "  - ../temp-${REPO_NAME}"
done
echo ""
echo "Next steps:"
echo "1. Create repositories on GitHub for each service"
echo "2. Push each service to its repository:"
echo "   cd ../temp-SERVICE_NAME && git push -u origin main"
echo "3. Run ./scripts/monorepo-migration/03-add-submodules.sh"
echo ""