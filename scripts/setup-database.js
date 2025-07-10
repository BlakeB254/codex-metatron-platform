const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const db = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    console.log('🔍 Checking current database structure...');
    
    // Check existing tables
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Current tables:', tablesResult.rows.map(r => r.table_name));
    
    // Create clients table
    console.log('🏢 Creating clients table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        company_name VARCHAR(255),
        phone VARCHAR(50),
        industry VARCHAR(100),
        subscription_tier VARCHAR(50) DEFAULT 'free',
        status VARCHAR(50) DEFAULT 'active',
        tenant_ids JSONB DEFAULT '[]',
        settings JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP
      );
    `);
    
    // Create or update tenants table
    console.log('🏗️ Creating/updating tenants table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        app_type VARCHAR(100),
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        api_key VARCHAR(255) UNIQUE NOT NULL,
        subdomain VARCHAR(100) UNIQUE,
        custom_domain VARCHAR(255),
        db_connection_string TEXT,
        tier VARCHAR(50) DEFAULT 'free',
        status VARCHAR(50) DEFAULT 'active',
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
        environment VARCHAR(50) DEFAULT 'production',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP
      );
    `);
    
    // Create or update admins table
    console.log('👥 Creating/updating admins table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'admin',
        tenant_access JSONB DEFAULT '[]',
        client_access JSONB DEFAULT '[]',
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        preferences JSONB DEFAULT '{}',
        timezone VARCHAR(50) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if test admin exists and create if not
    console.log('👤 Setting up default admin...');
    const adminExists = await db.query('SELECT id FROM admins WHERE email = $1', ['test']);
    
    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('test123', 12);
      
      await db.query(`
        INSERT INTO admins (email, password_hash, role, tenant_access, client_access)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'test', 
        hashedPassword, 
        'superadmin', 
        JSON.stringify(['*']),
        JSON.stringify(['*'])
      ]);
      console.log('✅ Created default admin: test/test123');
    } else {
      console.log('ℹ️ Default admin already exists');
    }
    
    // Create other essential tables
    console.log('📊 Creating additional tables...');
    
    // Services table
    await db.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'unknown',
        last_health_check TIMESTAMP,
        response_time_ms INTEGER,
        error_count INTEGER DEFAULT 0,
        version VARCHAR(50),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Audit log table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100),
        resource_id VARCHAR(100),
        description TEXT,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        session_id VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    console.log('📇 Creating indexes...');
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_tenants_client_id ON tenants(client_id);
      CREATE INDEX IF NOT EXISTS idx_admins_client_id ON admins(client_id);
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
      CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_client_id ON audit_log(client_id);
      CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
    `);
    
    // Show final structure
    console.log('✅ Database setup completed!');
    console.log('📋 Final table structure:');
    
    const finalTables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    finalTables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test the relationships
    console.log('🔗 Testing relationships...');
    
    // Check if any clients exist
    const clientsCount = await db.query('SELECT COUNT(*) as count FROM clients');
    console.log(`Clients: ${clientsCount.rows[0].count}`);
    
    const tenantsCount = await db.query('SELECT COUNT(*) as count FROM tenants');
    console.log(`Tenants: ${tenantsCount.rows[0].count}`);
    
    const adminsCount = await db.query('SELECT COUNT(*) as count FROM admins');
    console.log(`Admins: ${adminsCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
  } finally {
    await db.end();
  }
}

setupDatabase();