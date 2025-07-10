# Integration Levels Documentation

## Overview

The Codex Metatron Platform supports three distinct integration levels, each designed for different use cases and access requirements. This document outlines how to integrate with the platform at each level.

## Integration Levels

### Level 1: SUPERADMIN Integration

**Purpose**: Platform management, system administration, and full-scale integrations.

**Integration Methods**:
1. **API Integration**
   - Full REST API access
   - GraphQL API for complex queries
   - WebSocket connections for real-time updates
   - Bulk operations endpoints

2. **SDK Options**:
   ```typescript
   // TypeScript/JavaScript SDK
   import { CodexMetatronSDK } from '@codex-metatron/sdk';
   
   const sdk = new CodexMetatronSDK({
     apiKey: process.env.SUPERADMIN_API_KEY,
     apiSecret: process.env.SUPERADMIN_API_SECRET,
     environment: 'production'
   });
   
   // Full platform access
   const allClients = await sdk.clients.listAll();
   const systemMetrics = await sdk.system.getMetrics();
   ```

3. **Direct Database Access**:
   - Read replicas for analytics
   - Direct SQL access for reporting
   - Event streaming via Kafka/PostgreSQL logical replication

**Authentication**:
```http
POST /api/v1/auth/superadmin/login
Content-Type: application/json

{
  "email": "superadmin@platform.com",
  "password": "secure_password",
  "mfaToken": "123456"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "scope": "superadmin:*"
}
```

### Level 2: ADMIN Integration

**Purpose**: Managed access to specific clients and applications based on assigned permissions.

**Integration Methods**:
1. **Scoped API Access**:
   ```typescript
   // Admin SDK with permission-based access
   const adminSdk = new CodexMetatronSDK({
     apiKey: process.env.ADMIN_API_KEY,
     permissions: adminPermissions // Loaded from token
   });
   
   // Access limited by permissions
   try {
     const clients = await adminSdk.clients.list({
       filter: { assignedTo: adminId }
     });
   } catch (error) {
     if (error.code === 'PERMISSION_DENIED') {
       console.error('Insufficient permissions');
     }
   }
   ```

2. **Permission-Aware Endpoints**:
   ```http
   GET /api/v1/clients
   Authorization: Bearer {admin_token}
   
   # Response filtered based on admin permissions
   {
     "clients": [
       // Only clients admin has access to
     ],
     "pagination": {...}
   }
   ```

3. **Delegated Authentication**:
   ```typescript
   // OAuth2 flow for admin applications
   const oauth = new OAuth2Client({
     clientId: process.env.ADMIN_CLIENT_ID,
     clientSecret: process.env.ADMIN_CLIENT_SECRET,
     redirectUri: 'https://admin-app.com/callback',
     scope: 'admin:read admin:write clients:manage'
   });
   ```

**Permission Checking**:
```typescript
// Middleware example
async function checkAdminPermission(req, res, next) {
  const { resource, action } = req.params;
  const adminPermissions = req.user.permissions;
  
  if (!hasPermission(adminPermissions, resource, action)) {
    return res.status(403).json({
      error: 'Insufficient permissions',
      required: `${resource}:${action}`,
      current: adminPermissions
    });
  }
  
  next();
}
```

### Level 3: CLIENT Integration

**Purpose**: Self-service access for clients to manage their own applications and data.

**Integration Methods**:
1. **Client SDK**:
   ```typescript
   // Client-specific SDK
   const clientSdk = new CodexMetatronClientSDK({
     appId: process.env.CLIENT_APP_ID,
     appSecret: process.env.CLIENT_APP_SECRET,
     tenantId: process.env.TENANT_ID
   });
   
   // Access limited to own data
   const myAppData = await clientSdk.app.getData();
   const mySettings = await clientSdk.app.getSettings();
   
   // Attempting to access other client data throws error
   try {
     await clientSdk.app.getData({ appId: 'other-app-id' });
   } catch (error) {
     // Error: Access denied - can only access own application
   }
   ```

2. **Embedded Widgets**:
   ```html
   <!-- Client dashboard widget -->
   <div id="codex-metatron-widget"></div>
   <script>
     CodexMetatron.init({
       appId: 'your-app-id',
       containerId: 'codex-metatron-widget',
       theme: 'light',
       features: ['analytics', 'settings']
     });
   </script>
   ```

3. **Webhook Integration**:
   ```typescript
   // Register webhooks for client events
   await clientSdk.webhooks.register({
     url: 'https://myapp.com/webhooks',
     events: ['data.updated', 'settings.changed'],
     secret: generateWebhookSecret()
   });
   ```

## API Authentication Flows

### 1. API Key Authentication (All Levels)
```http
GET /api/v1/resource
X-API-Key: {api_key}
X-API-Secret: {api_secret}
```

### 2. OAuth2 Flow (ADMIN and CLIENT)
```
1. Authorization Request:
GET /oauth/authorize?
  client_id={client_id}&
  redirect_uri={redirect_uri}&
  response_type=code&
  scope={requested_scopes}&
  state={state}

2. Token Exchange:
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code={authorization_code}&
client_id={client_id}&
client_secret={client_secret}&
redirect_uri={redirect_uri}

3. Token Response:
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "scope": "granted scopes"
}
```

### 3. JWT Authentication (All Levels)
```typescript
// Token structure
{
  "sub": "user_id",
  "role": "ADMIN",
  "permissions": {...},
  "tenantId": "tenant_id", // For CLIENT role
  "exp": 1234567890,
  "iat": 1234567800
}
```

## Rate Limiting by Integration Level

| Level | Rate Limit | Burst Limit | Notes |
|-------|------------|-------------|-------|
| SUPERADMIN | 10,000/hour | 1,000/minute | Can be increased on request |
| ADMIN | 5,000/hour | 500/minute | Based on permission scope |
| CLIENT | 1,000/hour | 100/minute | Per application |

## SDK Installation

### JavaScript/TypeScript
```bash
# Full SDK (SUPERADMIN/ADMIN)
npm install @codex-metatron/sdk

# Client SDK
npm install @codex-metatron/client-sdk
```

### Python
```bash
# Full SDK
pip install codex-metatron

# Client SDK
pip install codex-metatron-client
```

### Go
```bash
# Full SDK
go get github.com/codex-metatron/sdk-go

# Client SDK
go get github.com/codex-metatron/client-sdk-go
```

## Integration Examples

### Example 1: SUPERADMIN Dashboard Integration
```typescript
// Complete platform monitoring dashboard
const dashboard = new CodexMetatronDashboard({
  credentials: superadminCredentials,
  features: ['clients', 'metrics', 'alerts', 'logs'],
  refreshInterval: 30000 // 30 seconds
});

dashboard.on('alert', (alert) => {
  notificationService.send(alert);
});
```

### Example 2: ADMIN Customer Management System
```typescript
// CRM integration with permission-based access
const crm = new CodexMetatronCRM({
  credentials: adminCredentials,
  permissions: adminPermissions,
  clientFilter: assignedClients
});

// Automatically filtered based on permissions
const myClients = await crm.getClients();
const clientMetrics = await crm.getClientMetrics(clientId);
```

### Example 3: CLIENT Self-Service Portal
```typescript
// Client portal with own data access
const portal = new CodexMetatronPortal({
  appCredentials: clientCredentials,
  features: ['data-management', 'settings', 'analytics']
});

// All operations scoped to client's own data
const myData = await portal.getData();
await portal.updateSettings({ theme: 'dark' });
```

## Security Best Practices

1. **API Key Rotation**:
   - SUPERADMIN: Monthly rotation
   - ADMIN: Quarterly rotation
   - CLIENT: Annual rotation or on-demand

2. **IP Whitelisting**:
   - Available for all integration levels
   - Recommended for SUPERADMIN integrations
   - Optional but encouraged for ADMIN/CLIENT

3. **Audit Logging**:
   - All API calls are logged
   - Retention: 90 days standard, 1 year for SUPERADMIN
   - Real-time alerts for suspicious activity

4. **Encryption**:
   - TLS 1.3 for all API communications
   - End-to-end encryption for sensitive data
   - At-rest encryption for stored credentials