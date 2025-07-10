# Troubleshooting Guide

This guide covers common issues and solutions when working with the Codex Metatron Platform monorepo with submodules.

## 🔧 Git Submodule Issues

### Issue: Submodule appears as "modified" but no changes made

**Symptoms:**
```bash
$ git status
modified:   apps/core-server (new commits)
```

**Cause:** The submodule is pointing to a different commit than what's recorded in the main repository.

**Solutions:**

1. **Update submodule to latest:**
   ```bash
   cd apps/core-server
   git pull origin main
   cd ../..
   git add apps/core-server
   git commit -m "Update core-server to latest"
   ```

2. **Reset submodule to recorded commit:**
   ```bash
   git submodule update apps/core-server
   ```

### Issue: "No submodule mapping found" error

**Symptoms:**
```bash
No submodule mapping found in .gitmodules for path 'apps/service-name'
```

**Cause:** The `.gitmodules` file is out of sync or corrupted.

**Solutions:**

1. **Sync submodule URLs:**
   ```bash
   git submodule sync --recursive
   ```

2. **Reinitialize submodules:**
   ```bash
   git submodule deinit --all
   git submodule update --init --recursive
   ```

### Issue: Permission denied when accessing submodule

**Symptoms:**
```bash
Permission denied (publickey).
fatal: Could not read from remote repository.
```

**Cause:** SSH keys not configured or wrong repository URL format.

**Solutions:**

1. **Check SSH key configuration:**
   ```bash
   ssh -T git@github.com
   ```

2. **Switch to HTTPS URLs (if SSH not configured):**
   ```bash
   git config submodule.apps/core-server.url https://github.com/org/repo.git
   git submodule sync
   ```

3. **Configure SSH keys:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Add the public key to your GitHub account
   ```

### Issue: Submodule stuck on detached HEAD

**Symptoms:**
```bash
$ cd apps/core-server
$ git branch
* (HEAD detached at abc1234)
  main
```

**Cause:** Submodules are checked out as specific commits by default.

**Solutions:**

1. **Switch to main branch:**
   ```bash
   cd apps/core-server
   git checkout main
   git pull origin main
   ```

2. **Set branch tracking for all submodules:**
   ```bash
   git submodule foreach 'git checkout main && git pull origin main'
   ```

## 🔨 Build and Development Issues

### Issue: "Module not found" errors

**Symptoms:**
```bash
Error: Cannot resolve module '@codex/shared'
```

**Cause:** Shared libraries not built or not linked properly.

**Solutions:**

1. **Build shared libraries first:**
   ```bash
   npm run build:libs
   ```

2. **Reinstall all dependencies:**
   ```bash
   npm run clean
   npm run install:all
   ```

3. **Check package.json paths:**
   ```json
   {
     "dependencies": {
       "@codex/shared": "workspace:*"
     }
   }
   ```

### Issue: Port already in use

**Symptoms:**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Kill process on port:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Use different ports:**
   ```bash
   PORT=3001 npm run dev:server
   ```

3. **Stop Docker containers:**
   ```bash
   docker-compose down
   ```

### Issue: Docker build failures

**Symptoms:**
```bash
failed to solve with frontend dockerfile.v0
```

**Solutions:**

1. **Clean Docker cache:**
   ```bash
   docker system prune -a
   ```

2. **Rebuild without cache:**
   ```bash
   docker-compose build --no-cache
   ```

3. **Check Dockerfile paths:**
   ```dockerfile
   # Ensure paths are relative to build context
   COPY package.json ./
   COPY src/ ./src/
   ```

## 💾 Database Issues

### Issue: Database connection refused

**Symptoms:**
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Start database service:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Check database URL:**
   ```bash
   echo $DATABASE_URL
   ```

3. **Wait for database to be ready:**
   ```bash
   # Add health check to docker-compose.yml
   healthcheck:
     test: ["CMD-SHELL", "pg_isready -U codex"]
     interval: 5s
     timeout: 5s
     retries: 5
   ```

### Issue: Migration failures

**Symptoms:**
```bash
Error: Migration failed: relation already exists
```

**Solutions:**

1. **Reset database:**
   ```bash
   docker-compose down -v
   docker-compose up -d postgres
   npm run db:migrate
   ```

2. **Check migration order:**
   ```bash
   ls database/migrations/
   ```

## 🚀 Deployment Issues

### Issue: Environment variables not set

**Symptoms:**
```bash
Error: JWT_SECRET is required
```

**Solutions:**

1. **Check environment files:**
   ```bash
   # In each service directory
   ls -la .env*
   ```

2. **Copy from example:**
   ```bash
   cp .env.example .env
   ```

3. **Set in deployment platform:**
   ```bash
   # For Railway, Heroku, etc.
   # Set environment variables in dashboard
   ```

### Issue: Build timeouts in CI/CD

**Symptoms:**
```bash
The job exceeded the maximum time limit for jobs
```

**Solutions:**

1. **Optimize build process:**
   ```yaml
   # Use build matrix for parallel builds
   strategy:
     matrix:
       service: [core-server, cdx-pharaoh, client-template]
   ```

2. **Use caching:**
   ```yaml
   - name: Cache node modules
     uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

3. **Split into separate workflows:**
   ```yaml
   # Separate workflows for each service
   name: Core Server CI
   on:
     push:
       paths: ['apps/core-server/**']
   ```

## 🔍 Performance Issues

### Issue: Slow development server startup

**Symptoms:**
- Long wait times for `npm run dev`
- High CPU usage during development

**Solutions:**

1. **Use development mode optimizations:**
   ```json
   {
     "scripts": {
       "dev": "nodemon --watch src --ext ts --exec ts-node src/server.ts"
     }
   }
   ```

2. **Exclude node_modules from file watching:**
   ```json
   {
     "nodemonConfig": {
       "ignore": ["node_modules/", "dist/"]
     }
   }
   ```

3. **Use SWC instead of TypeScript compiler:**
   ```bash
   npm install @swc/core @swc-node/register
   ```

### Issue: High memory usage

**Symptoms:**
- System becomes unresponsive
- Out of memory errors

**Solutions:**

1. **Increase Node.js memory limit:**
   ```json
   {
     "scripts": {
       "dev": "NODE_OPTIONS='--max-old-space-size=4096' npm run start:dev"
     }
   }
   ```

2. **Use Docker resource limits:**
   ```yaml
   services:
     core-server:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

## 🧪 Testing Issues

### Issue: Tests failing after submodule updates

**Symptoms:**
```bash
Test suite failed to run
TypeError: Cannot read property 'exports' of undefined
```

**Solutions:**

1. **Clear test cache:**
   ```bash
   npm test -- --clearCache
   ```

2. **Reinstall test dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Update test configuration:**
   ```json
   {
     "jest": {
       "moduleNameMapping": {
         "@codex/(.*)": "<rootDir>/../libs/$1/src"
       }
     }
   }
   ```

### Issue: E2E tests timing out

**Symptoms:**
- Tests fail with timeout errors
- Slow test execution

**Solutions:**

1. **Increase timeout values:**
   ```javascript
   // In test files
   jest.setTimeout(30000);
   ```

2. **Use test database:**
   ```bash
   NODE_ENV=test npm run test:e2e
   ```

3. **Run tests in parallel:**
   ```json
   {
     "scripts": {
       "test:e2e": "jest --runInBand --forceExit"
     }
   }
   ```

## 🛠️ Development Tools

### VS Code Submodule Support

**Issue:** VS Code not recognizing submodule structure

**Solutions:**

1. **Configure workspace settings:**
   ```json
   {
     "folders": [
       { "path": "." },
       { "path": "./apps/core-server" },
       { "path": "./apps/cdx-pharaoh" },
       { "path": "./apps/client-template" }
     ]
   }
   ```

2. **Install Git Submodules extension**

### ESLint/Prettier Issues

**Issue:** Conflicting configurations across submodules

**Solutions:**

1. **Use root configuration:**
   ```json
   {
     "eslintConfig": {
       "extends": ["../../.eslintrc.js"]
     }
   }
   ```

2. **Ignore submodule configs:**
   ```gitignore
   apps/*/.eslintrc*
   apps/*/.prettierrc*
   ```

## 📋 Diagnostic Commands

### Check Overall System Status
```bash
# System overview
./scripts/submodule-manager.sh status

# Check all git status
git submodule foreach 'echo "=== $name ==="; git status'

# Check all package.json files
find . -name "package.json" -not -path "./node_modules/*" -exec echo "=== {} ===" \; -exec cat {} \;
```

### Check Dependencies
```bash
# Check for missing dependencies
npm ls --depth=0

# Check submodule dependencies
git submodule foreach 'npm ls --depth=0'

# Check for outdated packages
npm outdated
```

### Check Services
```bash
# Check ports in use
lsof -i :3000 -i :5173 -i :5432

# Check Docker status
docker ps
docker-compose ps

# Check logs
docker-compose logs core-server
docker-compose logs admin-dashboard
```

## 🆘 Emergency Procedures

### Complete Reset (Nuclear Option)

⚠️ **Warning: This will destroy all local changes**

```bash
# 1. Reset all submodules
git submodule foreach 'git reset --hard HEAD && git clean -fd'

# 2. Reset main repository
git reset --hard HEAD && git clean -fd

# 3. Reinitialize everything
git submodule update --init --recursive --force

# 4. Reinstall dependencies
npm run clean
npm run install:all

# 5. Rebuild everything
npm run build
```

### Rollback to Previous Working State

```bash
# 1. Find last working commit
git log --oneline

# 2. Reset to that commit
git reset --hard <commit-hash>

# 3. Update submodules to match
git submodule update --init --recursive

# 4. Verify everything works
npm run test
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the FAQ**: `docs/faq.md`
2. **Search GitHub Issues**: Look for similar problems
3. **Create a new issue**: Include diagnostic information
4. **Contact the team**: Use the designated support channel

### Information to Include in Bug Reports

```bash
# System information
node --version
npm --version
git --version

# Repository status
git status
git submodule status

# Recent changes
git log --oneline -10

# Environment
env | grep -E "(NODE_|DATABASE_|REDIS_)"

# Package information
cat package.json | jq '.version, .dependencies, .devDependencies'
```