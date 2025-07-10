-- Codex Metatron Platform Database Schema
-- Complete multi-tenant architecture with client-tenant-application relationships

-- =====================================================================================
-- CLIENTS TABLE
-- =====================================================================================
-- Represents the actual business clients/customers using the platform
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    
    -- Client Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    company_name VARCHAR(255),
    
    -- Contact Information
    phone VARCHAR(50),
    address JSONB,
    
    -- Business Information
    industry VARCHAR(100),
    company_size VARCHAR(50), -- 'startup', 'small', 'medium', 'enterprise'
    
    -- Billing Information
    billing_email VARCHAR(255),
    billing_address JSONB,
    subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'professional', 'enterprise'
    
    -- Client Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    
    -- Tenant/Application References (array of tenant IDs this client owns)
    tenant_ids JSONB DEFAULT '[]',
    
    -- Metadata
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP
);

-- =====================================================================================
-- TENANTS TABLE (Applications)
-- =====================================================================================
-- Each tenant represents an individual application/environment
-- A client can have multiple tenants (apps), but each tenant belongs to one client
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY, -- Short, readable ID like 'app-abc123'
    
    -- Application Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    app_type VARCHAR(100), -- 'web-app', 'mobile-app', 'api-service', 'cms', etc.
    
    -- Client Relationship
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL, -- NULL for internal apps
    
    -- Technical Configuration
    api_key VARCHAR(255) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE, -- For app URLs like 'myapp.codexmetatron.com'
    custom_domain VARCHAR(255), -- Custom domain if configured
    
    -- Database Configuration
    db_connection_string TEXT, -- Dedicated database for this tenant
    
    -- Service Configuration
    tier VARCHAR(50) DEFAULT 'free', -- 'free', 'standard', 'premium', 'enterprise'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'cancelled', 'development'
    
    -- Feature Configuration
    settings JSONB DEFAULT '{
        "features": {
            "crm": true,
            "billing": true,
            "content": true,
            "analytics": true,
            "api_access": true
        },
        "limits": {
            "max_users": 10,
            "max_storage_gb": 1,
            "max_api_calls_per_month": 10000
        }
    }',
    
    -- Environment Configuration
    environment VARCHAR(50) DEFAULT 'production', -- 'development', 'staging', 'production'
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP
);

-- =====================================================================================
-- ADMINS TABLE
-- =====================================================================================
-- Platform administrators and client users
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    
    -- User Information
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Role and Permissions
    role VARCHAR(50) DEFAULT 'admin', -- 'superadmin', 'admin', 'client'
    
    -- Access Control
    -- For SUPERADMIN: ["*"] (access to everything)
    -- For ADMIN: ["client:123", "tenant:abc"] (specific access)
    -- For CLIENT: ["client:456"] (their own client only)
    tenant_access JSONB DEFAULT '[]',
    client_access JSONB DEFAULT '[]', -- Which clients this admin can access
    
    -- Client Relationship (for client-level users)
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE, -- NULL for superadmin/admin
    
    -- Account Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Security
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================================
-- SERVICES TABLE
-- =====================================================================================
-- Health monitoring for microservices
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'unknown', -- 'healthy', 'unhealthy', 'unknown'
    last_health_check TIMESTAMP,
    response_time_ms INTEGER,
    error_count INTEGER DEFAULT 0,
    version VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================================
-- AUDIT_LOG TABLE
-- =====================================================================================
-- Complete audit trail for all platform activities
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    
    -- Who performed the action
    admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE SET NULL,
    
    -- What happened
    action VARCHAR(100) NOT NULL, -- 'login', 'create_tenant', 'update_settings', etc.
    resource_type VARCHAR(100), -- 'tenant', 'client', 'admin', 'settings'
    resource_id VARCHAR(100), -- ID of the affected resource
    
    -- Action details
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================================
-- NOTIFICATIONS TABLE
-- =====================================================================================
-- System notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    
    -- Targeting
    target_audience VARCHAR(50) NOT NULL, -- 'all', 'superadmin', 'admin', 'client'
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE, -- NULL for platform-wide
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE, -- NULL for non-specific
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    priority VARCHAR(50) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    is_dismissible BOOLEAN DEFAULT true,
    
    -- Actions
    action_url VARCHAR(255),
    action_label VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- =====================================================================================
-- SYSTEM_CONFIG TABLE
-- =====================================================================================
-- Platform-wide configuration settings
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether this setting is visible to non-superadmins
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_subscription_tier ON clients(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- Tenants indexes
CREATE INDEX IF NOT EXISTS idx_tenants_client_id ON tenants(client_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_tier ON tenants(tier);
CREATE INDEX IF NOT EXISTS idx_tenants_api_key ON tenants(api_key);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);

-- Admins indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_client_id ON admins(client_id);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_client_id ON audit_log(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_target_audience ON notifications(target_audience);
CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =====================================================================================
-- SAMPLE DATA (Development)
-- =====================================================================================

-- Insert default system configuration
INSERT INTO system_config (key, value, description, is_public) VALUES
('platform_name', '"Codex Metatron Platform"', 'Platform display name', true),
('platform_version', '"1.0.0"', 'Current platform version', true),
('maintenance_mode', 'false', 'Whether platform is in maintenance mode', false),
('registration_enabled', 'true', 'Whether new client registration is enabled', false),
('max_tenants_per_client', '10', 'Maximum tenants per client', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default services
INSERT INTO services (name, endpoint, status) VALUES
('api-gateway', 'http://localhost:3000/health', 'healthy'),
('core-server', 'http://localhost:3001/health', 'healthy'),
('auth-service', 'http://localhost:3003/health', 'healthy')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();