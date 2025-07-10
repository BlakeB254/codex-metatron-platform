# Database Deployment Guide - Neon PostgreSQL

## Overview
This guide provides step-by-step instructions for deploying the Codex Metatron Platform with the Neon PostgreSQL database configuration, including the 7 microservices architecture.

## Prerequisites

### System Requirements
- Node.js 20+ 
- npm 9+
- PostgreSQL client tools (psql)
- Git
- Docker (optional for containerized deployment)

### Environment Setup
- Production VPS or cloud server
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- Environment variables configured

## Database Configuration

### 1. Neon Database Setup

#### Connection Details
```bash
# Primary Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Connection Components
DB_HOST=ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_SsVgbmR5JPw2
DB_PORT=5432
```

#### Validation Script
```bash
#!/bin/bash
# validate-db-connection.sh

echo "Validating Neon database connection..."

# Test connection
psql "$DATABASE_URL" -c "SELECT version();"

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Test SSL connection
psql "$DATABASE_URL" -c "SELECT ssl_is_used();"

if [ $? -eq 0 ]; then
    echo "✅ SSL connection verified"
else
    echo "❌ SSL connection failed"
    exit 1
fi

echo "Database validation complete"
```

### 2. Database Schema Deployment

#### Master Schema Setup
```sql
-- Create master database schema
-- File: database/master-schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Tenants registry
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    database_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(100) DEFAULT 'starter',
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT valid_plan CHECK (plan IN ('starter', 'professional', 'enterprise')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- Admin users
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_role CHECK (role IN ('super_admin', 'admin', 'operator'))
);

-- Service registry and health
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    port INTEGER NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0',
    status VARCHAR(50) DEFAULT 'inactive',
    health_check_url VARCHAR(255),
    last_health_check TIMESTAMP,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'error', 'maintenance'))
);

-- Service health monitoring
CREATE TABLE IF NOT EXISTS service_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    response_time INTEGER,
    error_message TEXT,
    details JSONB,
    checked_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_health_status CHECK (status IN ('healthy', 'unhealthy', 'error', 'timeout'))
);

-- System audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Security logs
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event VARCHAR(255) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP DEFAULT NOW(),
    severity VARCHAR(20) DEFAULT 'LOW',
    source VARCHAR(100),
    environment VARCHAR(50),
    
    CONSTRAINT valid_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Database migrations tracking
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    batch INTEGER,
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_api_key ON tenants(api_key);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_service_health_service_id ON service_health(service_id);
CREATE INDEX IF NOT EXISTS idx_service_health_checked_at ON service_health(checked_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_event ON security_logs(event);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);

-- Create partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_services_active ON services(id) WHERE status = 'active';

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_service_health_latest ON service_health(service_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_recent ON audit_log(created_at DESC, admin_id) WHERE created_at >= NOW() - INTERVAL '30 days';
```

#### Tenant Schema Template
```sql
-- Create tenant database schema template
-- File: database/tenant-schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tenant users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'editor', 'user')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Client/customer data
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'prospect', 'customer'))
);

-- Product catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    sku VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    inventory_quantity INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'discontinued'))
);

-- Subscription management
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    price DECIMAL(10,2),
    billing_cycle VARCHAR(50) DEFAULT 'monthly',
    started_at TIMESTAMP DEFAULT NOW(),
    ends_at TIMESTAMP,
    trial_ends_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly'))
);

-- CMS content
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    type VARCHAR(50) DEFAULT 'page',
    status VARCHAR(50) DEFAULT 'draft',
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    featured_image VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_type CHECK (type IN ('page', 'post', 'product', 'landing')),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- CRM activities
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Tenant configuration
CREATE TABLE IF NOT EXISTS tenant_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
```

## Service Deployment

### 1. Core Server Deployment

#### Environment Configuration
```bash
# /apps/core-server/.env.production
NODE_ENV=production
SERVICE_NAME=core-server
SERVICE_PORT=3000
SERVICE_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Security
JWT_SECRET=your-production-jwt-secret-here
SESSION_SECRET=your-production-session-secret-here
BCRYPT_ROUNDS=12

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
BILLING_SERVICE_URL=http://localhost:3002
SUBSCRIPTION_SERVICE_URL=http://localhost:3003
CRM_SERVICE_URL=http://localhost:3004
CLIENT_SERVICE_URL=http://localhost:3005
ADMIN_SERVICE_URL=http://localhost:3006
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'core-server',
      script: './dist/server.js',
      cwd: './apps/core-server',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // PM2 monitoring
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      
      // Logging
      log_file: './logs/core-server.log',
      error_file: './logs/core-server-error.log',
      out_file: './logs/core-server-out.log',
      
      // Auto-restart on file changes (development only)
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true
    }
  ]
};
```

### 2. Microservices Deployment

#### Auth Service
```bash
# /apps/services/auth-service/.env.production
NODE_ENV=production
SERVICE_NAME=auth-service
SERVICE_PORT=3001
SERVICE_VERSION=1.0.0

DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=your-production-jwt-secret-here
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600000
```

#### Billing Service
```bash
# /apps/services/billing-service/.env.production
NODE_ENV=production
SERVICE_NAME=billing-service
SERVICE_PORT=3002
SERVICE_VERSION=1.0.0

DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

#### Subscription Service
```bash
# /apps/services/subscription-service/.env.production
NODE_ENV=production
SERVICE_NAME=subscription-service
SERVICE_PORT=3003
SERVICE_VERSION=1.0.0

DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DEFAULT_PLAN=starter
TRIAL_PERIOD_DAYS=14
```

#### CRM Service
```bash
# /apps/services/crm-service/.env.production
NODE_ENV=production
SERVICE_NAME=crm-service
SERVICE_PORT=3004
SERVICE_VERSION=1.0.0

DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

ACTIVITY_RETENTION_DAYS=365
LEAD_SCORING_ENABLED=true
```

#### Client Service
```bash
# /apps/services/client-service/.env.production
NODE_ENV=production
SERVICE_NAME=client-service
SERVICE_PORT=3005
SERVICE_VERSION=1.0.0

DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DATA_RETENTION_DAYS=2555
EXPORT_FORMAT_DEFAULT=json
```

#### Admin Service
```bash
# /apps/services/admin-service/.env.production
NODE_ENV=production
SERVICE_NAME=admin-service
SERVICE_PORT=3006
SERVICE_VERSION=1.0.0

DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

AUDIT_LOG_RETENTION_DAYS=2555
SYSTEM_BACKUP_ENABLED=true
```

## Deployment Scripts

### 1. Database Migration Script
```bash
#!/bin/bash
# scripts/migrate-database.sh

set -e

echo "Starting database migrations..."

# Check if database connection is available
echo "Testing database connection..."
psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Database connection failed"
    exit 1
fi
echo "✅ Database connection successful"

# Create master schema
echo "Creating master schema..."
psql "$DATABASE_URL" -f database/master-schema.sql
if [ $? -eq 0 ]; then
    echo "✅ Master schema created"
else
    echo "❌ Master schema creation failed"
    exit 1
fi

# Initialize system configuration
echo "Initializing system configuration..."
psql "$DATABASE_URL" -c "
INSERT INTO system_config (key, value, type, description) VALUES
('platform_name', 'Codex Metatron Platform', 'string', 'Platform display name'),
('platform_version', '1.0.0', 'string', 'Platform version'),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode toggle'),
('registration_enabled', 'true', 'boolean', 'Allow new tenant registration'),
('max_tenants', '1000', 'integer', 'Maximum number of tenants'),
('default_plan', 'starter', 'string', 'Default subscription plan')
ON CONFLICT (key) DO NOTHING;
"

# Initialize services
echo "Initializing services..."
psql "$DATABASE_URL" -c "
INSERT INTO services (name, port, health_check_url, status) VALUES
('core-server', 3000, 'http://localhost:3000/health', 'inactive'),
('auth-service', 3001, 'http://localhost:3001/health', 'inactive'),
('billing-service', 3002, 'http://localhost:3002/health', 'inactive'),
('subscription-service', 3003, 'http://localhost:3003/health', 'inactive'),
('crm-service', 3004, 'http://localhost:3004/health', 'inactive'),
('client-service', 3005, 'http://localhost:3005/health', 'inactive'),
('admin-service', 3006, 'http://localhost:3006/health', 'inactive')
ON CONFLICT (name) DO UPDATE SET
port = EXCLUDED.port,
health_check_url = EXCLUDED.health_check_url,
updated_at = NOW();
"

echo "✅ Database migrations completed successfully"
```

### 2. Service Deployment Script
```bash
#!/bin/bash
# scripts/deploy-services.sh

set -e

echo "Starting service deployment..."

# Build all services
echo "Building services..."
npm run build

# Deploy core server
echo "Deploying core server..."
cd apps/core-server
npm ci --only=production
cd ../..

# Deploy microservices
SERVICES=("auth-service" "billing-service" "subscription-service" "crm-service" "client-service" "admin-service")

for service in "${SERVICES[@]}"; do
    echo "Deploying $service..."
    cd "apps/services/$service"
    npm ci --only=production
    cd ../../..
done

echo "✅ All services deployed successfully"
```

### 3. PM2 Deployment Script
```bash
#!/bin/bash
# scripts/start-services.sh

set -e

echo "Starting services with PM2..."

# Start all services
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

# Monitor services
pm2 monit

echo "✅ All services started successfully"
```

## Nginx Configuration

### 1. Reverse Proxy Setup
```nginx
# /etc/nginx/sites-available/codex-metatron
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Core Server (API Gateway)
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_timeout 30s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Admin Dashboard
    location /admin/ {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health Check Endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
    
    # Service Health Checks (internal only)
    location ~ ^/health/(auth|billing|subscription|crm|client|admin)$ {
        allow 127.0.0.1;
        deny all;
        proxy_pass http://localhost:300$1/health;
        access_log off;
    }
    
    # Static Assets
    location /static/ {
        root /var/www/codex-metatron;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Frame-Options DENY;
    }
    
    # Error Pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /var/www/codex-metatron/error-pages;
    }
}
```

### 2. Service Health Check Configuration
```nginx
# /etc/nginx/sites-available/health-check
upstream core_server {
    server localhost:3000 max_fails=3 fail_timeout=30s;
}

upstream auth_service {
    server localhost:3001 max_fails=3 fail_timeout=30s;
}

upstream billing_service {
    server localhost:3002 max_fails=3 fail_timeout=30s;
}

upstream subscription_service {
    server localhost:3003 max_fails=3 fail_timeout=30s;
}

upstream crm_service {
    server localhost:3004 max_fails=3 fail_timeout=30s;
}

upstream client_service {
    server localhost:3005 max_fails=3 fail_timeout=30s;
}

upstream admin_service {
    server localhost:3006 max_fails=3 fail_timeout=30s;
}

server {
    listen 8080;
    server_name localhost;
    
    location /health/core {
        proxy_pass http://core_server/health;
        access_log off;
    }
    
    location /health/auth {
        proxy_pass http://auth_service/health;
        access_log off;
    }
    
    location /health/billing {
        proxy_pass http://billing_service/health;
        access_log off;
    }
    
    location /health/subscription {
        proxy_pass http://subscription_service/health;
        access_log off;
    }
    
    location /health/crm {
        proxy_pass http://crm_service/health;
        access_log off;
    }
    
    location /health/client {
        proxy_pass http://client_service/health;
        access_log off;
    }
    
    location /health/admin {
        proxy_pass http://admin_service/health;
        access_log off;
    }
    
    location /health/all {
        content_by_lua_block {
            local http = require "resty.http"
            local cjson = require "cjson"
            
            local services = {
                {name = "core", port = 3000},
                {name = "auth", port = 3001},
                {name = "billing", port = 3002},
                {name = "subscription", port = 3003},
                {name = "crm", port = 3004},
                {name = "client", port = 3005},
                {name = "admin", port = 3006}
            }
            
            local results = {}
            local httpc = http.new()
            
            for _, service in ipairs(services) do
                local res, err = httpc:request_uri("http://localhost:" .. service.port .. "/health", {
                    method = "GET",
                    timeout = 5000
                })
                
                if res and res.status == 200 then
                    results[service.name] = {status = "healthy", response_time = res.time}
                else
                    results[service.name] = {status = "unhealthy", error = err}
                end
            end
            
            ngx.header.content_type = "application/json"
            ngx.say(cjson.encode(results))
        }
    }
}
```

## Monitoring and Logging

### 1. Log Configuration
```bash
# Create log directories
mkdir -p /var/log/codex-metatron
mkdir -p /var/log/codex-metatron/services

# Set permissions
chown -R $USER:$USER /var/log/codex-metatron
chmod -R 755 /var/log/codex-metatron
```

### 2. Logrotate Configuration
```bash
# /etc/logrotate.d/codex-metatron
/var/log/codex-metatron/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/codex-metatron/services/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Health Monitoring Script
```bash
#!/bin/bash
# scripts/monitor-health.sh

# Health check script that runs every minute
HEALTH_CHECK_URL="http://localhost:8080/health/all"
LOG_FILE="/var/log/codex-metatron/health-check.log"
ALERT_EMAIL="admin@your-domain.com"

# Check service health
response=$(curl -s -w "%{http_code}" -o /dev/null "$HEALTH_CHECK_URL")

if [ "$response" -eq 200 ]; then
    echo "$(date): All services healthy" >> "$LOG_FILE"
else
    echo "$(date): Health check failed - HTTP $response" >> "$LOG_FILE"
    
    # Send alert email
    echo "Health check failed at $(date)" | mail -s "Service Health Alert" "$ALERT_EMAIL"
    
    # Restart services if needed
    pm2 restart all
fi
```

## SSL/TLS Configuration

### 1. Let's Encrypt Setup
```bash
#!/bin/bash
# scripts/setup-ssl.sh

# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. SSL Security Headers
```nginx
# Enhanced SSL configuration
ssl_session_timeout 1d;
ssl_session_cache shared:MozTLS:10m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;

# Security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
```

## Backup and Recovery

### 1. Database Backup Script
```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/var/backups/codex-metatron"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup master database
echo "Backing up master database..."
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/master_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/master_backup_$DATE.sql"

# Cleanup old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

### 2. Automated Backup Schedule
```bash
# Add to crontab
crontab -e

# Database backup every 6 hours
0 */6 * * * /path/to/scripts/backup-database.sh

# Health check every minute
* * * * * /path/to/scripts/monitor-health.sh

# SSL certificate renewal check daily
0 2 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Test database connection
psql "$DATABASE_URL" -c "SELECT version();"

# Check connection pool status
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity;"

# Check SSL connection
psql "$DATABASE_URL" -c "SELECT ssl_is_used();"
```

#### 2. Service Health Issues
```bash
# Check PM2 processes
pm2 list

# Check service logs
pm2 logs core-server
pm2 logs auth-service

# Restart specific service
pm2 restart auth-service

# Restart all services
pm2 restart all
```

#### 3. Nginx Issues
```bash
# Test nginx configuration
nginx -t

# Reload nginx
nginx -s reload

# Check nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## Security Checklist

### Pre-Deployment
- [ ] Environment variables configured securely
- [ ] SSL certificates installed and configured
- [ ] Database connection string protected
- [ ] Service authentication tokens generated
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Firewall rules configured

### Post-Deployment
- [ ] All services responding to health checks
- [ ] Database migrations completed successfully
- [ ] SSL/TLS working correctly
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Log rotation configured
- [ ] Service restart procedures tested

## Last Updated: July 10, 2025

This deployment guide provides comprehensive instructions for deploying the Codex Metatron Platform with proper Neon PostgreSQL integration and security measures.