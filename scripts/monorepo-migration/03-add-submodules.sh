#!/bin/bash

# Monorepo Migration Script - Phase 3: Add Submodules
# This script removes original directories and adds them back as submodules

set -e

echo "============================================"
echo "Monorepo Migration - Phase 3: Add Submodules"
echo "============================================"

# Configuration
GITHUB_ORG="codex-metatron"  # Update this to your GitHub organization

# Services to convert to submodules
SERVICES=(
    "apps/core-server:cdx-core-server"
    "apps/cdx-pharaoh:cdx-pharaoh"
    "apps/client-template:cdx-client-template"
)

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo "Error: This script must be run from the monorepo root directory"
    exit 1
fi

# Create a branch for the submodule migration
MIGRATION_BRANCH="feature/submodule-migration"
echo "Creating migration branch: $MIGRATION_BRANCH"
git checkout -b "$MIGRATION_BRANCH" || git checkout "$MIGRATION_BRANCH"

# Function to convert directory to submodule
convert_to_submodule() {
    local SERVICE_PATH=$1
    local REPO_NAME=$2
    local REPO_URL="https://github.com/${GITHUB_ORG}/${REPO_NAME}.git"
    
    echo ""
    echo "Converting $SERVICE_PATH to submodule..."
    echo "----------------------------------------"
    
    # Check if directory exists
    if [ ! -d "$SERVICE_PATH" ]; then
        echo "Warning: $SERVICE_PATH does not exist, skipping..."
        return
    fi
    
    # Remove the directory from git tracking
    echo "Removing $SERVICE_PATH from git tracking..."
    git rm -r "$SERVICE_PATH" || true
    git commit -m "Remove $SERVICE_PATH before converting to submodule" || echo "Nothing to commit"
    
    # Add as submodule
    echo "Adding $REPO_URL as submodule at $SERVICE_PATH..."
    git submodule add "$REPO_URL" "$SERVICE_PATH"
    
    # Initialize and update the submodule
    git submodule update --init --recursive "$SERVICE_PATH"
    
    echo "✓ Converted $SERVICE_PATH to submodule"
}

# Convert each service to a submodule
for SERVICE in "${SERVICES[@]}"; do
    IFS=':' read -r SERVICE_PATH REPO_NAME <<< "$SERVICE"
    convert_to_submodule "$SERVICE_PATH" "$REPO_NAME"
done

# Update .gitmodules with additional configuration
echo ""
echo "Updating .gitmodules configuration..."
git add .gitmodules

# Commit the changes
echo "Committing submodule additions..."
git add .
git commit -m "Convert services to submodules

- Converted apps/core-server to submodule
- Converted apps/cdx-pharaoh to submodule
- Converted apps/client-template to submodule"

echo ""
echo "============================================"
echo "Phase 3 Complete!"
echo "============================================"
echo ""
echo "Submodules have been added successfully!"
echo ""
echo "Next steps:"
echo "1. Test the setup: git submodule update --init --recursive"
echo "2. Update package.json scripts if needed"
echo "3. Run ./scripts/monorepo-migration/04-update-build-system.sh"
echo "4. When ready, merge the migration branch:"
echo "   git checkout main"
echo "   git merge $MIGRATION_BRANCH"
echo ""