# Database Security - Neon PostgreSQL Protection

## Overview
This document outlines critical security measures for protecting the Neon PostgreSQL database connection and ensuring secure multi-tenant data isolation in the Codex Metatron Platform.

## Connection String Security

### Critical Security Information
**Database Connection String**: `postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

⚠️ **SECURITY CRITICAL**: This connection string contains sensitive credentials that provide full access to the database.

### Security Requirements

#### 1. Environment Variable Protection
```bash
# NEVER commit connection strings to version control
# ALWAYS use environment variables

# Production Environment
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Development Environment
DATABASE_URL=postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### 2. Git Security Measures
```bash
# Add to .gitignore (MANDATORY)
.env
.env.local
.env.production
.env.development
.env.test
*.env

# Environment files that should NEVER be committed
.env.*
config/database.conf
secrets/
```

#### 3. File System Permissions
```bash
# Set restrictive permissions on environment files
chmod 600 .env
chmod 600 .env.production
chmod 600 .env.development

# Ensure only owner can read/write
chown $USER:$USER .env
```

## Connection Security Implementation

### 1. Secure Connection Manager
```typescript
// libs/shared/database/secure-connection.ts
import { Pool } from 'pg';
import { createHash } from 'crypto';

export class SecureConnectionManager {
  private masterPool: Pool;
  private connectionHash: string;
  private lastConnectionCheck: Date;

  constructor() {
    this.validateEnvironment();
    this.initializeSecureConnection();
    this.setupConnectionMonitoring();
  }

  private validateEnvironment(): void {
    const requiredEnvVars = [
      'DATABASE_URL',
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Validate connection string format
    if (!process.env.DATABASE_URL?.includes('sslmode=require')) {
      throw new Error('Database connection must use SSL (sslmode=require)');
    }

    // Validate SSL channel binding
    if (!process.env.DATABASE_URL?.includes('channel_binding=require')) {
      throw new Error('Database connection must use channel binding');
    }
  }

  private initializeSecureConnection(): void {
    // Hash the connection string for monitoring
    this.connectionHash = createHash('sha256')
      .update(process.env.DATABASE_URL!)
      .digest('hex');

    this.masterPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA,
        cert: process.env.DB_SSL_CERT,
        key: process.env.DB_SSL_KEY,
      },
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '10000'),
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
      // Additional security options
      application_name: `codex-metatron-${process.env.NODE_ENV}`,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    // Set up connection event handlers
    this.masterPool.on('connect', (client) => {
      this.logSecurityEvent('DATABASE_CONNECT', { 
        clientId: client.processID,
        timestamp: new Date().toISOString()
      });
    });

    this.masterPool.on('error', (err, client) => {
      this.logSecurityEvent('DATABASE_ERROR', { 
        error: err.message,
        clientId: client?.processID,
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupConnectionMonitoring(): void {
    // Monitor connection health every 30 seconds
    setInterval(() => {
      this.performSecurityHealthCheck();
    }, 30000);
  }

  private async performSecurityHealthCheck(): Promise<void> {
    try {
      const client = await this.masterPool.connect();
      
      // Check connection security
      const securityCheck = await client.query(`
        SELECT 
          current_user,
          session_user,
          ssl_is_used() as ssl_enabled,
          inet_client_addr() as client_ip,
          inet_client_port() as client_port,
          application_name,
          backend_start,
          state
        FROM pg_stat_activity 
        WHERE pid = pg_backend_pid()
      `);

      const connectionInfo = securityCheck.rows[0];
      
      // Verify SSL is enabled
      if (!connectionInfo.ssl_enabled) {
        throw new Error('SECURITY VIOLATION: SSL connection not enabled');
      }

      // Log connection security status
      this.logSecurityEvent('SECURITY_CHECK_PASSED', {
        user: connectionInfo.current_user,
        ssl_enabled: connectionInfo.ssl_enabled,
        client_ip: connectionInfo.client_ip,
        timestamp: new Date().toISOString()
      });

      this.lastConnectionCheck = new Date();
      client.release();

    } catch (error) {
      this.logSecurityEvent('SECURITY_CHECK_FAILED', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  private logSecurityEvent(event: string, details: any): void {
    console.log(`[SECURITY] ${event}:`, JSON.stringify(details, null, 2));
    
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToSecurityService(event, details);
    }
  }

  private sendToSecurityService(event: string, details: any): void {
    // Implementation would send to security monitoring service
    // Examples: Datadog, New Relic, custom security service
  }

  async getSecureConnection() {
    return this.masterPool.connect();
  }
}

export const secureDbManager = new SecureConnectionManager();
```

### 2. Connection String Validation
```typescript
// libs/shared/database/connection-validator.ts
import { URL } from 'url';

export class ConnectionValidator {
  
  static validateConnectionString(connectionString: string): boolean {
    try {
      const dbUrl = new URL(connectionString);
      
      // Check protocol
      if (dbUrl.protocol !== 'postgresql:') {
        throw new Error('Invalid protocol: must be postgresql://');
      }

      // Check host
      if (!dbUrl.hostname || !dbUrl.hostname.includes('neon.tech')) {
        throw new Error('Invalid host: must be Neon database');
      }

      // Check authentication
      if (!dbUrl.username || !dbUrl.password) {
        throw new Error('Missing authentication credentials');
      }

      // Check SSL requirements
      const searchParams = new URLSearchParams(dbUrl.search);
      if (searchParams.get('sslmode') !== 'require') {
        throw new Error('SSL mode must be "require"');
      }

      if (searchParams.get('channel_binding') !== 'require') {
        throw new Error('Channel binding must be "require"');
      }

      // Check for sensitive data exposure
      if (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) {
        console.warn('Warning: Connection string contains localhost reference');
      }

      return true;

    } catch (error) {
      console.error('Connection string validation failed:', error.message);
      return false;
    }
  }

  static sanitizeConnectionString(connectionString: string): string {
    // Remove sensitive information for logging
    try {
      const dbUrl = new URL(connectionString);
      return `postgresql://${dbUrl.username.substring(0, 3)}***@${dbUrl.hostname}/${dbUrl.pathname}`;
    } catch (error) {
      return 'postgresql://***@***/***/***';
    }
  }

  static generateConnectionHash(connectionString: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(connectionString).digest('hex');
  }
}
```

## Multi-Tenant Security

### 1. Tenant Data Isolation
```typescript
// libs/shared/database/tenant-security.ts
import { secureDbManager } from './secure-connection';

export class TenantSecurityManager {
  
  async validateTenantAccess(tenantId: string, apiKey: string): Promise<boolean> {
    const client = await secureDbManager.getSecureConnection();
    
    try {
      // Validate tenant exists and API key matches
      const result = await client.query(`
        SELECT 
          id, 
          name, 
          status, 
          created_at,
          last_access
        FROM tenants 
        WHERE id = $1 AND api_key = $2 AND status = 'active'
      `, [tenantId, apiKey]);

      if (result.rows.length === 0) {
        this.logSecurityViolation('INVALID_TENANT_ACCESS', {
          tenantId,
          apiKey: apiKey.substring(0, 8) + '***',
          timestamp: new Date().toISOString()
        });
        return false;
      }

      // Update last access time
      await client.query(`
        UPDATE tenants 
        SET last_access = NOW() 
        WHERE id = $1
      `, [tenantId]);

      this.logSecurityEvent('TENANT_ACCESS_GRANTED', {
        tenantId,
        tenantName: result.rows[0].name,
        timestamp: new Date().toISOString()
      });

      return true;

    } catch (error) {
      this.logSecurityViolation('TENANT_ACCESS_ERROR', {
        tenantId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    } finally {
      client.release();
    }
  }

  async createTenantSecurely(tenantData: any): Promise<string> {
    const client = await secureDbManager.getSecureConnection();
    
    try {
      // Generate secure API key
      const apiKey = this.generateSecureApiKey();
      
      // Create tenant with security audit
      const result = await client.query(`
        INSERT INTO tenants (id, name, api_key, status, created_at)
        VALUES ($1, $2, $3, 'active', NOW())
        RETURNING id
      `, [tenantData.id, tenantData.name, apiKey]);

      // Log tenant creation
      this.logSecurityEvent('TENANT_CREATED', {
        tenantId: tenantData.id,
        tenantName: tenantData.name,
        timestamp: new Date().toISOString()
      });

      return apiKey;

    } catch (error) {
      this.logSecurityViolation('TENANT_CREATION_FAILED', {
        tenantData: { id: tenantData.id, name: tenantData.name },
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    } finally {
      client.release();
    }
  }

  private generateSecureApiKey(): string {
    const crypto = require('crypto');
    const prefix = 'cdx_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now().toString(36);
    return `${prefix}${timestamp}_${randomBytes}`;
  }

  private logSecurityEvent(event: string, details: any): void {
    console.log(`[TENANT_SECURITY] ${event}:`, JSON.stringify(details, null, 2));
  }

  private logSecurityViolation(violation: string, details: any): void {
    console.error(`[SECURITY_VIOLATION] ${violation}:`, JSON.stringify(details, null, 2));
    
    // In production, immediately alert security team
    if (process.env.NODE_ENV === 'production') {
      this.alertSecurityTeam(violation, details);
    }
  }

  private alertSecurityTeam(violation: string, details: any): void {
    // Implementation would alert security team via:
    // - Email notifications
    // - Slack/Teams alerts
    // - Security monitoring dashboard
    // - SMS for critical violations
  }
}

export const tenantSecurity = new TenantSecurityManager();
```

### 2. Database Query Security
```typescript
// libs/shared/database/query-security.ts
export class QuerySecurityManager {
  
  static validateQuery(query: string, params: any[]): boolean {
    // Prevent SQL injection
    const dangerousPatterns = [
      /;\s*DROP\s+/i,
      /;\s*DELETE\s+FROM\s+/i,
      /;\s*UPDATE\s+/i,
      /;\s*INSERT\s+INTO\s+/i,
      /;\s*ALTER\s+/i,
      /;\s*CREATE\s+/i,
      /;\s*TRUNCATE\s+/i,
      /UNION\s+SELECT/i,
      /--/,
      /\/\*/,
      /\*\//
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        console.error('SECURITY VIOLATION: Dangerous SQL pattern detected:', query);
        return false;
      }
    }

    // Validate parameters
    if (params.some(param => typeof param === 'string' && param.includes(';'))) {
      console.error('SECURITY VIOLATION: Dangerous parameter detected:', params);
      return false;
    }

    return true;
  }

  static sanitizeQuery(query: string): string {
    // Remove comments and normalize whitespace
    return query
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static logQuery(query: string, params: any[], tenantId?: string): void {
    const sanitizedQuery = this.sanitizeQuery(query);
    const logData = {
      query: sanitizedQuery,
      paramCount: params.length,
      tenantId: tenantId || 'master',
      timestamp: new Date().toISOString()
    };

    console.log('[QUERY_LOG]:', JSON.stringify(logData, null, 2));
  }
}
```

## Access Control and Permissions

### 1. Role-Based Access Control
```typescript
// libs/shared/database/rbac.ts
export enum DatabaseRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  READONLY = 'readonly'
}

export class DatabaseRBAC {
  
  static async checkPermission(
    userId: string, 
    resource: string, 
    action: string, 
    tenantId?: string
  ): Promise<boolean> {
    const client = await secureDbManager.getSecureConnection();
    
    try {
      const query = tenantId 
        ? `SELECT role FROM users WHERE id = $1 AND tenant_id = $2`
        : `SELECT role FROM admins WHERE id = $1`;
      
      const params = tenantId ? [userId, tenantId] : [userId];
      const result = await client.query(query, params);
      
      if (result.rows.length === 0) {
        return false;
      }
      
      const userRole = result.rows[0].role;
      return this.validateRolePermission(userRole, resource, action);
      
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    } finally {
      client.release();
    }
  }

  private static validateRolePermission(
    role: DatabaseRole, 
    resource: string, 
    action: string
  ): boolean {
    const permissions = {
      [DatabaseRole.SUPER_ADMIN]: ['*'],
      [DatabaseRole.ADMIN]: [
        'tenants:read', 'tenants:write', 'tenants:delete',
        'users:read', 'users:write', 'users:delete',
        'content:read', 'content:write', 'content:delete',
        'services:read', 'services:write'
      ],
      [DatabaseRole.USER]: [
        'content:read', 'content:write',
        'profile:read', 'profile:write'
      ],
      [DatabaseRole.READONLY]: [
        'content:read', 'profile:read'
      ]
    };

    const rolePermissions = permissions[role] || [];
    const requiredPermission = `${resource}:${action}`;
    
    return rolePermissions.includes('*') || 
           rolePermissions.includes(requiredPermission);
  }
}
```

## Monitoring and Alerting

### 1. Security Event Monitoring
```typescript
// libs/infrastructure/monitoring/security-monitor.ts
export class SecurityMonitor {
  
  private static instance: SecurityMonitor;
  private alertThresholds = {
    failedLogins: 5,
    invalidApiKeys: 3,
    suspiciousQueries: 1,
    connectionFailures: 10
  };

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  async logSecurityEvent(event: string, details: any): Promise<void> {
    const securityLog = {
      event,
      details,
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(event),
      source: 'database',
      environment: process.env.NODE_ENV
    };

    // Store in security log table
    await this.storeSecurityLog(securityLog);
    
    // Check for alert conditions
    await this.checkAlertConditions(event, details);
    
    // Send to external monitoring services
    await this.sendToMonitoringServices(securityLog);
  }

  private determineSeverity(event: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalEvents = ['SECURITY_VIOLATION', 'UNAUTHORIZED_ACCESS', 'DATA_BREACH'];
    const highEvents = ['FAILED_LOGIN', 'INVALID_API_KEY', 'SUSPICIOUS_QUERY'];
    const mediumEvents = ['CONNECTION_FAILURE', 'RATE_LIMIT_EXCEEDED'];
    
    if (criticalEvents.some(e => event.includes(e))) return 'CRITICAL';
    if (highEvents.some(e => event.includes(e))) return 'HIGH';
    if (mediumEvents.some(e => event.includes(e))) return 'MEDIUM';
    return 'LOW';
  }

  private async storeSecurityLog(securityLog: any): Promise<void> {
    const client = await secureDbManager.getSecureConnection();
    
    try {
      await client.query(`
        INSERT INTO security_logs (
          event, details, timestamp, severity, source, environment
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        securityLog.event,
        JSON.stringify(securityLog.details),
        securityLog.timestamp,
        securityLog.severity,
        securityLog.source,
        securityLog.environment
      ]);
    } finally {
      client.release();
    }
  }

  private async checkAlertConditions(event: string, details: any): Promise<void> {
    // Check for patterns that require immediate attention
    if (event.includes('FAILED_LOGIN')) {
      await this.checkFailedLoginThreshold(details.userId);
    }
    
    if (event.includes('INVALID_API_KEY')) {
      await this.checkInvalidApiKeyThreshold(details.tenantId);
    }
  }

  private async checkFailedLoginThreshold(userId: string): Promise<void> {
    const client = await secureDbManager.getSecureConnection();
    
    try {
      const result = await client.query(`
        SELECT COUNT(*) as failed_attempts
        FROM security_logs
        WHERE event = 'FAILED_LOGIN' 
        AND details->>'userId' = $1
        AND timestamp >= NOW() - INTERVAL '1 hour'
      `, [userId]);
      
      const failedAttempts = parseInt(result.rows[0].failed_attempts);
      
      if (failedAttempts >= this.alertThresholds.failedLogins) {
        await this.sendAlert('ACCOUNT_LOCKOUT', {
          userId,
          failedAttempts,
          timeframe: '1 hour'
        });
      }
    } finally {
      client.release();
    }
  }

  private async sendAlert(alertType: string, details: any): Promise<void> {
    console.error(`[SECURITY_ALERT] ${alertType}:`, details);
    
    // In production, send to:
    // - Security team email
    // - Slack/Teams channels
    // - SMS for critical alerts
    // - Security monitoring dashboard
  }

  private async sendToMonitoringServices(securityLog: any): Promise<void> {
    // Send to external monitoring services
    // Examples: Datadog, New Relic, Splunk, etc.
  }
}

export const securityMonitor = SecurityMonitor.getInstance();
```

## Data Encryption

### 1. At-Rest Encryption
```typescript
// libs/shared/database/encryption.ts
import { createCipher, createDecipher } from 'crypto';

export class DatabaseEncryption {
  
  private static readonly ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'default-key';
  private static readonly ALGORITHM = 'aes-256-cbc';

  static encryptSensitiveData(data: string): string {
    const cipher = createCipher(this.ALGORITHM, this.ENCRYPTION_KEY);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  static decryptSensitiveData(encryptedData: string): string {
    const decipher = createDecipher(this.ALGORITHM, this.ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static hashPassword(password: string): string {
    const bcrypt = require('bcrypt');
    return bcrypt.hashSync(password, 12);
  }

  static verifyPassword(password: string, hash: string): boolean {
    const bcrypt = require('bcrypt');
    return bcrypt.compareSync(password, hash);
  }
}
```

### 2. In-Transit Encryption
```typescript
// All database connections must use SSL/TLS
const secureConnectionConfig = {
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY,
    // Force TLS 1.3
    minVersion: 'TLSv1.3',
    maxVersion: 'TLSv1.3',
    ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
    honorCipherOrder: true
  }
};
```

## Security Checklist

### Development Security
- [ ] Never commit .env files to version control
- [ ] Use environment variables for all sensitive data
- [ ] Validate all database connection strings
- [ ] Implement connection pooling with limits
- [ ] Use SSL/TLS for all database connections
- [ ] Sanitize all database queries
- [ ] Implement query timeout limits
- [ ] Log all database access attempts

### Production Security
- [ ] Use strong, unique passwords for database users
- [ ] Enable database access logging
- [ ] Implement connection IP whitelisting
- [ ] Use SSL certificates from trusted CAs
- [ ] Enable database encryption at rest
- [ ] Implement backup encryption
- [ ] Set up security monitoring and alerting
- [ ] Regular security audits and penetration testing
- [ ] Rotate database credentials regularly
- [ ] Implement database firewall rules

### Multi-Tenant Security
- [ ] Validate tenant access on every request
- [ ] Implement proper data isolation
- [ ] Use tenant-specific database connections
- [ ] Audit cross-tenant access attempts
- [ ] Implement tenant resource quotas
- [ ] Monitor tenant API usage
- [ ] Secure tenant API keys
- [ ] Implement tenant data backup isolation

## Incident Response

### Security Incident Types
1. **Unauthorized Database Access**
2. **SQL Injection Attempts**
3. **Connection String Exposure**
4. **Failed Authentication Attempts**
5. **Suspicious Query Patterns**
6. **Data Breach Attempts**
7. **Tenant Data Cross-Contamination**

### Response Procedures
1. **Immediate Response**: Isolate affected systems
2. **Assessment**: Determine scope and impact
3. **Containment**: Prevent further damage
4. **Recovery**: Restore normal operations
5. **Lessons Learned**: Document and improve

## Regular Security Maintenance

### Weekly Tasks
- [ ] Review security logs for anomalies
- [ ] Check database connection health
- [ ] Monitor failed authentication attempts
- [ ] Review tenant access patterns

### Monthly Tasks
- [ ] Update database credentials
- [ ] Review and update security policies
- [ ] Test backup and recovery procedures
- [ ] Conduct security training for developers

### Quarterly Tasks
- [ ] Security audit and penetration testing
- [ ] Review and update encryption keys
- [ ] Update security monitoring rules
- [ ] Review tenant security configurations

## Emergency Contacts

### Security Team
- **Primary**: security@codex-metatron.com
- **Secondary**: admin@codex-metatron.com
- **Emergency**: +1-XXX-XXX-XXXX

### Database Provider (Neon)
- **Support**: support@neon.tech
- **Emergency**: Check Neon dashboard for contact info

## Last Updated: July 10, 2025

This security documentation must be reviewed and updated regularly to ensure continued protection of the Neon PostgreSQL database and tenant data.