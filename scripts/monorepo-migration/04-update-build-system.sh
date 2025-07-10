#!/bin/bash

# Monorepo Migration Script - Phase 4: Update Build System
# This script updates the build system to work with submodules

set -e

echo "============================================"
echo "Monorepo Migration - Phase 4: Update Build System"
echo "============================================"

# Create updated package.json
echo "Creating updated package.json..."
cat > package.json.new << 'EOF'
{
  "name": "codex-metatron-platform",
  "version": "2.0.0",
  "description": "Codex Metatron Platform - Monorepo with Submodules",
  "license": "MIT",
  "private": true,
  "scripts": {
    "init": "git submodule update --init --recursive && npm run install:all",
    "update-submodules": "git submodule update --remote --merge",
    "install:all": "npm install && npm run install:submodules",
    "install:submodules": "git submodule foreach 'npm install'",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:admin\"",
    "dev:server": "cd apps/core-server && npm run dev",
    "dev:admin": "cd apps/cdx-pharaoh && npm run dev",
    "dev:client": "cd apps/client-template && npm run dev",
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev:admin\" \"npm run dev:client\"",
    "build": "npm run build:libs && npm run build:apps",
    "build:libs": "cd libs/ui && npm run build && cd ../shared && npm run build",
    "build:apps": "git submodule foreach 'npm run build'",
    "build:server": "cd apps/core-server && npm run build",
    "build:admin": "cd apps/cdx-pharaoh && npm run build",
    "build:client": "cd apps/client-template && npm run build",
    "test": "npm run test:libs && npm run test:apps",
    "test:libs": "cd libs/ui && npm test && cd ../shared && npm test",
    "test:apps": "git submodule foreach 'npm test'",
    "lint": "npm run lint:libs && git submodule foreach 'npm run lint'",
    "lint:libs": "eslint libs/**/*.{ts,tsx,js,jsx}",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\" --ignore-path .gitignore",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\" --ignore-path .gitignore",
    "clean": "rm -rf node_modules libs/*/node_modules && git submodule foreach 'rm -rf node_modules'",
    "status": "git submodule status",
    "foreach": "git submodule foreach",
    "publish:libs": "npm run publish:shared && npm run publish:ui",
    "publish:shared": "cd libs/shared && npm publish",
    "publish:ui": "cd libs/ui && npm publish",
    "postinstall": "echo 'Run npm run init to initialize submodules'"
  },
  "workspaces": [
    "libs/*"
  ],
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "concurrently": "^9.2.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "~5.8.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
EOF

# Create nx.json for submodule support
echo "Creating updated nx.json..."
cat > nx.json.new << 'EOF'
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": ["default"],
    "sharedGlobals": [
      "{workspaceRoot}/.gitmodules",
      "{workspaceRoot}/package.json"
    ]
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "test": {
      "inputs": ["default", "^default"]
    }
  },
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "libs"
  },
  "plugins": [
    {
      "plugin": "@nx/js/typescript",
      "options": {
        "typecheck": {
          "targetName": "typecheck"
        },
        "build": {
          "targetName": "build"
        }
      }
    }
  ]
}
EOF

# Create Docker Compose for local development
echo "Creating docker-compose.yml for local development..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: codex
      POSTGRES_PASSWORD: codex_password
      POSTGRES_DB: codex_metatron
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  core-server:
    build:
      context: ./apps/core-server
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://codex:codex_password@postgres:5432/codex_metatron
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=development
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/core-server:/app
      - ./libs:/libs
      - /app/node_modules

  admin-dashboard:
    build:
      context: ./apps/cdx-pharaoh
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - core-server
    volumes:
      - ./apps/cdx-pharaoh:/app
      - ./libs:/libs
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
EOF

# Create helper scripts
echo "Creating helper scripts..."
mkdir -p scripts/helpers

# Script to clone all submodules for a fresh setup
cat > scripts/helpers/setup-dev-environment.sh << 'EOF'
#!/bin/bash

# Setup Development Environment
echo "Setting up Codex Metatron Platform development environment..."

# Initialize and update submodules
echo "Initializing submodules..."
git submodule update --init --recursive

# Install dependencies
echo "Installing dependencies..."
npm run install:all

# Copy environment files
echo "Setting up environment files..."
for submodule in apps/*; do
    if [ -d "$submodule" ] && [ -f "$submodule/.env.example" ]; then
        cp "$submodule/.env.example" "$submodule/.env"
        echo "Created .env file for $submodule"
    fi
done

# Setup database
if command -v docker-compose &> /dev/null; then
    echo "Starting database services..."
    docker-compose up -d postgres redis
    echo "Waiting for database to be ready..."
    sleep 5
fi

echo "Development environment setup complete!"
echo "Run 'npm run dev' to start the development servers"
EOF

chmod +x scripts/helpers/setup-dev-environment.sh

# Script to update all submodules
cat > scripts/helpers/update-all.sh << 'EOF'
#!/bin/bash

# Update all submodules to latest
echo "Updating all submodules..."

# Fetch latest changes
git submodule foreach 'git fetch origin'

# Update to latest commit on tracked branch
git submodule update --remote --merge

# Install any new dependencies
npm run install:all

echo "All submodules updated!"
EOF

chmod +x scripts/helpers/update-all.sh

# Create CI/CD workflow for GitHub Actions
echo "Creating GitHub Actions workflow..."
mkdir -p .github/workflows
cat > .github/workflows/monorepo-ci.yml << 'EOF'
name: Monorepo CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm run install:all

  test-libs:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Test libraries
        run: npm run test:libs

  test-apps:
    needs: setup
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [core-server, cdx-pharaoh, client-template]
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm install
          cd apps/${{ matrix.app }} && npm install

      - name: Test ${{ matrix.app }}
        run: cd apps/${{ matrix.app }} && npm test

  build:
    needs: [test-libs, test-apps]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm run install:all

      - name: Build all
        run: npm run build
EOF

echo ""
echo "============================================"
echo "Phase 4 Complete!"
echo "============================================"
echo ""
echo "Build system has been updated for submodule support!"
echo ""
echo "Updated files:"
echo "  - package.json.new (review and replace current package.json)"
echo "  - nx.json.new (review and replace current nx.json)"
echo "  - docker-compose.yml (for local development)"
echo "  - scripts/helpers/setup-dev-environment.sh"
echo "  - scripts/helpers/update-all.sh"
echo "  - .github/workflows/monorepo-ci.yml"
echo ""
echo "Next steps:"
echo "1. Review and apply the new configuration files"
echo "2. Run: ./scripts/helpers/setup-dev-environment.sh"
echo "3. Test the development workflow"
echo "4. Update your CI/CD pipelines"
echo ""