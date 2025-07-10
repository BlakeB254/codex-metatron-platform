# API Authentication & Authorization Documentation

## Overview

This document details the authentication and authorization mechanisms for the Codex Metatron Platform API, including implementation details, security considerations, and best practices.

## Authentication Methods

### 1. API Key Authentication

**Use Case**: Server-to-server communication, automated systems

**Implementation**:
```http
GET /api/v1/resource
Headers:
  X-API-Key: {public_key}
  X-API-Secret: {secret_key}
```

**Key Generation**:
```typescript
// API key generation service
export class ApiKeyService {
  generateApiKeyPair(userId: string, role: UserRole): ApiKeyPair {
    const publicKey = `pk_${role.toLowerCase()}_${generateRandomString(32)}`;
    const secretKey = `sk_${role.toLowerCase()}_${generateRandomString(48)}`;
    
    // Store hashed secret in database
    const hashedSecret = await bcrypt.hash(secretKey, 12);
    
    await db.apiKeys.create({
      userId,
      publicKey,
      secretKeyHash: hashedSecret,
      role,
      permissions: getDefaultPermissions(role),
      createdAt: new Date(),
      expiresAt: getExpirationDate(role)
    });
    
    return { publicKey, secretKey }; // Return plain secret only once
  }
}
```

### 2. JWT Bearer Token Authentication

**Use Case**: Web applications, mobile apps, user-facing integrations

**Token Structure**:
```typescript
interface JWTPayload {
  // Standard claims
  sub: string;          // User ID
  iat: number;          // Issued at
  exp: number;          // Expiration
  jti: string;          // JWT ID (for revocation)
  
  // Custom claims
  role: 'SUPERADMIN' | 'ADMIN' | 'CLIENT';
  tenantId?: string;    // Required for CLIENT role
  permissions?: PermissionScope; // For ADMIN role
  sessionId: string;    // For session management
}
```

**Token Generation**:
```typescript
export class TokenService {
  generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      sub: user.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      jti: generateTokenId(),
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions,
      sessionId: user.sessionId
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: 'HS512',
      issuer: 'codex-metatron'
    });
  }
  
  generateRefreshToken(user: User): string {
    const refreshPayload = {
      sub: user.id,
      sessionId: user.sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    return jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET, {
      algorithm: 'HS512'
    });
  }
}
```

**Token Usage**:
```http
GET /api/v1/resource
Authorization: Bearer {access_token}
```

### 3. OAuth 2.0 Flow

**Use Case**: Third-party integrations, partner applications

**Authorization Code Flow**:
```typescript
// 1. Authorization endpoint
app.get('/oauth/authorize', (req, res) => {
  const { client_id, redirect_uri, scope, state } = req.query;
  
  // Validate client and redirect URI
  if (!validateClient(client_id, redirect_uri)) {
    return res.status(400).json({ error: 'invalid_client' });
  }
  
  // Generate authorization code
  const code = generateAuthorizationCode({
    clientId: client_id,
    userId: req.user.id,
    scope: scope.split(' '),
    redirectUri: redirect_uri
  });
  
  // Redirect back with code
  res.redirect(`${redirect_uri}?code=${code}&state=${state}`);
});

// 2. Token exchange endpoint
app.post('/oauth/token', async (req, res) => {
  const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;
  
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }
  
  // Validate code and client
  const authCode = await validateAuthorizationCode(code, client_id, client_secret);
  if (!authCode) {
    return res.status(400).json({ error: 'invalid_grant' });
  }
  
  // Generate tokens
  const tokens = generateOAuthTokens(authCode.userId, authCode.scope);
  
  res.json({
    access_token: tokens.accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: tokens.refreshToken,
    scope: authCode.scope.join(' ')
  });
});
```

## Authorization Middleware

### Permission Checking Middleware
```typescript
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    // SUPERADMIN bypass
    if (user.role === 'SUPERADMIN') {
      return next();
    }
    
    // ADMIN permission check
    if (user.role === 'ADMIN') {
      const hasPermission = checkAdminPermission(
        user.permissions,
        resource,
        action,
        req.params.id // Resource ID if applicable
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions',
          required: `${resource}:${action}`
        });
      }
      
      return next();
    }
    
    // CLIENT ownership check
    if (user.role === 'CLIENT') {
      const isOwner = await checkResourceOwnership(
        user.id,
        user.tenantId,
        resource,
        req.params.id
      );
      
      if (!isOwner) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied to resource'
        });
      }
      
      return next();
    }
    
    // Default deny
    res.status(403).json({ error: 'Forbidden' });
  };
}
```

### Role-Based Access Control (RBAC)
```typescript
export const rolePermissions = {
  SUPERADMIN: {
    clients: ['create', 'read', 'update', 'delete'],
    applications: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    system: ['read', 'update'],
    '*': ['*'] // Wildcard for all permissions
  },
  ADMIN: {
    // Permissions are dynamically assigned
    // Stored in database and loaded per user
  },
  CLIENT: {
    ownData: ['read', 'update'],
    ownSettings: ['read', 'update'],
    ownReports: ['read']
  }
};
```

## Session Management

### Session Storage
```typescript
// Redis session store
export class SessionStore {
  private redis: Redis;
  
  async createSession(userId: string, metadata: SessionMetadata): Promise<string> {
    const sessionId = generateSessionId();
    const sessionData = {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      ...metadata
    };
    
    // Store in Redis with TTL
    await this.redis.setex(
      `session:${sessionId}`,
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify(sessionData)
    );
    
    // Add to user's session list
    await this.redis.sadd(`user:${userId}:sessions`, sessionId);
    
    return sessionId;
  }
  
  async validateSession(sessionId: string): Promise<Session | null> {
    const sessionData = await this.redis.get(`session:${sessionId}`);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Update last activity
    session.lastActivity = Date.now();
    await this.redis.setex(
      `session:${sessionId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(session)
    );
    
    return session;
  }
  
  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.redis.get(`session:${sessionId}`);
    if (session) {
      const { userId } = JSON.parse(session);
      await this.redis.srem(`user:${userId}:sessions`, sessionId);
      await this.redis.del(`session:${sessionId}`);
    }
  }
}
```

## Multi-Factor Authentication (MFA)

### TOTP Implementation
```typescript
export class MFAService {
  generateSecret(userId: string): MFASetup {
    const secret = speakeasy.generateSecret({
      length: 32,
      name: `CodexMetatron (${userId})`,
      issuer: 'Codex Metatron Platform'
    });
    
    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url,
      backupCodes: this.generateBackupCodes()
    };
  }
  
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 intervals before/after
    });
  }
  
  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
  }
}
```

## Security Headers

### Required Security Headers
```typescript
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}
```

## Rate Limiting Implementation

### Rate Limiter Configuration
```typescript
export const rateLimiters = {
  SUPERADMIN: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000,
    message: 'Rate limit exceeded for SUPERADMIN',
    standardHeaders: true,
    legacyHeaders: false
  }),
  
  ADMIN: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5000,
    keyGenerator: (req) => `${req.user.id}:${req.user.role}`,
    skip: (req) => req.user.permissions?.unlimited
  }),
  
  CLIENT: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
    keyGenerator: (req) => `${req.user.tenantId}:${req.user.appId}`
  })
};
```

## Audit Logging

### Authentication Audit Events
```typescript
export enum AuthAuditEvent {
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  TOKEN_REFRESH = 'auth.token.refresh',
  MFA_SUCCESS = 'auth.mfa.success',
  MFA_FAILURE = 'auth.mfa.failure',
  PERMISSION_DENIED = 'auth.permission.denied',
  SESSION_EXPIRED = 'auth.session.expired'
}

export class AuditLogger {
  async log(event: AuthAuditEvent, context: AuditContext): Promise<void> {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId: context.userId,
      userRole: context.userRole,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      resource: context.resource,
      action: context.action,
      result: context.result,
      metadata: context.metadata
    };
    
    // Store in time-series database
    await this.timeseriesDB.insert('audit_logs', auditEntry);
    
    // Real-time alerting for critical events
    if (this.isCriticalEvent(event)) {
      await this.alertingService.notify(auditEntry);
    }
  }
}
```

## Best Practices

1. **Token Rotation**:
   - Access tokens: 15-minute expiry
   - Refresh tokens: 7-day expiry with rotation
   - API keys: Role-based expiration

2. **Secure Storage**:
   - Never store plain-text secrets
   - Use bcrypt (min 12 rounds) for password hashing
   - Encrypt sensitive data at rest

3. **Transport Security**:
   - TLS 1.3 minimum
   - Certificate pinning for mobile apps
   - HPKP headers for web applications

4. **Error Handling**:
   - Generic error messages to prevent information leakage
   - Detailed logging server-side
   - Rate limit error responses

5. **Monitoring**:
   - Real-time authentication anomaly detection
   - Failed login attempt tracking
   - Geographical anomaly alerts