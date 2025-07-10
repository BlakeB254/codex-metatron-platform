#!/bin/bash

# Submodule Manager
# A helper script for managing Git submodules in the Codex Metatron Platform

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Show usage
show_usage() {
    cat << EOF
Submodule Manager for Codex Metatron Platform

Usage: $0 <command> [options]

Commands:
  init              Initialize all submodules
  update            Update all submodules to latest
  status            Show status of all submodules
  install           Install dependencies in all submodules
  test              Run tests in all submodules
  build             Build all submodules
  clean             Clean node_modules in all submodules
  foreach <cmd>     Run command in each submodule
  branch <name>     Create branch in all submodules
  checkout <name>   Checkout branch in all submodules
  pull              Pull latest changes in all submodules
  push              Push changes in all submodules
  reset             Reset all submodules to committed state
  add <url> <path>  Add new submodule
  remove <path>     Remove submodule
  sync              Sync submodule URLs from .gitmodules

Examples:
  $0 init
  $0 update
  $0 foreach "npm install"
  $0 branch feature/new-feature
  $0 add https://github.com/org/new-service.git services/new-service

EOF
}

# Initialize all submodules
init_submodules() {
    print_header "Initializing Submodules"
    cd "$ROOT_DIR"
    
    git submodule update --init --recursive
    print_status "Submodules initialized"
    
    # Install dependencies
    print_status "Installing dependencies..."
    git submodule foreach 'if [ -f "package.json" ]; then npm install; fi'
    print_status "Dependencies installed"
}

# Update all submodules
update_submodules() {
    print_header "Updating Submodules"
    cd "$ROOT_DIR"
    
    git submodule update --remote --merge
    print_status "Submodules updated to latest"
    
    # Show which submodules were updated
    git submodule status
}

# Show status of all submodules
status_submodules() {
    print_header "Submodule Status"
    cd "$ROOT_DIR"
    
    git submodule status --recursive
    
    # Check for uncommitted changes in submodules
    echo ""
    print_header "Checking for Uncommitted Changes"
    git submodule foreach 'echo "=== $name ==="; git status --porcelain'
}

# Install dependencies in all submodules
install_submodules() {
    print_header "Installing Dependencies"
    cd "$ROOT_DIR"
    
    # Install root dependencies first
    print_status "Installing root dependencies..."
    npm install
    
    # Install submodule dependencies
    print_status "Installing submodule dependencies..."
    git submodule foreach 'if [ -f "package.json" ]; then echo "Installing dependencies for $name..."; npm install; fi'
    
    print_status "All dependencies installed"
}

# Run tests in all submodules
test_submodules() {
    print_header "Running Tests"
    cd "$ROOT_DIR"
    
    # Test root libraries first
    if [ -d "libs" ]; then
        print_status "Testing shared libraries..."
        find libs -name "package.json" -execdir npm test \;
    fi
    
    # Test submodules
    print_status "Testing submodules..."
    git submodule foreach 'if [ -f "package.json" ] && npm run | grep -q "test"; then echo "Testing $name..."; npm test; fi'
    
    print_status "All tests completed"
}

# Build all submodules
build_submodules() {
    print_header "Building All"
    cd "$ROOT_DIR"
    
    # Build shared libraries first
    if [ -d "libs" ]; then
        print_status "Building shared libraries..."
        find libs -name "package.json" -execdir npm run build \;
    fi
    
    # Build submodules
    print_status "Building submodules..."
    git submodule foreach 'if [ -f "package.json" ] && npm run | grep -q "build"; then echo "Building $name..."; npm run build; fi'
    
    print_status "All builds completed"
}

# Clean node_modules in all submodules
clean_submodules() {
    print_header "Cleaning Dependencies"
    cd "$ROOT_DIR"
    
    print_status "Cleaning root node_modules..."
    rm -rf node_modules
    
    print_status "Cleaning submodule node_modules..."
    git submodule foreach 'if [ -d "node_modules" ]; then echo "Cleaning $name..."; rm -rf node_modules; fi'
    
    print_status "Clean completed"
}

# Run command in each submodule
foreach_submodules() {
    local cmd="$1"
    if [ -z "$cmd" ]; then
        print_error "Command required for foreach"
        exit 1
    fi
    
    print_header "Running Command in Each Submodule"
    cd "$ROOT_DIR"
    
    git submodule foreach "$cmd"
}

# Create branch in all submodules
branch_submodules() {
    local branch_name="$1"
    if [ -z "$branch_name" ]; then
        print_error "Branch name required"
        exit 1
    fi
    
    print_header "Creating Branch: $branch_name"
    cd "$ROOT_DIR"
    
    # Create branch in main repo
    git checkout -b "$branch_name"
    
    # Create branch in each submodule
    git submodule foreach "git checkout -b $branch_name"
    
    print_status "Branch $branch_name created in all repositories"
}

# Checkout branch in all submodules
checkout_submodules() {
    local branch_name="$1"
    if [ -z "$branch_name" ]; then
        print_error "Branch name required"
        exit 1
    fi
    
    print_header "Checking Out Branch: $branch_name"
    cd "$ROOT_DIR"
    
    # Checkout branch in main repo
    git checkout "$branch_name"
    
    # Checkout branch in each submodule
    git submodule foreach "git checkout $branch_name"
    
    print_status "Checked out $branch_name in all repositories"
}

# Pull latest changes in all submodules
pull_submodules() {
    print_header "Pulling Latest Changes"
    cd "$ROOT_DIR"
    
    # Pull main repo
    git pull
    
    # Pull each submodule
    git submodule foreach 'git pull origin $(git rev-parse --abbrev-ref HEAD)'
    
    print_status "Pulled latest changes in all repositories"
}

# Push changes in all submodules
push_submodules() {
    print_header "Pushing Changes"
    cd "$ROOT_DIR"
    
    # Push each submodule first
    git submodule foreach 'if ! git diff-index --quiet HEAD --; then echo "Pushing $name..."; git push origin $(git rev-parse --abbrev-ref HEAD); fi'
    
    # Update submodule references and push main repo
    if ! git diff-index --quiet HEAD --; then
        git add -A
        git commit -m "Update submodule references"
    fi
    git push origin $(git rev-parse --abbrev-ref HEAD)
    
    print_status "Pushed changes in all repositories"
}

# Reset all submodules to committed state
reset_submodules() {
    print_header "Resetting Submodules"
    cd "$ROOT_DIR"
    
    print_warning "This will discard all uncommitted changes in submodules"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git submodule foreach 'git reset --hard HEAD && git clean -fd'
        git submodule update --init --recursive
        print_status "All submodules reset to committed state"
    else
        print_status "Reset cancelled"
    fi
}

# Add new submodule
add_submodule() {
    local url="$1"
    local path="$2"
    
    if [ -z "$url" ] || [ -z "$path" ]; then
        print_error "URL and path required for adding submodule"
        exit 1
    fi
    
    print_header "Adding Submodule: $path"
    cd "$ROOT_DIR"
    
    git submodule add "$url" "$path"
    git commit -m "Add $path submodule"
    
    print_status "Submodule $path added successfully"
}

# Remove submodule
remove_submodule() {
    local path="$1"
    
    if [ -z "$path" ]; then
        print_error "Path required for removing submodule"
        exit 1
    fi
    
    print_header "Removing Submodule: $path"
    cd "$ROOT_DIR"
    
    git submodule deinit -f "$path"
    git rm -f "$path"
    rm -rf ".git/modules/$path"
    
    print_status "Submodule $path removed successfully"
}

# Sync submodule URLs
sync_submodules() {
    print_header "Syncing Submodule URLs"
    cd "$ROOT_DIR"
    
    git submodule sync --recursive
    print_status "Submodule URLs synced"
}

# Main script logic
case "${1:-}" in
    init)
        init_submodules
        ;;
    update)
        update_submodules
        ;;
    status)
        status_submodules
        ;;
    install)
        install_submodules
        ;;
    test)
        test_submodules
        ;;
    build)
        build_submodules
        ;;
    clean)
        clean_submodules
        ;;
    foreach)
        foreach_submodules "$2"
        ;;
    branch)
        branch_submodules "$2"
        ;;
    checkout)
        checkout_submodules "$2"
        ;;
    pull)
        pull_submodules
        ;;
    push)
        push_submodules
        ;;
    reset)
        reset_submodules
        ;;
    add)
        add_submodule "$2" "$3"
        ;;
    remove)
        remove_submodule "$2"
        ;;
    sync)
        sync_submodules
        ;;
    *)
        show_usage
        exit 1
        ;;
esac