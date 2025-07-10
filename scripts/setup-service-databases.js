const { Pool } = require('pg');

const CDX_DB_URL = 'postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

// For demo purposes, we'll create service schemas in the same database
// In production, these would be separate database instances
const cdxDb = new Pool({
  connectionString: CDX_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupServiceDatabases() {
  try {
    console.log('🏗️ SETTING UP SERVICE DATABASES');
    console.log('='.repeat(60));
    
    // Create schemas for each service (simulating separate databases)
    const services = ['auth_db', 'crm_db', 'cms_db', 'billing_db', 'analytics_db'];
    
    for (const service of services) {
      console.log(`📊 Creating schema: ${service}`);
      await cdxDb.query(`CREATE SCHEMA IF NOT EXISTS ${service}`);
    }
    
    console.log('\n🔐 SETTING UP AUTH-DB SCHEMA');
    console.log('-'.repeat(40));
    
    // AUTH-DB Schema
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS auth_db.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        tenant_id VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS auth_db.sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth_db.users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS auth_db.auth_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth_db.users(id) ON DELETE SET NULL,
        tenant_id VARCHAR(50) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        failure_reason TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Auth-DB schema created');
    
    console.log('\n👥 SETTING UP CRM-DB SCHEMA');
    console.log('-'.repeat(40));
    
    // CRM-DB Schema
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS crm_db.customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        company VARCHAR(255),
        phone VARCHAR(50),
        address JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active',
        source VARCHAR(100),
        tags JSONB DEFAULT '[]',
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, email)
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS crm_db.leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        customer_id UUID REFERENCES crm_db.customers(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        value DECIMAL(12,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'USD',
        stage VARCHAR(50) NOT NULL DEFAULT 'prospect',
        probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
        expected_close_date DATE,
        assigned_to UUID, -- Reference to auth_db.users
        source VARCHAR(100),
        lost_reason TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS crm_db.interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        customer_id UUID REFERENCES crm_db.customers(id) ON DELETE CASCADE,
        lead_id UUID REFERENCES crm_db.leads(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        subject VARCHAR(255),
        content TEXT,
        user_id UUID, -- Reference to auth_db.users
        scheduled_at TIMESTAMP,
        completed_at TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ CRM-DB schema created');
    
    console.log('\n📝 SETTING UP CMS-DB SCHEMA');
    console.log('-'.repeat(40));
    
    // CMS-DB Schema
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS cms_db.content_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        schema JSONB NOT NULL,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, slug)
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS cms_db.content_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        content_type_id UUID REFERENCES cms_db.content_types(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        published_at TIMESTAMP,
        author_id UUID, -- Reference to auth_db.users
        version INTEGER DEFAULT 1,
        parent_id UUID REFERENCES cms_db.content_items(id) ON DELETE SET NULL,
        seo_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, content_type_id, slug)
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS cms_db.media_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        file_path TEXT NOT NULL,
        url TEXT NOT NULL,
        alt_text TEXT,
        caption TEXT,
        metadata JSONB DEFAULT '{}',
        uploaded_by UUID, -- Reference to auth_db.users
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ CMS-DB schema created');
    
    console.log('\n💰 SETTING UP BILLING-DB SCHEMA');
    console.log('-'.repeat(40));
    
    // BILLING-DB Schema
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS billing_db.plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        interval VARCHAR(20) NOT NULL,
        interval_count INTEGER DEFAULT 1,
        trial_period_days INTEGER DEFAULT 0,
        features JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS billing_db.subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        customer_id UUID, -- Reference to crm_db.customers
        plan_id UUID REFERENCES billing_db.plans(id),
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        trial_start DATE,
        trial_end DATE,
        current_period_start DATE NOT NULL,
        current_period_end DATE NOT NULL,
        cancel_at_period_end BOOLEAN DEFAULT false,
        cancelled_at TIMESTAMP,
        cancel_reason TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS billing_db.invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        subscription_id UUID REFERENCES billing_db.subscriptions(id),
        customer_id UUID,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        subtotal DECIMAL(12,2) NOT NULL,
        tax_amount DECIMAL(12,2) DEFAULT 0,
        discount_amount DECIMAL(12,2) DEFAULT 0,
        total DECIMAL(12,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        due_date DATE,
        paid_at TIMESTAMP,
        payment_method VARCHAR(50),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Billing-DB schema created');
    
    console.log('\n📊 SETTING UP ANALYTICS-DB SCHEMA');
    console.log('-'.repeat(40));
    
    // ANALYTICS-DB Schema
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS analytics_db.events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        user_id UUID, -- Reference to auth_db.users
        session_id UUID,
        event_name VARCHAR(100) NOT NULL,
        event_data JSONB DEFAULT '{}',
        page_url TEXT,
        page_title VARCHAR(255),
        referrer TEXT,
        ip_address INET,
        user_agent TEXT,
        country VARCHAR(2),
        city VARCHAR(100),
        device_type VARCHAR(50),
        browser VARCHAR(50),
        os VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await cdxDb.query(`
      CREATE TABLE IF NOT EXISTS analytics_db.metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(50) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(12,4) NOT NULL,
        dimensions JSONB DEFAULT '{}',
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        granularity VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, metric_name, period_start, granularity)
      );
    `);
    
    console.log('✅ Analytics-DB schema created');
    
    console.log('\n🔄 SETTING UP AGGREGATION VIEWS IN CDX-DB');
    console.log('-'.repeat(50));
    
    // Create aggregation views in CDX-DB
    await cdxDb.query(`
      CREATE OR REPLACE VIEW cdx_service_summary AS
      SELECT 
        'auth' as service_name,
        COUNT(*) as total_records,
        COUNT(DISTINCT tenant_id) as tenant_count
      FROM auth_db.users
      UNION ALL
      SELECT 
        'crm' as service_name,
        COUNT(*) as total_records,
        COUNT(DISTINCT tenant_id) as tenant_count
      FROM crm_db.customers
      UNION ALL
      SELECT 
        'cms' as service_name,
        COUNT(*) as total_records,
        COUNT(DISTINCT tenant_id) as tenant_count
      FROM cms_db.content_items
      UNION ALL
      SELECT 
        'billing' as service_name,
        COUNT(*) as total_records,
        COUNT(DISTINCT tenant_id) as tenant_count
      FROM billing_db.subscriptions
      UNION ALL
      SELECT 
        'analytics' as service_name,
        COUNT(*) as total_records,
        COUNT(DISTINCT tenant_id) as tenant_count
      FROM analytics_db.events;
    `);
    
    await cdxDb.query(`
      CREATE OR REPLACE VIEW cdx_tenant_summary AS
      SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        t.status,
        c.name as client_name,
        COALESCE(auth_stats.user_count, 0) as total_users,
        COALESCE(crm_stats.customer_count, 0) as total_customers,
        COALESCE(cms_stats.content_count, 0) as total_content,
        COALESCE(billing_stats.subscription_count, 0) as active_subscriptions
      FROM tenants t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) as user_count 
        FROM auth_db.users 
        GROUP BY tenant_id
      ) auth_stats ON t.id = auth_stats.tenant_id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) as customer_count 
        FROM crm_db.customers 
        GROUP BY tenant_id
      ) crm_stats ON t.id = crm_stats.tenant_id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) as content_count 
        FROM cms_db.content_items 
        GROUP BY tenant_id
      ) cms_stats ON t.id = cms_stats.tenant_id
      LEFT JOIN (
        SELECT tenant_id, COUNT(*) as subscription_count 
        FROM billing_db.subscriptions 
        WHERE status = 'active'
        GROUP BY tenant_id
      ) billing_stats ON t.id = billing_stats.tenant_id;
    `);
    
    console.log('✅ Aggregation views created');
    
    console.log('\n📥 INSERTING SAMPLE DATA');
    console.log('-'.repeat(30));
    
    // Insert sample data for the demo tenant
    const demoTenantId = 'demo001';
    
    // Sample auth data
    await cdxDb.query(`
      INSERT INTO auth_db.users (email, password_hash, tenant_id, role, first_name, last_name)
      VALUES 
        ('john.doe@demo.com', '$2b$12$samplehash', $1, 'admin', 'John', 'Doe'),
        ('jane.smith@demo.com', '$2b$12$samplehash', $1, 'user', 'Jane', 'Smith')
      ON CONFLICT (email) DO NOTHING;
    `, [demoTenantId]);
    
    // Sample CRM data
    await cdxDb.query(`
      INSERT INTO crm_db.customers (tenant_id, email, first_name, last_name, company, status)
      VALUES 
        ($1, 'customer1@example.com', 'Alice', 'Johnson', 'Tech Corp', 'active'),
        ($1, 'customer2@example.com', 'Bob', 'Wilson', 'Design Co', 'active')
      ON CONFLICT (tenant_id, email) DO NOTHING;
    `, [demoTenantId]);
    
    // Sample billing plans
    await cdxDb.query(`
      INSERT INTO billing_db.plans (name, description, amount, interval, features)
      VALUES 
        ('Starter', 'Basic plan for small teams', 29.99, 'month', '{"users": 5, "storage": "10GB"}'),
        ('Professional', 'Advanced plan for growing businesses', 99.99, 'month', '{"users": 25, "storage": "100GB"}'),
        ('Enterprise', 'Full-featured plan for large organizations', 299.99, 'month', '{"users": "unlimited", "storage": "1TB"}')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Sample data inserted');
    
    // Show summary
    console.log('\n📊 DATABASE SETUP SUMMARY');
    console.log('='.repeat(50));
    
    const serviceSummary = await cdxDb.query('SELECT * FROM cdx_service_summary ORDER BY service_name');
    console.log('Service Database Summary:');
    serviceSummary.rows.forEach(row => {
      console.log(`  📊 ${row.service_name.toUpperCase()}: ${row.total_records} records across ${row.tenant_count} tenants`);
    });
    
    const tenantSummary = await cdxDb.query('SELECT * FROM cdx_tenant_summary ORDER BY tenant_name');
    console.log('\nTenant Summary:');
    tenantSummary.rows.forEach(row => {
      console.log(`  🏢 ${row.tenant_name} (${row.tenant_id}):`);
      console.log(`     👥 Users: ${row.total_users} | 🤝 Customers: ${row.total_customers} | 📝 Content: ${row.total_content} | 💰 Subscriptions: ${row.active_subscriptions}`);
    });
    
    console.log('\n🎉 MULTI-DATABASE ARCHITECTURE SETUP COMPLETE!');
    console.log('📋 Each service now has its own database schema');
    console.log('🔄 CDX-DB aggregates data from all services for superadmin access');
    console.log('🔒 Proper isolation between services while maintaining centralized control');
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
  } finally {
    await cdxDb.end();
  }
}

setupServiceDatabases();