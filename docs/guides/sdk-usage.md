# SDK Usage Guide

## Overview

This guide provides comprehensive examples and best practices for using the Codex Metatron Platform SDKs across different programming languages and user roles.

## SDK Installation

### JavaScript/TypeScript

```bash
# For SUPERADMIN/ADMIN usage
npm install @codex-metatron/sdk

# For CLIENT usage
npm install @codex-metatron/client-sdk

# TypeScript types included
```

### Python

```bash
# For SUPERADMIN/ADMIN usage
pip install codex-metatron

# For CLIENT usage
pip install codex-metatron-client
```

### Go

```bash
# For SUPERADMIN/ADMIN usage
go get github.com/codex-metatron/sdk-go

# For CLIENT usage
go get github.com/codex-metatron/client-sdk-go
```

## SUPERADMIN SDK Usage

### TypeScript/JavaScript

```typescript
import { CodexMetatronSDK, SystemMetrics, Client } from '@codex-metatron/sdk';

// Initialize SDK
const sdk = new CodexMetatronSDK({
  apiKey: process.env.SUPERADMIN_API_KEY,
  apiSecret: process.env.SUPERADMIN_API_SECRET,
  environment: 'production', // or 'staging', 'development'
  options: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000
  }
});

// Client Management
async function manageClients() {
  // List all clients
  const clients = await sdk.clients.list({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Create new client
  const newClient = await sdk.clients.create({
    name: 'New Client Corp',
    email: 'admin@newclient.com',
    plan: 'enterprise',
    settings: {
      timezone: 'America/New_York',
      language: 'en'
    }
  });
  
  // Update client
  await sdk.clients.update(newClient.id, {
    plan: 'enterprise-plus',
    settings: {
      features: ['advanced-analytics', 'custom-branding']
    }
  });
  
  // Delete client (soft delete)
  await sdk.clients.delete(newClient.id);
}

// System Monitoring
async function monitorSystem() {
  // Get real-time metrics
  const metrics: SystemMetrics = await sdk.system.getMetrics();
  console.log('CPU Usage:', metrics.cpu.usage);
  console.log('Memory Usage:', metrics.memory.used / metrics.memory.total);
  console.log('Active Users:', metrics.activeUsers);
  
  // Get system health
  const health = await sdk.system.getHealth();
  if (health.status !== 'healthy') {
    console.error('System issues:', health.issues);
  }
  
  // Stream real-time events
  const eventStream = sdk.system.streamEvents({
    events: ['client.created', 'system.alert', 'error.critical']
  });
  
  eventStream.on('event', (event) => {
    console.log('System event:', event);
  });
}

// User Management
async function manageUsers() {
  // Create admin user
  const admin = await sdk.users.create({
    email: 'admin@company.com',
    role: 'ADMIN',
    permissions: {
      clients: { read: true, write: true, delete: false },
      applications: { read: true, write: true },
      analytics: { viewSystemMetrics: true }
    }
  });
  
  // Bulk operations
  const results = await sdk.users.bulkUpdate([
    { id: 'user1', updates: { status: 'active' } },
    { id: 'user2', updates: { role: 'ADMIN' } }
  ]);
}

// Advanced Analytics
async function analytics() {
  // Platform-wide analytics
  const platformStats = await sdk.analytics.getPlatformStats({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    metrics: ['revenue', 'users', 'api_calls', 'storage']
  });
  
  // Generate custom report
  const report = await sdk.analytics.generateReport({
    type: 'usage',
    format: 'pdf',
    filters: {
      clients: ['client1', 'client2'],
      dateRange: 'last_quarter'
    }
  });
  
  // Export data
  const exportUrl = await sdk.analytics.exportData({
    format: 'csv',
    data: 'all_transactions',
    compression: 'gzip'
  });
}
```

### Python

```python
from codex_metatron import CodexMetatronSDK
from codex_metatron.models import Client, SystemMetrics
import asyncio

# Initialize SDK
sdk = CodexMetatronSDK(
    api_key=os.environ['SUPERADMIN_API_KEY'],
    api_secret=os.environ['SUPERADMIN_API_SECRET'],
    environment='production'
)

# Async client management
async def manage_clients():
    # List clients with filtering
    clients = await sdk.clients.list(
        filters={'status': 'active', 'plan': 'enterprise'},
        page=1,
        page_size=50
    )
    
    # Batch operations
    async with sdk.batch() as batch:
        for client in clients:
            batch.update_client(
                client.id,
                {'last_health_check': datetime.now()}
            )
        results = await batch.execute()
    
    # Complex queries
    inactive_clients = await sdk.clients.query("""
        SELECT * FROM clients 
        WHERE last_activity < NOW() - INTERVAL '30 days'
        AND status = 'active'
    """)

# System monitoring with context manager
async def monitor_system():
    async with sdk.monitoring() as monitor:
        # Subscribe to metrics
        async for metric in monitor.stream_metrics(['cpu', 'memory', 'disk']):
            if metric.value > metric.threshold:
                await sdk.alerts.create({
                    'type': 'system',
                    'severity': 'high',
                    'message': f'{metric.name} exceeded threshold'
                })

# Audit log analysis
def analyze_audit_logs():
    # Query audit logs
    suspicious_activity = sdk.audit.query(
        event_types=['permission.denied', 'login.failed'],
        time_range='last_hour',
        group_by='user_id'
    )
    
    for user_id, events in suspicious_activity.items():
        if len(events) > 10:
            sdk.security.flag_user(user_id, 'suspicious_activity')
```

### Go

```go
package main

import (
    "context"
    "log"
    sdk "github.com/codex-metatron/sdk-go"
)

func main() {
    // Initialize SDK
    client, err := sdk.NewClient(
        sdk.WithAPIKey(os.Getenv("SUPERADMIN_API_KEY")),
        sdk.WithAPISecret(os.Getenv("SUPERADMIN_API_SECRET")),
        sdk.WithEnvironment(sdk.Production),
    )
    if err != nil {
        log.Fatal(err)
    }
    
    ctx := context.Background()
    
    // Client management
    clients, err := client.Clients.List(ctx, &sdk.ListOptions{
        Page:  1,
        Limit: 50,
    })
    
    // Concurrent operations
    var wg sync.WaitGroup
    errors := make(chan error, len(clients))
    
    for _, c := range clients {
        wg.Add(1)
        go func(client sdk.Client) {
            defer wg.Done()
            if err := processClient(ctx, client); err != nil {
                errors <- err
            }
        }(c)
    }
    
    wg.Wait()
    close(errors)
}
```

## ADMIN SDK Usage

### TypeScript/JavaScript

```typescript
import { CodexMetatronSDK } from '@codex-metatron/sdk';

// Initialize with admin credentials
const adminSdk = new CodexMetatronSDK({
  apiKey: process.env.ADMIN_API_KEY,
  apiSecret: process.env.ADMIN_API_SECRET,
  environment: 'production'
});

// Permission-scoped operations
async function adminOperations() {
  try {
    // Get assigned clients only
    const myClients = await adminSdk.clients.list();
    // SDK automatically filters based on admin permissions
    
    // Update client within permission scope
    await adminSdk.clients.update('client-id', {
      settings: { notifications: true }
    });
    
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      console.error('Insufficient permissions:', error.required);
    }
  }
}

// Admin dashboard data
async function getAdminDashboard() {
  const dashboard = await adminSdk.dashboard.getData({
    widgets: ['client-overview', 'recent-activity', 'alerts'],
    timeRange: 'last_7_days'
  });
  
  // Handle permission-filtered data
  dashboard.widgets.forEach(widget => {
    console.log(`${widget.name}: ${widget.data.length} items`);
  });
}

// User management (if permitted)
async function manageUsers() {
  // Check if admin has user management permissions
  const permissions = await adminSdk.auth.getMyPermissions();
  
  if (permissions.users?.create) {
    const newUser = await adminSdk.users.create({
      email: 'newuser@client.com',
      role: 'CLIENT',
      clientId: 'assigned-client-id'
    });
  }
}
```

### Python

```python
from codex_metatron import CodexMetatronAdminSDK
from codex_metatron.exceptions import PermissionDeniedError

# Initialize admin SDK
admin_sdk = CodexMetatronAdminSDK(
    api_key=os.environ['ADMIN_API_KEY'],
    api_secret=os.environ['ADMIN_API_SECRET']
)

# Permission-aware operations
async def admin_tasks():
    # Get permission scope
    my_permissions = await admin_sdk.get_permissions()
    print(f"Admin permissions: {my_permissions}")
    
    # List accessible clients
    clients = await admin_sdk.clients.list()
    
    for client in clients:
        try:
            # Try to update client
            await admin_sdk.clients.update(
                client.id,
                {'status': 'verified'}
            )
        except PermissionDeniedError as e:
            print(f"Cannot update {client.id}: {e}")

# Delegated authentication
async def impersonate_client(client_id: str):
    # If admin has impersonation permission
    if admin_sdk.can('clients.impersonate'):
        client_token = await admin_sdk.auth.impersonate(client_id)
        
        # Create client SDK with delegated auth
        client_sdk = CodexMetatronClientSDK(token=client_token)
        
        # Perform actions as client
        client_data = await client_sdk.app.get_data()
        
        # Revert to admin context
        await admin_sdk.auth.stop_impersonation()
```

## CLIENT SDK Usage

### TypeScript/JavaScript

```typescript
import { CodexMetatronClientSDK } from '@codex-metatron/client-sdk';

// Initialize client SDK
const clientSdk = new CodexMetatronClientSDK({
  appId: process.env.CLIENT_APP_ID,
  appSecret: process.env.CLIENT_APP_SECRET,
  tenantId: process.env.TENANT_ID
});

// Manage own application data
async function manageAppData() {
  // Get application data
  const appData = await clientSdk.app.getData();
  
  // Update application settings
  await clientSdk.app.updateSettings({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC'
  });
  
  // Upload data
  const result = await clientSdk.data.upload({
    type: 'user_data',
    format: 'json',
    data: { users: [...] }
  });
  
  // Query own data
  const queryResult = await clientSdk.data.query({
    collection: 'users',
    filter: { status: 'active' },
    sort: { createdAt: -1 },
    limit: 100
  });
}

// Analytics for own application
async function getAnalytics() {
  // Get usage statistics
  const usage = await clientSdk.analytics.getUsage({
    metric: 'api_calls',
    period: 'monthly',
    months: 6
  });
  
  // Generate report
  const report = await clientSdk.analytics.generateReport({
    type: 'usage_summary',
    format: 'pdf',
    period: 'last_month'
  });
  
  // Real-time metrics
  const realtime = clientSdk.analytics.realtime();
  realtime.on('metric', (metric) => {
    console.log(`${metric.name}: ${metric.value}`);
  });
}

// Webhook management
async function setupWebhooks() {
  // Register webhook
  const webhook = await clientSdk.webhooks.create({
    url: 'https://myapp.com/webhooks',
    events: ['data.created', 'data.updated', 'settings.changed'],
    secret: generateWebhookSecret()
  });
  
  // List webhooks
  const webhooks = await clientSdk.webhooks.list();
  
  // Test webhook
  await clientSdk.webhooks.test(webhook.id);
}

// Embedded widgets
function embedDashboard() {
  // Initialize embedded dashboard
  clientSdk.widgets.dashboard.init({
    containerId: 'dashboard-container',
    modules: ['analytics', 'data-management', 'settings'],
    theme: 'light',
    height: '600px'
  });
  
  // Handle widget events
  clientSdk.widgets.dashboard.on('ready', () => {
    console.log('Dashboard loaded');
  });
  
  clientSdk.widgets.dashboard.on('error', (error) => {
    console.error('Dashboard error:', error);
  });
}
```

### Python

```python
from codex_metatron_client import ClientSDK
import pandas as pd

# Initialize client SDK
client = ClientSDK(
    app_id=os.environ['CLIENT_APP_ID'],
    app_secret=os.environ['CLIENT_APP_SECRET'],
    tenant_id=os.environ['TENANT_ID']
)

# Data operations
async def data_operations():
    # Bulk upload
    df = pd.read_csv('users.csv')
    result = await client.data.bulk_upload(
        data=df,
        collection='users',
        mode='upsert'
    )
    
    # Advanced queries
    active_users = await client.data.aggregate([
        {'$match': {'status': 'active'}},
        {'$group': {
            '_id': '$region',
            'count': {'$sum': 1}
        }}
    ])
    
    # Data export
    export_job = await client.data.export({
        'collection': 'transactions',
        'format': 'parquet',
        'filters': {'year': 2024}
    })
    
    # Wait for export
    await export_job.wait()
    download_url = export_job.result_url

# Event streaming
async def stream_events():
    async with client.events.stream() as stream:
        async for event in stream:
            if event.type == 'data.anomaly':
                await handle_anomaly(event)

# AI/ML integration (if available)
async def ml_operations():
    # Train model on own data
    model = await client.ml.train_model({
        'type': 'classification',
        'dataset': 'user_behavior',
        'target': 'churn',
        'features': ['usage_hours', 'feature_adoption', 'support_tickets']
    })
    
    # Make predictions
    predictions = await client.ml.predict(
        model_id=model.id,
        data=new_user_data
    )
```

## Error Handling

### Comprehensive Error Handling

```typescript
import { 
  CodexMetatronError,
  AuthenticationError,
  PermissionError,
  RateLimitError,
  ValidationError,
  NetworkError
} from '@codex-metatron/sdk';

async function robustApiCall() {
  try {
    const result = await sdk.someOperation();
    return result;
    
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Handle authentication failure
      console.error('Authentication failed:', error.message);
      // Refresh token or re-authenticate
      
    } else if (error instanceof PermissionError) {
      // Handle permission denied
      console.error('Permission denied:', error.required);
      // Show appropriate UI or request permission
      
    } else if (error instanceof RateLimitError) {
      // Handle rate limiting
      console.error('Rate limited:', error.retryAfter);
      // Implement backoff strategy
      await sleep(error.retryAfter * 1000);
      return robustApiCall(); // Retry
      
    } else if (error instanceof ValidationError) {
      // Handle validation errors
      console.error('Validation failed:', error.errors);
      // Fix input data
      
    } else if (error instanceof NetworkError) {
      // Handle network issues
      console.error('Network error:', error.message);
      // Retry with exponential backoff
      
    } else {
      // Unknown error
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
```

## Best Practices

### 1. Authentication Management

```typescript
// Token refresh strategy
class TokenManager {
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: number;
  
  async getAccessToken(): Promise<string> {
    if (Date.now() >= this.expiresAt - 60000) { // Refresh 1 minute before expiry
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }
  
  private async refreshAccessToken(): Promise<void> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    
    const data = await response.json();
    this.accessToken = data.accessToken;
    this.expiresAt = Date.now() + (data.expiresIn * 1000);
  }
}
```

### 2. Retry Logic

```typescript
// Exponential backoff retry
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error) || i === maxRetries - 1) {
        throw error;
      }
      
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await sleep(delay);
    }
  }
  
  throw lastError;
}
```

### 3. Webhook Security

```typescript
// Webhook signature verification
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 4. Resource Cleanup

```typescript
// Proper resource cleanup
class SDKManager {
  private sdk: CodexMetatronSDK;
  private cleanupTasks: (() => Promise<void>)[] = [];
  
  async initialize(): Promise<void> {
    this.sdk = new CodexMetatronSDK(config);
    
    // Register cleanup tasks
    this.cleanupTasks.push(async () => {
      await this.sdk.disconnect();
    });
    
    // Handle process termination
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }
  
  async cleanup(): Promise<void> {
    for (const task of this.cleanupTasks) {
      await task();
    }
  }
}
```

## SDK Configuration Options

### Advanced Configuration

```typescript
const sdk = new CodexMetatronSDK({
  // Authentication
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  
  // Environment
  environment: 'production',
  apiUrl: 'https://custom.api.url', // Optional custom URL
  
  // Performance
  options: {
    timeout: 30000,              // Request timeout in ms
    keepAlive: true,             // HTTP keep-alive
    maxSockets: 50,              // Max concurrent connections
    retryAttempts: 3,            // Retry failed requests
    retryDelay: 1000,            // Initial retry delay
    retryBackoffMultiplier: 2,   // Exponential backoff multiplier
  },
  
  // Caching
  cache: {
    enabled: true,
    ttl: 300,                    // Cache TTL in seconds
    maxSize: 100,                // Max cache entries
    storage: 'memory'            // 'memory' | 'redis'
  },
  
  // Logging
  logging: {
    level: 'info',               // 'debug' | 'info' | 'warn' | 'error'
    format: 'json',              // 'json' | 'pretty'
    output: 'stdout'             // 'stdout' | 'file' | 'syslog'
  },
  
  // Monitoring
  monitoring: {
    enabled: true,
    metricsEndpoint: '/metrics',
    tracingEnabled: true,
    tracingSampleRate: 0.1
  }
});
```