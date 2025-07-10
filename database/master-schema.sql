-- MASTER DATABASE SCHEMA
-- Run this in your main Neon database FIRST!
-- This schema manages all tenants and system-wide configuration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table - Core tenant management
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'standard', 'premium', 'enterprise')),
  db_connection_string TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{
    "features": {
      "crm": true,
      "billing": true,
      "content": true,
      "max_users": 5
    }
  }'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Admins table (for CDXPharaoh access)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin')),
  tenant_access TEXT[], -- Array of tenant IDs for admins
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Services health tracking
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  endpoint VARCHAR(255),
  status VARCHAR(20) DEFAULT 'unknown' CHECK (status IN ('healthy', 'unhealthy', 'unknown', 'maintenance')),
  last_health_check TIMESTAMP,
  response_time_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant service configuration (which services each tenant has access to)
CREATE TABLE IF NOT EXISTS tenant_services (
  tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
  service_name VARCHAR(100),
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tenant_id, service_name)
);

-- Audit log for system-wide actions
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50),
  admin_id INTEGER REFERENCES admins(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- API key, IP, or user ID
  endpoint VARCHAR(255) NOT NULL,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(identifier, endpoint, window_start)
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  target_audience VARCHAR(50) DEFAULT 'admin' CHECK (target_audience IN ('admin', 'superadmin', 'all')),
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_api_key ON tenants(api_key);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_tier ON tenants(tier);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_last_health_check ON services(last_health_check);

CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_target_audience ON notifications(target_audience);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_services_updated_at BEFORE UPDATE ON tenant_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial system configuration
INSERT INTO system_config (key, value, description) VALUES
  ('platform_version', '"1.0.0"', 'Current platform version'),
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('max_tenants', '1000', 'Maximum number of tenants allowed'),
  ('default_tenant_tier', '"free"', 'Default tier for new tenants'),
  ('health_check_interval', '30', 'Health check interval in seconds')
ON CONFLICT (key) DO NOTHING;

-- Insert initial services (update endpoints as needed)
INSERT INTO services (name, endpoint) VALUES
  ('core-server', 'http://localhost:3000/health'),
  ('auth-service', 'http://localhost:3001/health'),
  ('billing-service', 'http://localhost:3002/health'),
  ('subscription-service', 'http://localhost:3003/health'),
  ('crm-service', 'http://localhost:3004/health'),
  ('client-service', 'http://localhost:3005/health'),
  ('admin-service', 'http://localhost:3006/health')
ON CONFLICT (name) DO NOTHING;

-- Insert initial superadmin user
-- IMPORTANT: Change the password hash! This is for 'changeme123'
-- Generate your own hash with: bcrypt.hash('your-password', 12)
INSERT INTO admins (email, password_hash, role) VALUES (
  'superadmin@codexmetatron.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewliMSEmVV/85Bz.',
  'superadmin'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample tenant for testing (optional)
INSERT INTO tenants (id, name, api_key, tier, status, settings, metadata) VALUES (
  'demo001',
  'Demo Company',
  'tenant_demo001_key_abcdef123456',
  'free',
  'active',
  '{"features": {"crm": true, "billing": true, "content": true, "max_users": 5}}'::jsonb,
  '{"contact_email": "demo@example.com", "industry": "technology"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create a function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate tenant statistics
CREATE OR REPLACE FUNCTION get_tenant_stats()
RETURNS TABLE (
  total_tenants INTEGER,
  active_tenants INTEGER,
  suspended_tenants INTEGER,
  cancelled_tenants INTEGER,
  by_tier JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM tenants) as total_tenants,
    (SELECT COUNT(*)::INTEGER FROM tenants WHERE status = 'active') as active_tenants,
    (SELECT COUNT(*)::INTEGER FROM tenants WHERE status = 'suspended') as suspended_tenants,
    (SELECT COUNT(*)::INTEGER FROM tenants WHERE status = 'cancelled') as cancelled_tenants,
    (SELECT jsonb_object_agg(tier, cnt) 
     FROM (SELECT tier, COUNT(*) as cnt FROM tenants GROUP BY tier) t) as by_tier;
END;
$$ LANGUAGE plpgsql;

-- Create a function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_tenant_id VARCHAR(50),
  p_admin_id INTEGER,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50),
  p_resource_id VARCHAR(100),
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address VARCHAR(45) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_log (
    tenant_id, admin_id, action, resource_type, resource_id, 
    details, ip_address, user_agent
  ) VALUES (
    p_tenant_id, p_admin_id, p_action, p_resource_type, p_resource_id,
    p_details, p_ip_address, p_user_agent
  );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Master database schema created successfully!';
  RAISE NOTICE 'Remember to:';
  RAISE NOTICE '1. Change the default superadmin password';
  RAISE NOTICE '2. Update service endpoints to match your deployment';
  RAISE NOTICE '3. Set up your environment variables';
  RAISE NOTICE '4. Create tenant databases using the tenant schema';
END $$;