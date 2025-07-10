/**
 * Database Connection Configuration for Codex Metatron Platform
 * Multi-Database Architecture Implementation
 */

const BASE_CONNECTION_URL = 'postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const connectionConfig = {
  ssl: { rejectUnauthorized: false },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
  }
};

/**
 * CDX-DB (Master Database)
 * Central aggregation database for superadmin access
 * Contains: Clients, Tenants, Admins, System Config, Aggregated Views
 */
const CDX_DB_CONFIG = {
  connectionString: BASE_CONNECTION_URL,
  schema: 'public',
  description: 'Master database for platform management and data aggregation',
  access: 'superadmin-only',
  ...connectionConfig
};

/**
 * AUTH-DB (Authentication Service)
 * User authentication, sessions, permissions
 * Schema: auth_db
 */
const AUTH_DB_CONFIG = {
  connectionString: BASE_CONNECTION_URL,
  schema: 'auth_db',
  description: 'Authentication and user management database',
  access: 'auth-service + cdx-sync',
  tables: ['users', 'sessions', 'auth_events', 'roles', 'user_roles'],
  ...connectionConfig
};

/**
 * CRM-DB (Customer Relationship Management)
 * Customer data, leads, deals, interactions
 * Schema: crm_db
 */
const CRM_DB_CONFIG = {
  connectionString: BASE_CONNECTION_URL,
  schema: 'crm_db',
  description: 'Customer relationship management database',
  access: 'crm-service + cdx-sync',
  tables: ['customers', 'leads', 'interactions', 'pipelines'],
  ...connectionConfig
};

/**
 * CMS-DB (Content Management System)
 * Content, media, pages, templates
 * Schema: cms_db
 */
const CMS_DB_CONFIG = {
  connectionString: BASE_CONNECTION_URL,
  schema: 'cms_db',
  description: 'Content management system database',
  access: 'cms-service + cdx-sync',
  tables: ['content_types', 'content_items', 'media_files', 'pages'],
  ...connectionConfig
};

/**
 * BILLING-DB (Billing & Subscriptions)
 * Invoices, payments, subscriptions, usage
 * Schema: billing_db
 */
const BILLING_DB_CONFIG = {
  connectionString: BASE_CONNECTION_URL,
  schema: 'billing_db',
  description: 'Billing and subscription management database',
  access: 'billing-service + cdx-sync',
  tables: ['plans', 'subscriptions', 'invoices', 'usage_records'],
  ...connectionConfig
};

/**
 * ANALYTICS-DB (Analytics & Reporting)
 * Events, metrics, insights, reporting
 * Schema: analytics_db
 */
const ANALYTICS_DB_CONFIG = {
  connectionString: BASE_CONNECTION_URL,
  schema: 'analytics_db',
  description: 'Analytics and reporting database',
  access: 'analytics-service + cdx-sync',
  tables: ['events', 'metrics', 'dashboards'],
  ...connectionConfig
};

/**
 * Database Connection Factory
 * Creates database connections with proper schema isolation
 */
class DatabaseConnectionFactory {
  static async createConnection(serviceType, options = {}) {
    const { Pool } = require('pg');
    
    let config;
    switch (serviceType) {
      case 'cdx':
        config = CDX_DB_CONFIG;
        break;
      case 'auth':
        config = AUTH_DB_CONFIG;
        break;
      case 'crm':
        config = CRM_DB_CONFIG;
        break;
      case 'cms':
        config = CMS_DB_CONFIG;
        break;
      case 'billing':
        config = BILLING_DB_CONFIG;
        break;
      case 'analytics':
        config = ANALYTICS_DB_CONFIG;
        break;
      default:
        throw new Error(`Unknown service type: ${serviceType}`);
    }
    
    const pool = new Pool({
      ...config,
      ...options
    });
    
    // Set schema for service-specific connections
    if (config.schema !== 'public') {
      pool.on('connect', async (client) => {
        await client.query(`SET search_path TO ${config.schema}, public`);
      });
    }
    
    return pool;
  }
  
  /**
   * Create a cross-service connection for data synchronization
   * Only available for CDX-DB aggregation purposes
   */
  static async createCrossServiceConnection(sourceService, targetService = 'cdx') {
    if (targetService !== 'cdx') {
      throw new Error('Cross-service connections only allowed to CDX-DB');
    }
    
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: BASE_CONNECTION_URL,
      ...connectionConfig
    });
    
    // Allow access to multiple schemas for sync operations
    pool.on('connect', async (client) => {
      const sourceSchema = this.getSchemaName(sourceService);
      await client.query(`SET search_path TO ${sourceSchema}, public`);
    });
    
    return pool;
  }
  
  static getSchemaName(serviceType) {
    const schemaMap = {
      'cdx': 'public',
      'auth': 'auth_db',
      'crm': 'crm_db',
      'cms': 'cms_db',
      'billing': 'billing_db',
      'analytics': 'analytics_db'
    };
    
    return schemaMap[serviceType] || 'public';
  }
  
  static getAllConfigs() {
    return {
      CDX_DB_CONFIG,
      AUTH_DB_CONFIG,
      CRM_DB_CONFIG,
      CMS_DB_CONFIG,
      BILLING_DB_CONFIG,
      ANALYTICS_DB_CONFIG
    };
  }
}

module.exports = {
  CDX_DB_CONFIG,
  AUTH_DB_CONFIG,
  CRM_DB_CONFIG,
  CMS_DB_CONFIG,
  BILLING_DB_CONFIG,
  ANALYTICS_DB_CONFIG,
  DatabaseConnectionFactory
};