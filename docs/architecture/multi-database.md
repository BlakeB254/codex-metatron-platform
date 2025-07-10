# 🏗️ Codex Metatron Platform - Multi-Database Architecture

**Design Date**: July 10, 2025  
**Version**: 1.0  
**Architect**: Claude Code Assistant

## 🎯 **Architecture Overview**

### **Master Database Strategy**
The Codex Metatron Platform uses a **federated database architecture** where:

1. **CDX-DB (Master)**: Central aggregation database for superadmin access
2. **Service Databases**: Independent databases for each microservice
3. **Data Synchronization**: Real-time replication from service DBs to CDX-DB
4. **Multi-tenant Isolation**: Each tenant can have dedicated database instances

```
┌─────────────────────────────────────────────────────────────┐
│                    CDX-DB (Master Database)                 │
│  📊 Aggregated view of ALL data across ALL services        │
│  🔒 Superadmin access to complete platform state           │
│  📈 Analytics, reporting, cross-service relationships      │
└─────────────────────────────────────────────────────────────┘
                                    ▲
                    ┌───────────────┼───────────────┐
                    │               │               │
           ┌────────▼────────┐ ┌───▼────┐ ┌───────▼────────┐
           │  AUTH-DB        │ │ CRM-DB │ │   CMS-DB       │
           │  🔐 Users       │ │ 👥 CRM │ │   📝 Content   │
           │  🎫 Sessions    │ │ 📞 Leads│ │   🖼️ Media     │
           │  🔑 Tokens      │ │ 💼 Deals│ │   📄 Pages     │
           └─────────────────┘ └────────┘ └────────────────┘
                    │               │               │
           ┌────────▼────────┐ ┌───▼────┐ ┌───────▼────────┐
           │ BILLING-DB      │ │NOTIFY-DB│ │ ANALYTICS-DB   │
           │ 💳 Invoices     │ │ 📧 Emails│ │ 📊 Events      │
           │ 💰 Payments     │ │ 🔔 Push │ │ 📈 Metrics     │
           │ 📋 Subscriptions│ │ 📱 SMS  │ │ 🎯 Insights    │
           └─────────────────┘ └────────┘ └────────────────┘
```

## 🗄️ **Database Specifications**

### **1. CDX-DB (Master Database) - CURRENT NEON DB**
**Purpose**: Central aggregation and superadmin control  
**Access**: Superadmin only  
**Location**: `postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb`

#### **Tables** (Current + Enhanced):
```sql
-- CORE PLATFORM MANAGEMENT
clients                 -- Business customers
tenants                 -- Applications/environments  
admins                  -- Platform users
services               -- Microservice registry
system_config          -- Platform configuration

-- AGGREGATED DATA VIEWS
auth_events            -- Aggregated authentication data
crm_summary           -- Aggregated CRM data
cms_content_index     -- Aggregated content metadata
billing_overview      -- Aggregated billing data
analytics_summary     -- Aggregated analytics data
notifications_global  -- Cross-service notifications

-- AUDIT & COMPLIANCE
audit_log             -- Platform-wide audit trail
security_events       -- Security incidents
compliance_reports    -- Regulatory compliance data
data_lineage          -- Data source tracking
```

### **2. AUTH-DB (Authentication Service)**
**Purpose**: User authentication, sessions, permissions  
**Access**: Auth service + CDX-DB sync  
**Scaling**: Multi-master for global auth

#### **Schema**:
```sql
-- USER MANAGEMENT
users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SESSION MANAGEMENT  
sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AUTHENTICATION EVENTS
auth_events (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'failed_login', 'password_reset'
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PERMISSIONS & ROLES
roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL,
    tenant_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

user_roles (
    user_id UUID REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);
```

### **3. CRM-DB (Customer Relationship Management)**
**Purpose**: Customer data, leads, deals, interactions  
**Access**: CRM service + CDX-DB sync  
**Scaling**: Tenant-based sharding

#### **Schema**:
```sql
-- CUSTOMER MANAGEMENT
customers (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    status VARCHAR(50) DEFAULT 'active',
    source VARCHAR(100), -- 'website', 'referral', 'campaign'
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LEAD MANAGEMENT
leads (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    stage VARCHAR(50) NOT NULL, -- 'prospect', 'qualified', 'proposal', 'negotiation', 'closed'
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    assigned_to UUID, -- Reference to auth-db users
    source VARCHAR(100),
    lost_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INTERACTION TRACKING
interactions (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    lead_id UUID REFERENCES leads(id),
    type VARCHAR(50) NOT NULL, -- 'email', 'call', 'meeting', 'note'
    subject VARCHAR(255),
    content TEXT,
    user_id UUID, -- Reference to auth-db users
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PIPELINE MANAGEMENT
pipelines (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    stages JSONB NOT NULL, -- [{"name": "Prospect", "order": 1}, ...]
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **4. CMS-DB (Content Management System)**
**Purpose**: Content, media, pages, templates  
**Access**: CMS service + CDX-DB sync  
**Scaling**: Content-based partitioning

#### **Schema**:
```sql
-- CONTENT MANAGEMENT
content_types (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    schema JSONB NOT NULL, -- Field definitions
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

content_items (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    content_type_id UUID REFERENCES content_types(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    data JSONB NOT NULL, -- Actual content data
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
    published_at TIMESTAMP,
    author_id UUID, -- Reference to auth-db users
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES content_items(id), -- For revisions
    seo_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, content_type_id, slug)
);

-- MEDIA MANAGEMENT
media_files (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    metadata JSONB DEFAULT '{}', -- EXIF, dimensions, etc.
    uploaded_by UUID, -- Reference to auth-db users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PAGE MANAGEMENT
pages (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    template VARCHAR(100),
    content JSONB NOT NULL, -- Page builder data
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP,
    author_id UUID,
    parent_id UUID REFERENCES pages(id), -- For page hierarchy
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);
```

### **5. BILLING-DB (Billing & Subscriptions)**
**Purpose**: Invoices, payments, subscriptions, usage  
**Access**: Billing service + CDX-DB sync  
**Scaling**: Customer-based sharding

#### **Schema**:
```sql
-- SUBSCRIPTION MANAGEMENT
subscriptions (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    customer_id UUID, -- Reference to CRM customer
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'past_due', 'trialing'
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

-- BILLING PLANS
plans (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    interval VARCHAR(20) NOT NULL, -- 'month', 'year'
    interval_count INTEGER DEFAULT 1,
    trial_period_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVOICE MANAGEMENT
invoices (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id),
    customer_id UUID,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'open', 'paid', 'void', 'uncollectible'
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

-- USAGE TRACKING
usage_records (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id),
    metric VARCHAR(100) NOT NULL, -- 'api_calls', 'storage_gb', 'users'
    quantity DECIMAL(12,4) NOT NULL,
    unit_price DECIMAL(12,4),
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **6. ANALYTICS-DB (Analytics & Reporting)**
**Purpose**: Events, metrics, insights, reporting  
**Access**: Analytics service + CDX-DB sync  
**Scaling**: Time-series partitioning

#### **Schema**:
```sql
-- EVENT TRACKING
events (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    user_id UUID, -- Reference to auth-db users
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
) PARTITION BY RANGE (created_at);

-- METRICS AGGREGATION
metrics (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,4) NOT NULL,
    dimensions JSONB DEFAULT '{}', -- Additional grouping fields
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    granularity VARCHAR(20) NOT NULL, -- 'hour', 'day', 'week', 'month'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, metric_name, period_start, granularity)
);

-- DASHBOARD CONFIGURATIONS
dashboards (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL, -- Widget configurations
    is_public BOOLEAN DEFAULT false,
    created_by UUID, -- Reference to auth-db users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 **Data Synchronization Strategy**

### **Real-time Sync Architecture**
```sql
-- CDX-DB Aggregation Tables (READ-ONLY from services)
CREATE TABLE cdx_auth_summary AS 
SELECT 
    tenant_id,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active THEN 1 END) as active_users,
    MAX(last_login) as last_activity
FROM auth_db.users 
GROUP BY tenant_id;

CREATE TABLE cdx_crm_summary AS
SELECT 
    tenant_id,
    COUNT(DISTINCT customer_id) as total_customers,
    COUNT(*) as total_leads,
    SUM(value) as total_pipeline_value,
    AVG(probability) as avg_probability
FROM crm_db.leads 
GROUP BY tenant_id;

-- Similar for all other services...
```

### **Sync Mechanisms**

1. **Change Data Capture (CDC)**:
   ```sql
   -- Trigger-based sync for critical data
   CREATE TRIGGER sync_to_cdx_after_insert
   AFTER INSERT ON auth_db.users
   FOR EACH ROW
   EXECUTE FUNCTION sync_user_to_cdx();
   ```

2. **Scheduled Aggregation**:
   ```bash
   # Cron job for analytics data
   0 */6 * * * /scripts/sync-analytics-to-cdx.sh
   ```

3. **Event-driven Sync**:
   ```javascript
   // Message queue based sync
   eventBus.on('user.created', async (userData) => {
     await cdxDB.updateUserSummary(userData.tenant_id);
   });
   ```

## 🔐 **Security & Access Control**

### **Database Access Matrix**

| Service | CDX-DB | AUTH-DB | CRM-DB | CMS-DB | BILLING-DB | ANALYTICS-DB |
|---------|--------|---------|--------|--------|------------|--------------|
| **Superadmin** | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W |
| **Admin** | ❌ | ✅ R | ✅ R/W | ✅ R/W | ✅ R | ✅ R |
| **Client** | ❌ | ✅ R (own) | ✅ R/W (own) | ✅ R/W (own) | ✅ R (own) | ✅ R (own) |
| **Auth Service** | ✅ R/W (sync) | ✅ R/W | ❌ | ❌ | ❌ | ❌ |
| **CRM Service** | ✅ R/W (sync) | ✅ R (users) | ✅ R/W | ❌ | ❌ | ✅ W (events) |
| **CMS Service** | ✅ R/W (sync) | ✅ R (users) | ❌ | ✅ R/W | ❌ | ✅ W (events) |
| **Billing Service** | ✅ R/W (sync) | ✅ R (users) | ✅ R (customers) | ❌ | ✅ R/W | ✅ W (events) |
| **Analytics Service** | ✅ R/W (sync) | ✅ R (users) | ✅ R (summary) | ✅ R (summary) | ✅ R (summary) | ✅ R/W |

### **Connection Security**
```javascript
// Service-specific database connections with encryption
const serviceDbConfig = {
  host: process.env.SERVICE_DB_HOST,
  port: process.env.SERVICE_DB_PORT,
  database: process.env.SERVICE_DB_NAME,
  username: process.env.SERVICE_DB_USER,
  password: process.env.SERVICE_DB_PASSWORD,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  pool: {
    min: 5,
    max: 20,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
  }
};
```

## 📈 **Scaling Strategy**

### **Horizontal Scaling**
1. **Read Replicas**: Each service DB has read replicas for analytics
2. **Sharding**: Tenant-based sharding for large datasets
3. **Caching**: Redis cache layer for frequently accessed data
4. **CDN**: Static content delivery via CDN

### **Performance Optimization**
1. **Indexing Strategy**: Optimized indexes for each service
2. **Query Optimization**: Service-specific query patterns
3. **Connection Pooling**: Efficient connection management
4. **Background Jobs**: Async processing for heavy operations

## 🔧 **Implementation Roadmap**

### **Phase 1: Service Database Setup**
- [ ] Create individual service databases
- [ ] Migrate existing data to appropriate services
- [ ] Set up basic sync mechanisms

### **Phase 2: Data Synchronization**
- [ ] Implement CDC triggers
- [ ] Set up message queue for events
- [ ] Create aggregation jobs

### **Phase 3: Access Control**
- [ ] Implement role-based database access
- [ ] Set up service authentication
- [ ] Add audit logging

### **Phase 4: Optimization**
- [ ] Add read replicas
- [ ] Implement caching layer
- [ ] Performance tuning

This architecture provides complete separation of concerns while maintaining the ability for superadmin access to all data through the central CDX-DB aggregation layer.