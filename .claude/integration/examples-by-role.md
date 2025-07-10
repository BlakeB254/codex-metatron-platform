# Integration Examples by Role

## Overview

This document provides complete, real-world examples of integrating with the Codex Metatron Platform for each user role. Each example includes setup, authentication, common operations, and error handling.

## SUPERADMIN Integration Examples

### Example 1: Platform Health Monitoring Dashboard

**Use Case**: Real-time monitoring dashboard for platform administrators

```typescript
// health-monitor.ts
import { CodexMetatronSDK } from '@codex-metatron/sdk';
import express from 'express';
import { Server } from 'socket.io';

class PlatformHealthMonitor {
  private sdk: CodexMetatronSDK;
  private io: Server;
  private alerts: Map<string, any> = new Map();

  constructor() {
    this.sdk = new CodexMetatronSDK({
      apiKey: process.env.SUPERADMIN_API_KEY,
      apiSecret: process.env.SUPERADMIN_API_SECRET,
      environment: 'production'
    });
  }

  async initialize(): Promise<void> {
    // Start monitoring system metrics
    this.monitorSystemHealth();
    
    // Monitor client activity
    this.monitorClientActivity();
    
    // Setup real-time alerts
    this.setupAlertSystem();
    
    console.log('Platform health monitoring initialized');
  }

  private async monitorSystemHealth(): Promise<void> {
    setInterval(async () => {
      try {
        const metrics = await this.sdk.system.getMetrics();
        
        // Check critical thresholds
        if (metrics.cpu.usage > 85) {
          this.triggerAlert('cpu_high', {
            value: metrics.cpu.usage,
            threshold: 85,
            severity: 'high'
          });
        }
        
        if (metrics.memory.usage > 90) {
          this.triggerAlert('memory_high', {
            value: metrics.memory.usage,
            threshold: 90,
            severity: 'critical'
          });
        }
        
        // Check database performance
        if (metrics.database.avgResponseTime > 1000) {
          this.triggerAlert('db_slow', {
            value: metrics.database.avgResponseTime,
            threshold: 1000,
            severity: 'medium'
          });
        }
        
        // Emit to dashboard
        this.io.emit('system_metrics', metrics);
        
      } catch (error) {
        console.error('Failed to get system metrics:', error);
        this.triggerAlert('monitoring_failure', { error: error.message });
      }
    }, 30000); // Every 30 seconds
  }

  private async monitorClientActivity(): Promise<void> {
    // Monitor for unusual client activity patterns
    setInterval(async () => {
      const clients = await this.sdk.clients.list({ 
        include: ['lastActivity', 'apiUsage', 'errorRate'] 
      });
      
      for (const client of clients) {
        // Check for clients with high error rates
        if (client.metrics.errorRate > 5) {
          this.triggerAlert('client_errors', {
            clientId: client.id,
            clientName: client.name,
            errorRate: client.metrics.errorRate,
            severity: 'medium'
          });
        }
        
        // Check for inactive clients
        const lastActivity = new Date(client.lastActivity);
        const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceActivity > 30) {
          this.triggerAlert('client_inactive', {
            clientId: client.id,
            clientName: client.name,
            daysSinceActivity: Math.round(daysSinceActivity),
            severity: 'low'
          });
        }
      }
    }, 300000); // Every 5 minutes
  }

  private setupAlertSystem(): Promise<void> {
    // Listen to system events
    const eventStream = this.sdk.system.streamEvents({
      events: ['error.critical', 'security.breach', 'capacity.warning']
    });
    
    eventStream.on('event', (event) => {
      this.triggerAlert(`system_${event.type}`, {
        event: event.data,
        timestamp: event.timestamp,
        severity: event.severity
      });
    });
    
    eventStream.on('error', (error) => {
      console.error('Event stream error:', error);
    });
  }

  private triggerAlert(type: string, data: any): void {
    const alertId = `${type}_${Date.now()}`;
    const alert = {
      id: alertId,
      type,
      data,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    
    this.alerts.set(alertId, alert);
    
    // Emit to dashboard
    this.io.emit('alert', alert);
    
    // Send to external alerting systems
    this.sendToSlack(alert);
    this.sendToPagerDuty(alert);
    
    console.log(`Alert triggered: ${type}`, data);
  }

  private async sendToSlack(alert: any): Promise<void> {
    // Slack webhook integration
    // Implementation depends on alert severity
  }

  private async sendToPagerDuty(alert: any): Promise<void> {
    // PagerDuty integration for critical alerts
    if (alert.data.severity === 'critical') {
      // Send to PagerDuty
    }
  }
}

// Start the monitor
const monitor = new PlatformHealthMonitor();
monitor.initialize();
```

### Example 2: Automated Client Onboarding System

```typescript
// client-onboarding.ts
class ClientOnboardingSystem {
  private sdk: CodexMetatronSDK;
  
  constructor() {
    this.sdk = new CodexMetatronSDK({
      apiKey: process.env.SUPERADMIN_API_KEY,
      apiSecret: process.env.SUPERADMIN_API_SECRET
    });
  }

  async onboardClient(onboardingData: ClientOnboardingData): Promise<OnboardingResult> {
    const transaction = await this.sdk.transactions.begin();
    
    try {
      // 1. Create client account
      const client = await this.sdk.clients.create({
        name: onboardingData.companyName,
        email: onboardingData.adminEmail,
        plan: onboardingData.selectedPlan,
        settings: {
          timezone: onboardingData.timezone,
          language: onboardingData.language,
          industry: onboardingData.industry
        }
      });
      
      // 2. Setup tenant database
      await this.sdk.tenants.provision({
        clientId: client.id,
        schema: 'default',
        resources: {
          storage: onboardingData.selectedPlan.storage,
          compute: onboardingData.selectedPlan.compute
        }
      });
      
      // 3. Create admin user
      const adminUser = await this.sdk.users.create({
        email: onboardingData.adminEmail,
        role: 'CLIENT',
        clientId: client.id,
        profile: {
          firstName: onboardingData.adminFirstName,
          lastName: onboardingData.adminLastName,
          phone: onboardingData.adminPhone
        }
      });
      
      // 4. Generate API credentials
      const apiCredentials = await this.sdk.apiKeys.generate({
        userId: adminUser.id,
        clientId: client.id,
        permissions: ['app:read', 'app:write', 'settings:read', 'settings:write']
      });
      
      // 5. Setup initial application
      const app = await this.sdk.applications.create({
        clientId: client.id,
        name: onboardingData.appName || 'Default Application',
        type: onboardingData.appType || 'web',
        settings: {
          domain: onboardingData.domain,
          subdomain: `${client.slug}.platform.com`
        }
      });
      
      // 6. Configure default settings
      await this.sdk.clients.updateSettings(client.id, {
        branding: {
          primaryColor: onboardingData.brandColor || '#007bff',
          logo: onboardingData.logoUrl
        },
        features: onboardingData.selectedPlan.features,
        limits: onboardingData.selectedPlan.limits
      });
      
      // 7. Send welcome email
      await this.sdk.notifications.send({
        to: onboardingData.adminEmail,
        template: 'welcome',
        data: {
          clientName: client.name,
          adminName: `${onboardingData.adminFirstName} ${onboardingData.adminLastName}`,
          apiKey: apiCredentials.apiKey,
          dashboardUrl: `https://${client.slug}.platform.com`,
          documentationUrl: 'https://docs.platform.com'
        }
      });
      
      // 8. Schedule follow-up tasks
      await this.sdk.tasks.schedule([
        {
          type: 'follow_up_call',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          data: { clientId: client.id, adminEmail: onboardingData.adminEmail }
        },
        {
          type: 'usage_check',
          scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          data: { clientId: client.id }
        }
      ]);
      
      await transaction.commit();
      
      return {
        success: true,
        client,
        adminUser,
        apiCredentials,
        app,
        dashboardUrl: `https://${client.slug}.platform.com`
      };
      
    } catch (error) {
      await transaction.rollback();
      throw new OnboardingError(`Onboarding failed: ${error.message}`, error);
    }
  }
}
```

## ADMIN Integration Examples

### Example 1: Customer Management Portal

**Use Case**: Admin portal for managing assigned clients

```typescript
// admin-portal.ts
import { CodexMetatronSDK } from '@codex-metatron/sdk';

class AdminPortal {
  private sdk: CodexMetatronSDK;
  private adminPermissions: AdminPermissions;

  constructor(adminCredentials: AdminCredentials) {
    this.sdk = new CodexMetatronSDK({
      apiKey: adminCredentials.apiKey,
      apiSecret: adminCredentials.apiSecret
    });
  }

  async initialize(): Promise<void> {
    // Load admin permissions
    this.adminPermissions = await this.sdk.auth.getMyPermissions();
    console.log('Admin permissions loaded:', this.adminPermissions);
  }

  async getMyClients(): Promise<Client[]> {
    try {
      // SDK automatically filters based on admin permissions
      const clients = await this.sdk.clients.list({
        include: ['metrics', 'lastActivity', 'billing'],
        sortBy: 'lastActivity',
        sortOrder: 'desc'
      });
      
      return clients;
    } catch (error) {
      if (error instanceof PermissionError) {
        console.error('Cannot access client list:', error.message);
        return [];
      }
      throw error;
    }
  }

  async getClientDetails(clientId: string): Promise<ClientDetails | null> {
    // Check if admin has access to this client
    if (!this.canAccessClient(clientId)) {
      throw new PermissionError('Access denied to client');
    }

    try {
      const [client, metrics, billing, users] = await Promise.all([
        this.sdk.clients.get(clientId),
        this.sdk.analytics.getClientMetrics(clientId, { period: 'last_30_days' }),
        this.canViewBilling(clientId) ? this.sdk.billing.getClientBilling(clientId) : null,
        this.canManageUsers(clientId) ? this.sdk.users.list({ clientId }) : null
      ]);

      return {
        client,
        metrics,
        billing,
        users: users || []
      };
    } catch (error) {
      console.error(`Failed to get client details for ${clientId}:`, error);
      return null;
    }
  }

  async updateClientSettings(clientId: string, settings: ClientSettings): Promise<void> {
    if (!this.canUpdateClient(clientId)) {
      throw new PermissionError('Cannot update client settings');
    }

    // Validate settings against admin permissions
    const validatedSettings = this.validateSettingsAgainstPermissions(settings);

    await this.sdk.clients.updateSettings(clientId, validatedSettings);
    
    // Log the change
    await this.sdk.audit.log({
      action: 'client.settings.updated',
      adminId: this.sdk.getCurrentUserId(),
      clientId,
      changes: validatedSettings
    });
  }

  async generateClientReport(clientId: string, reportType: string): Promise<ReportResult> {
    if (!this.canGenerateReports(clientId)) {
      throw new PermissionError('Cannot generate reports for this client');
    }

    const reportJob = await this.sdk.reports.generate({
      type: reportType,
      clientId,
      format: 'pdf',
      options: {
        period: 'last_quarter',
        includeCharts: true,
        includeRawData: this.adminPermissions.reports?.includeRawData || false
      }
    });

    // Wait for report generation
    await reportJob.wait();
    
    return {
      downloadUrl: reportJob.resultUrl,
      expiresAt: reportJob.expiresAt
    };
  }

  async manageClientUsers(clientId: string): Promise<UserManagementActions> {
    if (!this.canManageUsers(clientId)) {
      throw new PermissionError('Cannot manage users for this client');
    }

    return {
      listUsers: async () => {
        return this.sdk.users.list({ clientId });
      },
      
      createUser: async (userData: CreateUserData) => {
        // Ensure user is assigned to correct client
        userData.clientId = clientId;
        userData.role = 'CLIENT'; // Admins can only create CLIENT users
        
        return this.sdk.users.create(userData);
      },
      
      updateUser: async (userId: string, updates: UserUpdates) => {
        // Verify user belongs to this client
        const user = await this.sdk.users.get(userId);
        if (user.clientId !== clientId) {
          throw new PermissionError('Cannot update user from different client');
        }
        
        return this.sdk.users.update(userId, updates);
      },
      
      deactivateUser: async (userId: string) => {
        const user = await this.sdk.users.get(userId);
        if (user.clientId !== clientId) {
          throw new PermissionError('Cannot deactivate user from different client');
        }
        
        return this.sdk.users.update(userId, { status: 'inactive' });
      }
    };
  }

  // Permission checking helpers
  private canAccessClient(clientId: string): boolean {
    const clientPermissions = this.adminPermissions.clients;
    return clientPermissions.read === true || 
           (Array.isArray(clientPermissions.read) && clientPermissions.read.includes(clientId));
  }

  private canUpdateClient(clientId: string): boolean {
    const clientPermissions = this.adminPermissions.clients;
    return this.canAccessClient(clientId) && 
           (clientPermissions.update === true || 
            (Array.isArray(clientPermissions.update) && clientPermissions.update.includes(clientId)));
  }

  private canViewBilling(clientId: string): boolean {
    return this.adminPermissions.billing?.view === true ||
           (Array.isArray(this.adminPermissions.billing?.view) && 
            this.adminPermissions.billing.view.includes(clientId));
  }

  private canManageUsers(clientId: string): boolean {
    return this.adminPermissions.users?.manage === true ||
           (Array.isArray(this.adminPermissions.users?.manage) && 
            this.adminPermissions.users.manage.includes(clientId));
  }

  private canGenerateReports(clientId: string): boolean {
    return this.adminPermissions.reports?.generate === true ||
           (Array.isArray(this.adminPermissions.reports?.generate) && 
            this.adminPermissions.reports.generate.includes(clientId));
  }
}

// Usage example
async function createAdminPortal() {
  const portal = new AdminPortal({
    apiKey: process.env.ADMIN_API_KEY,
    apiSecret: process.env.ADMIN_API_SECRET
  });
  
  await portal.initialize();
  
  // Get admin's assigned clients
  const clients = await portal.getMyClients();
  console.log(`Admin has access to ${clients.length} clients`);
  
  // Work with first client
  if (clients.length > 0) {
    const clientDetails = await portal.getClientDetails(clients[0].id);
    console.log('Client details:', clientDetails);
    
    // Generate report if permitted
    try {
      const report = await portal.generateClientReport(clients[0].id, 'usage_summary');
      console.log('Report generated:', report.downloadUrl);
    } catch (error) {
      console.log('Cannot generate report:', error.message);
    }
  }
}
```

### Example 2: Automated Client Health Monitoring

```typescript
// admin-health-monitor.ts
class AdminHealthMonitor {
  private sdk: CodexMetatronSDK;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(adminCredentials: AdminCredentials) {
    this.sdk = new CodexMetatronSDK(adminCredentials);
  }

  async startMonitoring(): Promise<void> {
    const myClients = await this.sdk.clients.list();
    
    for (const client of myClients) {
      this.monitorClient(client.id);
    }
    
    console.log(`Started monitoring ${myClients.length} clients`);
  }

  private monitorClient(clientId: string): void {
    const interval = setInterval(async () => {
      try {
        await this.checkClientHealth(clientId);
      } catch (error) {
        console.error(`Health check failed for client ${clientId}:`, error);
      }
    }, 60000); // Every minute
    
    this.monitoringIntervals.set(clientId, interval);
  }

  private async checkClientHealth(clientId: string): Promise<void> {
    const metrics = await this.sdk.analytics.getClientMetrics(clientId, {
      metrics: ['api_calls', 'error_rate', 'response_time'],
      period: 'last_hour'
    });
    
    // Check for issues
    if (metrics.error_rate > 5) {
      await this.alertHighErrorRate(clientId, metrics.error_rate);
    }
    
    if (metrics.avg_response_time > 2000) {
      await this.alertSlowResponse(clientId, metrics.avg_response_time);
    }
    
    // Check for unusual activity patterns
    if (metrics.api_calls === 0) {
      await this.alertNoActivity(clientId);
    }
  }

  private async alertHighErrorRate(clientId: string, errorRate: number): Promise<void> {
    const client = await this.sdk.clients.get(clientId);
    
    // Create support ticket
    await this.sdk.support.createTicket({
      clientId,
      priority: 'high',
      subject: `High error rate detected: ${errorRate}%`,
      description: `Client ${client.name} is experiencing a ${errorRate}% error rate in the last hour.`,
      assignedTo: this.sdk.getCurrentUserId()
    });
    
    // Send notification
    await this.sdk.notifications.send({
      to: client.adminEmail,
      template: 'error_rate_alert',
      data: { clientName: client.name, errorRate }
    });
  }
}
```

## CLIENT Integration Examples

### Example 1: SaaS Application Integration

**Use Case**: SaaS application that needs to manage its own data and settings

```typescript
// saas-app-integration.ts
import { CodexMetatronClientSDK } from '@codex-metatron/client-sdk';

class SaaSAppIntegration {
  private sdk: CodexMetatronClientSDK;
  private webhookSecret: string;

  constructor() {
    this.sdk = new CodexMetatronClientSDK({
      appId: process.env.CLIENT_APP_ID,
      appSecret: process.env.CLIENT_APP_SECRET,
      tenantId: process.env.TENANT_ID
    });
    
    this.webhookSecret = process.env.WEBHOOK_SECRET;
  }

  async initialize(): Promise<void> {
    // Setup webhooks
    await this.setupWebhooks();
    
    // Initialize real-time features
    await this.initializeRealtime();
    
    console.log('SaaS app integration initialized');
  }

  // User data management
  async syncUserData(users: User[]): Promise<SyncResult> {
    try {
      // Batch upload user data
      const result = await this.sdk.data.bulkUpsert({
        collection: 'users',
        data: users.map(user => ({
          id: user.id,
          email: user.email,
          profile: user.profile,
          subscription: user.subscription,
          lastLogin: user.lastLogin,
          metadata: user.metadata
        }))
      });
      
      return {
        success: true,
        processed: result.processed,
        errors: result.errors
      };
    } catch (error) {
      console.error('User sync failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analytics integration
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    await this.sdk.analytics.track({
      event: event.name,
      userId: event.userId,
      properties: event.properties,
      timestamp: event.timestamp || new Date()
    });
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const analytics = await this.sdk.analytics.getUser(userId, {
      metrics: ['sessions', 'page_views', 'events', 'conversion_rate'],
      period: 'last_30_days'
    });
    
    return analytics;
  }

  // Settings management
  async updateAppSettings(settings: AppSettings): Promise<void> {
    await this.sdk.app.updateSettings({
      theme: settings.theme,
      language: settings.language,
      features: settings.enabledFeatures,
      notifications: settings.notificationPreferences,
      integrations: settings.integrationConfigs
    });
  }

  async getAppSettings(): Promise<AppSettings> {
    const settings = await this.sdk.app.getSettings();
    return settings;
  }

  // File management
  async uploadFile(file: FileUpload): Promise<FileResult> {
    const formData = new FormData();
    formData.append('file', file.buffer, file.filename);
    formData.append('metadata', JSON.stringify(file.metadata));
    
    const result = await this.sdk.files.upload(formData, {
      folder: file.folder || 'uploads',
      public: file.public || false,
      tags: file.tags || []
    });
    
    return {
      id: result.id,
      url: result.url,
      publicUrl: result.publicUrl,
      metadata: result.metadata
    };
  }

  // Webhook handling
  private async setupWebhooks(): Promise<void> {
    // Register webhook endpoints
    await this.sdk.webhooks.register({
      url: `${process.env.APP_URL}/webhooks/platform`,
      events: [
        'settings.updated',
        'user.created',
        'user.updated',
        'analytics.report.ready',
        'billing.invoice.created'
      ],
      secret: this.webhookSecret
    });
  }

  handleWebhook(body: string, signature: string): WebhookResult {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(body, signature)) {
      throw new Error('Invalid webhook signature');
    }
    
    const event = JSON.parse(body);
    
    switch (event.type) {
      case 'settings.updated':
        return this.handleSettingsUpdate(event.data);
      
      case 'user.created':
      case 'user.updated':
        return this.handleUserEvent(event.data);
      
      case 'analytics.report.ready':
        return this.handleReportReady(event.data);
      
      case 'billing.invoice.created':
        return this.handleBillingEvent(event.data);
      
      default:
        console.log('Unhandled webhook event:', event.type);
        return { success: true, message: 'Event ignored' };
    }
  }

  private verifyWebhookSignature(body: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');
    
    return signature === `sha256=${expectedSignature}`;
  }

  // Real-time features
  private async initializeRealtime(): Promise<void> {
    const realtime = this.sdk.realtime.connect();
    
    // Subscribe to user events
    realtime.subscribe('users', (event) => {
      console.log('User event:', event);
      this.handleRealtimeUserEvent(event);
    });
    
    // Subscribe to system notifications
    realtime.subscribe('notifications', (notification) => {
      console.log('System notification:', notification);
      this.handleSystemNotification(notification);
    });
  }

  // Export data for compliance
  async exportUserData(userId: string): Promise<ExportResult> {
    const exportJob = await this.sdk.compliance.exportUserData({
      userId,
      format: 'json',
      includeAnalytics: true,
      includeFiles: true
    });
    
    // Wait for export to complete
    await exportJob.wait();
    
    return {
      downloadUrl: exportJob.resultUrl,
      expiresAt: exportJob.expiresAt,
      format: 'json'
    };
  }

  // Delete user data for GDPR compliance
  async deleteUserData(userId: string): Promise<DeletionResult> {
    const deletionJob = await this.sdk.compliance.deleteUserData({
      userId,
      deleteFiles: true,
      deleteAnalytics: true,
      retentionPeriod: 0 // Immediate deletion
    });
    
    await deletionJob.wait();
    
    return {
      success: deletionJob.status === 'completed',
      deletedRecords: deletionJob.deletedRecords
    };
  }
}

// Usage in Express.js app
const app = express();
const saasIntegration = new SaaSAppIntegration();

// Initialize integration
saasIntegration.initialize();

// Webhook endpoint
app.post('/webhooks/platform', (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const result = saasIntegration.handleWebhook(req.body, signature);
    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// API endpoints
app.post('/api/users/sync', async (req, res) => {
  const result = await saasIntegration.syncUserData(req.body.users);
  res.json(result);
});

app.get('/api/users/:userId/analytics', async (req, res) => {
  const analytics = await saasIntegration.getUserAnalytics(req.params.userId);
  res.json(analytics);
});
```

### Example 2: E-commerce Platform Integration

```typescript
// ecommerce-integration.ts
class EcommerceIntegration {
  private sdk: CodexMetatronClientSDK;

  constructor() {
    this.sdk = new CodexMetatronClientSDK({
      appId: process.env.ECOMMERCE_APP_ID,
      appSecret: process.env.ECOMMERCE_APP_SECRET,
      tenantId: process.env.ECOMMERCE_TENANT_ID
    });
  }

  // Product catalog synchronization
  async syncProducts(products: Product[]): Promise<void> {
    const chunks = this.chunkArray(products, 100); // Process in batches
    
    for (const chunk of chunks) {
      await this.sdk.data.bulkUpsert({
        collection: 'products',
        data: chunk.map(product => ({
          id: product.sku,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          inventory: product.inventory,
          images: product.images,
          metadata: {
            weight: product.weight,
            dimensions: product.dimensions,
            tags: product.tags
          }
        }))
      });
    }
  }

  // Order tracking
  async trackOrder(order: Order): Promise<void> {
    // Store order data
    await this.sdk.data.create({
      collection: 'orders',
      data: {
        id: order.id,
        customerId: order.customerId,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod
      }
    });

    // Track analytics events
    await this.sdk.analytics.track({
      event: 'order_created',
      userId: order.customerId,
      properties: {
        orderId: order.id,
        total: order.total,
        itemCount: order.items.length,
        paymentMethod: order.paymentMethod.type
      }
    });

    // Track individual product purchases
    for (const item of order.items) {
      await this.sdk.analytics.track({
        event: 'product_purchased',
        userId: order.customerId,
        properties: {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          orderId: order.id
        }
      });
    }
  }

  // Customer behavior analytics
  async trackCustomerBehavior(event: CustomerEvent): Promise<void> {
    const eventMappings = {
      'page_view': this.trackPageView,
      'product_view': this.trackProductView,
      'add_to_cart': this.trackAddToCart,
      'remove_from_cart': this.trackRemoveFromCart,
      'checkout_start': this.trackCheckoutStart,
      'purchase': this.trackPurchase
    };

    const handler = eventMappings[event.type];
    if (handler) {
      await handler.call(this, event);
    }
  }

  private async trackProductView(event: CustomerEvent): Promise<void> {
    await this.sdk.analytics.track({
      event: 'product_viewed',
      userId: event.customerId,
      properties: {
        productId: event.data.productId,
        productName: event.data.productName,
        category: event.data.category,
        price: event.data.price,
        source: event.data.source // search, category, recommendation, etc.
      }
    });
  }

  // Inventory management
  async updateInventory(updates: InventoryUpdate[]): Promise<void> {
    for (const update of updates) {
      await this.sdk.data.update({
        collection: 'products',
        id: update.sku,
        data: {
          inventory: {
            quantity: update.quantity,
            reserved: update.reserved,
            available: update.quantity - update.reserved,
            lastUpdated: new Date()
          }
        }
      });

      // Track inventory event
      await this.sdk.analytics.track({
        event: 'inventory_updated',
        properties: {
          sku: update.sku,
          previousQuantity: update.previousQuantity,
          newQuantity: update.quantity,
          changeType: update.changeType // 'sale', 'restock', 'adjustment'
        }
      });
    }
  }

  // Recommendation engine data
  async getRecommendations(customerId: string, context: RecommendationContext): Promise<Product[]> {
    // Get customer behavior data
    const customerData = await this.sdk.analytics.getUser(customerId, {
      events: ['product_viewed', 'product_purchased', 'add_to_cart'],
      period: 'last_90_days'
    });

    // Use platform's ML capabilities
    const recommendations = await this.sdk.ml.predict({
      model: 'product_recommendations',
      input: {
        customerId,
        recentViews: customerData.recentProductViews,
        purchaseHistory: customerData.purchaseHistory,
        context: context
      }
    });

    // Return product details
    const productIds = recommendations.map(r => r.productId);
    const products = await this.sdk.data.query({
      collection: 'products',
      filter: { id: { $in: productIds } }
    });

    return products;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
```

## Error Handling Patterns

### Universal Error Handling

```typescript
// error-handler.ts
class UniversalErrorHandler {
  static async handleSDKError(error: any, context: string): Promise<void> {
    console.error(`Error in ${context}:`, error);

    switch (error.constructor.name) {
      case 'AuthenticationError':
        await this.handleAuthError(error, context);
        break;
      
      case 'PermissionError':
        await this.handlePermissionError(error, context);
        break;
      
      case 'RateLimitError':
        await this.handleRateLimitError(error, context);
        break;
      
      case 'ValidationError':
        await this.handleValidationError(error, context);
        break;
      
      case 'NetworkError':
        await this.handleNetworkError(error, context);
        break;
      
      default:
        await this.handleUnknownError(error, context);
    }
  }

  private static async handleAuthError(error: AuthenticationError, context: string): Promise<void> {
    // Log security event
    console.error('Authentication failed:', {
      context,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    // Refresh credentials if possible
    if (error.canRefresh) {
      try {
        await this.refreshCredentials();
      } catch (refreshError) {
        console.error('Credential refresh failed:', refreshError);
      }
    }
  }

  private static async handlePermissionError(error: PermissionError, context: string): Promise<void> {
    console.warn('Permission denied:', {
      context,
      required: error.required,
      current: error.current
    });

    // Request permission escalation if possible
    if (error.canEscalate) {
      await this.requestPermissionEscalation(error.required, context);
    }
  }

  private static async handleRateLimitError(error: RateLimitError, context: string): Promise<void> {
    console.warn('Rate limited:', {
      context,
      retryAfter: error.retryAfter,
      limit: error.limit
    });

    // Implement exponential backoff
    await this.sleep(error.retryAfter * 1000);
  }
}
```

This comprehensive documentation provides detailed examples for each user role, demonstrating how to integrate with the Codex Metatron Platform effectively while respecting the permission boundaries and following best practices for each integration level.