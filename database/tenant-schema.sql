-- TENANT DATABASE SCHEMA
-- Run this in each tenant's Neon database
-- This schema contains tenant-specific data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for tenant-specific authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Clients table (primary business entities)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  website VARCHAR(255),
  industry VARCHAR(100),
  address JSONB DEFAULT '{}'::jsonb,
  billing_address JSONB DEFAULT '{}'::jsonb,
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'churned')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'vip')),
  source VARCHAR(100), -- How they found us
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true
);

-- Products and Services catalog
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  sku VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(12,2),
  cost DECIMAL(12,2),
  type VARCHAR(50) DEFAULT 'product' CHECK (type IN ('product', 'service', 'subscription', 'digital')),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[],
  images TEXT[], -- URLs to product images
  specifications JSONB DEFAULT '{}'::jsonb,
  inventory_count INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Subscriptions management
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired', 'trial')),
  start_date DATE NOT NULL,
  end_date DATE,
  trial_end_date DATE,
  next_billing_date DATE,
  billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(50),
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- CRM: Contacts (multiple contacts per client)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  position VARCHAR(100),
  department VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  is_decision_maker BOOLEAN DEFAULT false,
  communication_preferences JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- CRM: Deals/Opportunities
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  stage VARCHAR(50) DEFAULT 'prospect' CHECK (stage IN ('prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to INTEGER REFERENCES users(id),
  source VARCHAR(100),
  competitors TEXT[],
  products_interested TEXT[], -- Array of product names/IDs
  close_reason TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  closed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- CRM: Activities (calls, emails, meetings, tasks, notes)
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note', 'demo', 'proposal', 'follow_up')),
  subject VARCHAR(255),
  description TEXT,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
  assigned_to INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'no_show')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INTEGER, -- For calls/meetings
  outcome TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Content management (blogs, newsletters, social posts, events)
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('blog', 'newsletter', 'social_post', 'event', 'press_release', 'case_study')),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image VARCHAR(500),
  gallery_images TEXT[],
  author_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMP,
  scheduled_for TIMESTAMP,
  tags TEXT[],
  categories TEXT[],
  seo_title VARCHAR(255),
  seo_description VARCHAR(500),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  allow_comments BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Orders/Invoices
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'order' CHECK (type IN ('order', 'invoice', 'quote', 'estimate')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  billing_address JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL, -- Snapshot at time of order
  product_sku VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Email campaigns and marketing
CREATE TABLE IF NOT EXISTS email_campaigns (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  html_content TEXT,
  text_content TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  recipient_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Files and attachments
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  external_id UUID DEFAULT uuid_generate_v4() UNIQUE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  file_hash VARCHAR(64), -- For deduplication
  related_to_type VARCHAR(50), -- 'client', 'deal', 'order', etc.
  related_to_id INTEGER,
  is_public BOOLEAN DEFAULT false,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_external_id ON clients(external_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);

CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_primary ON contacts(is_primary);

CREATE INDEX IF NOT EXISTS idx_deals_client_id ON deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON deals(expected_close_date);

CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON activities(assigned_to);

CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON content(published_at);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_files_related_to ON files(related_to_type, related_to_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_file_hash ON files(file_hash);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create functions for common operations

-- Function to get client summary
CREATE OR REPLACE FUNCTION get_client_summary(p_client_id INTEGER)
RETURNS TABLE (
  client_info JSONB,
  total_deals INTEGER,
  total_deal_value DECIMAL,
  active_subscriptions INTEGER,
  last_activity_date TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(c.*) as client_info,
    (SELECT COUNT(*)::INTEGER FROM deals WHERE client_id = p_client_id) as total_deals,
    (SELECT COALESCE(SUM(value), 0) FROM deals WHERE client_id = p_client_id AND stage = 'closed_won') as total_deal_value,
    (SELECT COUNT(*)::INTEGER FROM subscriptions WHERE client_id = p_client_id AND status = 'active') as active_subscriptions,
    (SELECT MAX(created_at) FROM activities WHERE client_id = p_client_id) as last_activity_date
  FROM clients c
  WHERE c.id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
  subtotal DECIMAL;
  tax_amt DECIMAL;
  discount_amt DECIMAL;
  shipping_amt DECIMAL;
BEGIN
  SELECT 
    COALESCE(SUM(total_price), 0),
    COALESCE(MAX(o.tax_amount), 0),
    COALESCE(MAX(o.discount_amount), 0),
    COALESCE(MAX(o.shipping_amount), 0)
  INTO subtotal, tax_amt, discount_amt, shipping_amt
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE oi.order_id = p_order_id;
  
  RETURN subtotal + tax_amt + shipping_amt - discount_amt;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Tenant database schema created successfully!';
  RAISE NOTICE 'This schema includes:';
  RAISE NOTICE '- User management';
  RAISE NOTICE '- Client/Customer management';
  RAISE NOTICE '- Product catalog';
  RAISE NOTICE '- Subscription management';
  RAISE NOTICE '- CRM (contacts, deals, activities)';
  RAISE NOTICE '- Content management';
  RAISE NOTICE '- Order/Invoice management';
  RAISE NOTICE '- Email campaigns';
  RAISE NOTICE '- File attachments';
END $$;