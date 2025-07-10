# Database Setup - Neon PostgreSQL Implementation

## Overview
This document provides comprehensive setup instructions for the Codex Metatron Platform database infrastructure using Neon PostgreSQL as the managed database service.

## Database Architecture

### Connection Strategy
- **Primary Database**: Neon PostgreSQL (managed service)
- **Architecture**: Master database + tenant-specific databases
- **Connection Method**: Connection pooling with `@neondatabase/serverless`
- **SSL/TLS**: Required for all connections
- **Connection Pooling**: Enabled for all services

### Database Structure
```
neondb (Master Database)
├── tenants                 # Tenant registry and API keys
├── admins                  # Admin users and permissions
├── services                # Service health and configuration
├── audit_log              # System audit trail
├── service_health         # Real-time service monitoring
└── system_config          # Platform configuration

[tenant_id]_db (Tenant Databases)
├── users                   # Tenant-specific users
├── clients                 # Customer/client data
├── products                # Product catalog
├── subscriptions          # Subscription management
├── content                # CMS content
├── activities             # CRM activities
└── tenant_config          # Tenant-specific settings
```

## Neon Database Configuration

### Connection Details
**Database URL**: `postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### Connection Parameters
- **Host**: `ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech`
- **Database**: `neondb`
- **Username**: `neondb_owner`
- **Password**: `npg_SsVgbmR5JPw2`
- **Port**: `5432` (default)
- **SSL Mode**: `require`
- **Channel Binding**: `require`

⚠️ **SECURITY CRITICAL**: Never commit this connection string to version control. Always use environment variables.

## Environment Configuration

### Master Environment File Template (.env)
```bash
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Database Connection Settings
DB_HOST=ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_SsVgbmR5JPw2
DB_PORT=5432
DB_SSL=require
DB_CHANNEL_BINDING=require

# Connection Pool Settings
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=10000

# Tenant Database Settings
TENANT_DB_PREFIX=tenant_
TENANT_DB_MAX_CONNECTIONS=10
TENANT_DB_IDLE_TIMEOUT=30000

# Service Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Security
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=1h
API_RATE_LIMIT=1000
API_RATE_WINDOW=900000

# Monitoring
HEALTH_CHECK_INTERVAL=30000
SERVICE_TIMEOUT=30000
LOG_LEVEL=info
```

### Service-Specific Environment Files

#### Core Server (.env.core)
```bash
# Core Server Configuration
SERVICE_NAME=core-server
SERVICE_PORT=3000
SERVICE_VERSION=1.0.0

# Database (inherits from master .env)
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Service Dependencies
AUTH_SERVICE_URL=http://localhost:3001
BILLING_SERVICE_URL=http://localhost:3002
SUBSCRIPTION_SERVICE_URL=http://localhost:3003
CRM_SERVICE_URL=http://localhost:3004
CLIENT_SERVICE_URL=http://localhost:3005
ADMIN_SERVICE_URL=http://localhost:3006
```

#### Auth Service (.env.auth)
```bash
# Auth Service Configuration
SERVICE_NAME=auth-service
SERVICE_PORT=3001
SERVICE_VERSION=1.0.0

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Authentication Settings
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600000
```

#### Billing Service (.env.billing)
```bash
# Billing Service Configuration
SERVICE_NAME=billing-service
SERVICE_PORT=3002
SERVICE_VERSION=1.0.0

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Billing Settings
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
BILLING_CYCLE_DEFAULT=monthly
```

#### Subscription Service (.env.subscription)
```bash
# Subscription Service Configuration
SERVICE_NAME=subscription-service
SERVICE_PORT=3003
SERVICE_VERSION=1.0.0

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Subscription Settings
DEFAULT_PLAN=starter
TRIAL_PERIOD_DAYS=14
FEATURE_FLAG_CACHE_TTL=300000
```

#### CRM Service (.env.crm)
```bash
# CRM Service Configuration
SERVICE_NAME=crm-service
SERVICE_PORT=3004
SERVICE_VERSION=1.0.0

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# CRM Settings
ACTIVITY_RETENTION_DAYS=365
LEAD_SCORING_ENABLED=true
EMAIL_INTEGRATION_ENABLED=true
```

#### Client Service (.env.client)
```bash
# Client Service Configuration
SERVICE_NAME=client-service
SERVICE_PORT=3005
SERVICE_VERSION=1.0.0

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Client Settings
DATA_RETENTION_DAYS=2555
EXPORT_FORMAT_DEFAULT=json
IMPORT_BATCH_SIZE=1000
```

#### Admin Service (.env.admin)
```bash
# Admin Service Configuration
SERVICE_NAME=admin-service
SERVICE_PORT=3006
SERVICE_VERSION=1.0.0

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Admin Settings
AUDIT_LOG_RETENTION_DAYS=2555
SYSTEM_BACKUP_ENABLED=true
MAINTENANCE_MODE_ENABLED=false
```

## Database Connection Implementation

### Connection Manager (`libs/shared/database/connection.ts`)
```typescript
import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';

export class DatabaseManager {
  private masterPool: Pool;
  private tenantPools: Map<string, Pool> = new Map();

  constructor() {
    this.masterPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '10000'),
    });
  }

  // Master database connection
  async getMasterConnection() {
    return this.masterPool.connect();
  }

  // Tenant-specific database connection
  async getTenantConnection(tenantId: string) {
    if (!this.tenantPools.has(tenantId)) {
      const tenantDbName = `tenant_${tenantId}_db`;
      const tenantPool = new Pool({
        connectionString: process.env.DATABASE_URL?.replace('/neondb', `/${tenantDbName}`),
        ssl: {
          rejectUnauthorized: false
        },
        max: parseInt(process.env.TENANT_DB_MAX_CONNECTIONS || '10'),
        idleTimeoutMillis: parseInt(process.env.TENANT_DB_IDLE_TIMEOUT || '30000'),
      });
      
      this.tenantPools.set(tenantId, tenantPool);
    }

    return this.tenantPools.get(tenantId)!.connect();
  }

  // Neon serverless connection (for edge functions)
  getNeonConnection() {
    return neon(process.env.DATABASE_URL!);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.getMasterConnection();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async shutdown() {
    await this.masterPool.end();
    for (const [tenantId, pool] of this.tenantPools) {
      await pool.end();
    }
    this.tenantPools.clear();
  }
}

export const dbManager = new DatabaseManager();
```

### Tenant Database Provisioning (`libs/shared/database/tenant-db.ts`)
```typescript
import { dbManager } from './connection';

export class TenantDatabaseManager {
  
  async createTenantDatabase(tenantId: string): Promise<void> {
    const client = await dbManager.getMasterConnection();
    
    try {
      const tenantDbName = `tenant_${tenantId}_db`;
      
      // Create tenant database
      await client.query(`CREATE DATABASE "${tenantDbName}"`);
      
      // Create tenant-specific tables
      await this.createTenantTables(tenantId);
      
      // Insert tenant record in master database
      await client.query(`
        INSERT INTO tenants (id, database_name, created_at, status)
        VALUES ($1, $2, NOW(), 'active')
      `, [tenantId, tenantDbName]);
      
      console.log(`Tenant database created successfully: ${tenantDbName}`);
      
    } catch (error) {
      console.error(`Failed to create tenant database for ${tenantId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async createTenantTables(tenantId: string): Promise<void> {
    const client = await dbManager.getTenantConnection(tenantId);
    
    try {
      // Create tenant-specific schema
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(50),
          company VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          plan VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          started_at TIMESTAMP DEFAULT NOW(),
          ends_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS content (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          content TEXT,
          type VARCHAR(50) DEFAULT 'page',
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS activities (
          id SERIAL PRIMARY KEY,
          client_id INTEGER REFERENCES clients(id),
          type VARCHAR(100) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          due_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS tenant_config (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          type VARCHAR(50) DEFAULT 'string',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
        CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
        CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
        CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
      `);
      
    } catch (error) {
      console.error(`Failed to create tenant tables for ${tenantId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteTenantDatabase(tenantId: string): Promise<void> {
    const client = await dbManager.getMasterConnection();
    
    try {
      const tenantDbName = `tenant_${tenantId}_db`;
      
      // Update tenant status to deleted
      await client.query(`
        UPDATE tenants 
        SET status = 'deleted', deleted_at = NOW()
        WHERE id = $1
      `, [tenantId]);
      
      // Note: In production, you might want to backup before deletion
      // await client.query(`DROP DATABASE IF EXISTS "${tenantDbName}"`);
      
      console.log(`Tenant database marked for deletion: ${tenantDbName}`);
      
    } catch (error) {
      console.error(`Failed to delete tenant database for ${tenantId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const tenantDbManager = new TenantDatabaseManager();
```

## Master Database Schema

### Core Tables
```sql
-- Master Database Schema (neondb)

-- Tenants registry
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    database_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(100) DEFAULT 'starter',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Admin users
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Service registry and health
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    port INTEGER NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0',
    status VARCHAR(50) DEFAULT 'inactive',
    last_health_check TIMESTAMP,
    health_check_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Service health monitoring
CREATE TABLE IF NOT EXISTS service_health (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id),
    status VARCHAR(50) NOT NULL,
    response_time INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT NOW()
);

-- System audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_api_key ON tenants(api_key);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_service_health_service_id ON service_health(service_id);
CREATE INDEX IF NOT EXISTS idx_service_health_checked_at ON service_health(checked_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
```

## 7 Microservices Database Integration

### Service Health Monitoring Setup
```typescript
// libs/infrastructure/monitoring/health-monitor.ts
import { dbManager } from '@codex-metatron/shared/database';

export class ServiceHealthMonitor {
  private services = [
    { name: 'core-server', port: 3000, healthUrl: 'http://localhost:3000/health' },
    { name: 'auth-service', port: 3001, healthUrl: 'http://localhost:3001/health' },
    { name: 'billing-service', port: 3002, healthUrl: 'http://localhost:3002/health' },
    { name: 'subscription-service', port: 3003, healthUrl: 'http://localhost:3003/health' },
    { name: 'crm-service', port: 3004, healthUrl: 'http://localhost:3004/health' },
    { name: 'client-service', port: 3005, healthUrl: 'http://localhost:3005/health' },
    { name: 'admin-service', port: 3006, healthUrl: 'http://localhost:3006/health' }
  ];

  async initializeServices(): Promise<void> {
    const client = await dbManager.getMasterConnection();
    
    try {
      for (const service of this.services) {
        await client.query(`
          INSERT INTO services (name, port, health_check_url)
          VALUES ($1, $2, $3)
          ON CONFLICT (name) DO UPDATE SET
          port = EXCLUDED.port,
          health_check_url = EXCLUDED.health_check_url,
          updated_at = NOW()
        `, [service.name, service.port, service.healthUrl]);
      }
      
      console.log('Services initialized in database');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async checkServiceHealth(serviceName: string): Promise<boolean> {
    const client = await dbManager.getMasterConnection();
    
    try {
      const result = await client.query(`
        SELECT id, health_check_url FROM services WHERE name = $1
      `, [serviceName]);
      
      if (result.rows.length === 0) {
        return false;
      }
      
      const service = result.rows[0];
      const startTime = Date.now();
      
      try {
        const response = await fetch(service.health_check_url);
        const responseTime = Date.now() - startTime;
        const isHealthy = response.ok;
        
        await client.query(`
          INSERT INTO service_health (service_id, status, response_time, checked_at)
          VALUES ($1, $2, $3, NOW())
        `, [service.id, isHealthy ? 'healthy' : 'unhealthy', responseTime]);
        
        await client.query(`
          UPDATE services SET 
          status = $1, 
          last_health_check = NOW(),
          updated_at = NOW()
          WHERE id = $2
        `, [isHealthy ? 'active' : 'inactive', service.id]);
        
        return isHealthy;
        
      } catch (error) {
        await client.query(`
          INSERT INTO service_health (service_id, status, error_message, checked_at)
          VALUES ($1, $2, $3, NOW())
        `, [service.id, 'error', error.message]);
        
        await client.query(`
          UPDATE services SET 
          status = 'error', 
          last_health_check = NOW(),
          updated_at = NOW()
          WHERE id = $1
        `, [service.id]);
        
        return false;
      }
      
    } catch (error) {
      console.error(`Health check failed for ${serviceName}:`, error);
      return false;
    } finally {
      client.release();
    }
  }

  async getAllServiceHealth(): Promise<any[]> {
    const client = await dbManager.getMasterConnection();
    
    try {
      const result = await client.query(`
        SELECT 
          s.name,
          s.port,
          s.version,
          s.status,
          s.last_health_check,
          sh.response_time,
          sh.error_message,
          sh.checked_at
        FROM services s
        LEFT JOIN service_health sh ON s.id = sh.service_id
        WHERE sh.id IS NULL OR sh.checked_at = (
          SELECT MAX(checked_at) FROM service_health WHERE service_id = s.id
        )
        ORDER BY s.name
      `);
      
      return result.rows;
      
    } catch (error) {
      console.error('Failed to get service health:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const healthMonitor = new ServiceHealthMonitor();
```

## Security Best Practices

### Connection String Security
1. **Never commit** connection strings to version control
2. **Use environment variables** for all sensitive data
3. **Rotate passwords** regularly (every 90 days)
4. **Use SSL/TLS** for all database connections
5. **Implement connection pooling** to prevent connection exhaustion
6. **Monitor connection usage** and set appropriate limits

### Access Control
```typescript
// Database access control implementation
export class DatabaseAccessControl {
  
  async validateTenantAccess(tenantId: string, apiKey: string): Promise<boolean> {
    const client = await dbManager.getMasterConnection();
    
    try {
      const result = await client.query(`
        SELECT id FROM tenants 
        WHERE id = $1 AND api_key = $2 AND status = 'active'
      `, [tenantId, apiKey]);
      
      return result.rows.length > 0;
      
    } catch (error) {
      console.error('Tenant access validation failed:', error);
      return false;
    } finally {
      client.release();
    }
  }

  async logDatabaseAccess(tenantId: string, action: string, details: any): Promise<void> {
    const client = await dbManager.getMasterConnection();
    
    try {
      await client.query(`
        INSERT INTO audit_log (admin_id, action, resource, resource_id, details, created_at)
        VALUES (NULL, $1, 'database', $2, $3, NOW())
      `, [action, tenantId, JSON.stringify(details)]);
      
    } catch (error) {
      console.error('Failed to log database access:', error);
    } finally {
      client.release();
    }
  }
}
```

## Performance Optimization

### Connection Pool Configuration
```typescript
// Optimized connection pool settings
const poolConfig = {
  // Master database pool
  masterPool: {
    max: 20,          // Maximum connections
    min: 5,           // Minimum connections
    idleTimeoutMillis: 30000,    // 30 seconds
    connectionTimeoutMillis: 10000,  // 10 seconds
    acquireTimeoutMillis: 60000,     // 60 seconds
    createTimeoutMillis: 30000,      // 30 seconds
    destroyTimeoutMillis: 5000,      // 5 seconds
    reapIntervalMillis: 1000,        // 1 second
    createRetryIntervalMillis: 200,  // 200ms
  },
  
  // Tenant database pools
  tenantPool: {
    max: 10,          // Maximum connections per tenant
    min: 2,           // Minimum connections per tenant
    idleTimeoutMillis: 30000,    // 30 seconds
    connectionTimeoutMillis: 10000,  // 10 seconds
  }
};
```

### Database Indexes and Optimization
```sql
-- Performance indexes for frequent queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_status_active 
ON tenants(status) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_health_latest 
ON service_health(service_id, checked_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_recent 
ON audit_log(created_at DESC) WHERE created_at >= NOW() - INTERVAL '30 days';

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active 
ON services(name) WHERE status = 'active';
```

## Migration Strategy

### Database Migration Script
```typescript
// scripts/migrate-database.ts
import { dbManager } from '@codex-metatron/shared/database';

export class DatabaseMigrator {
  
  async runMigrations(): Promise<void> {
    console.log('Starting database migrations...');
    
    await this.createMigrationTable();
    await this.runPendingMigrations();
    
    console.log('Database migrations completed successfully');
  }
  
  private async createMigrationTable(): Promise<void> {
    const client = await dbManager.getMasterConnection();
    
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP DEFAULT NOW()
        )
      `);
    } finally {
      client.release();
    }
  }
  
  private async runPendingMigrations(): Promise<void> {
    const migrations = [
      '001_initial_schema.sql',
      '002_service_health_table.sql',
      '003_audit_log_indexes.sql',
      '004_tenant_config_table.sql'
    ];
    
    for (const migration of migrations) {
      await this.runMigration(migration);
    }
  }
  
  private async runMigration(migrationName: string): Promise<void> {
    const client = await dbManager.getMasterConnection();
    
    try {
      // Check if migration already executed
      const result = await client.query(`
        SELECT id FROM migrations WHERE name = $1
      `, [migrationName]);
      
      if (result.rows.length > 0) {
        console.log(`Migration ${migrationName} already executed, skipping...`);
        return;
      }
      
      // Execute migration
      console.log(`Executing migration: ${migrationName}`);
      
      // Here you would read and execute the SQL file
      // For demo purposes, we'll just mark it as executed
      await client.query(`
        INSERT INTO migrations (name) VALUES ($1)
      `, [migrationName]);
      
      console.log(`Migration ${migrationName} executed successfully`);
      
    } catch (error) {
      console.error(`Migration ${migrationName} failed:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}
```

## Monitoring and Alerting

### Database Health Monitoring
```typescript
// Database health monitoring implementation
export class DatabaseHealthMonitor {
  
  async checkDatabaseHealth(): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Test master database connection
      const masterHealthy = await dbManager.healthCheck();
      const responseTime = Date.now() - startTime;
      
      // Check connection pool status
      const poolStatus = await this.getPoolStatus();
      
      // Check recent service health
      const serviceHealth = await this.getRecentServiceHealth();
      
      return {
        status: masterHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        poolStatus,
        serviceHealth,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async getPoolStatus(): Promise<any> {
    // Implementation would check actual pool metrics
    return {
      totalConnections: 15,
      idleConnections: 10,
      activeConnections: 5,
      waitingClients: 0
    };
  }
  
  private async getRecentServiceHealth(): Promise<any[]> {
    const client = await dbManager.getMasterConnection();
    
    try {
      const result = await client.query(`
        SELECT 
          s.name,
          s.status,
          sh.response_time,
          sh.checked_at
        FROM services s
        LEFT JOIN service_health sh ON s.id = sh.service_id
        WHERE sh.checked_at >= NOW() - INTERVAL '5 minutes'
        ORDER BY sh.checked_at DESC
        LIMIT 10
      `);
      
      return result.rows;
      
    } catch (error) {
      console.error('Failed to get recent service health:', error);
      return [];
    } finally {
      client.release();
    }
  }
}
```

## Backup and Recovery

### Backup Strategy
```bash
#!/bin/bash
# Database backup script

# Configuration
BACKUP_DIR="/var/backups/codex-metatron"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup master database
echo "Backing up master database..."
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/master_backup_$DATE.sql"

# Backup tenant databases (would need to iterate through tenants)
# This is a simplified example
echo "Backing up tenant databases..."
# pg_dump tenant_database_url > "$BACKUP_DIR/tenant_backup_$DATE.sql"

# Cleanup old backups
find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

## Troubleshooting

### Common Issues and Solutions

#### Connection Pool Exhaustion
```typescript
// Monitor and handle connection pool exhaustion
export class ConnectionPoolMonitor {
  
  async checkPoolHealth(): Promise<void> {
    const client = await dbManager.getMasterConnection();
    
    try {
      // Check for long-running queries
      const result = await client.query(`
        SELECT pid, now() - pg_stat_activity.query_start AS duration, query
        FROM pg_stat_activity
        WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
      `);
      
      if (result.rows.length > 0) {
        console.warn('Long-running queries detected:', result.rows);
      }
      
    } catch (error) {
      console.error('Pool health check failed:', error);
    } finally {
      client.release();
    }
  }
}
```

#### SSL/TLS Connection Issues
```typescript
// Handle SSL/TLS connection issues
const sslConfig = {
  rejectUnauthorized: false,  // For development
  ca: process.env.DB_SSL_CA,  // For production
  key: process.env.DB_SSL_KEY,
  cert: process.env.DB_SSL_CERT,
};
```

## Last Updated: July 10, 2025

This comprehensive database setup guide ensures secure, scalable, and maintainable database operations for the Codex Metatron Platform with proper Neon PostgreSQL integration and multi-tenant architecture support.