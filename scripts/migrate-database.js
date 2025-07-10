const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const db = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateDatabase() {
  try {
    console.log('🔄 Migrating database to support client-tenant relationships...');
    
    // Add client_access column to admins if it doesn't exist
    console.log('👥 Updating admins table...');
    try {
      await db.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS client_access JSONB DEFAULT '[]'`);
      await db.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE`);
      console.log('✅ Updated admins table with client relationships');
    } catch (error) {
      console.log('ℹ️ Admins table already has client columns or update failed:', error.message);
    }
    
    // Add client_id column to tenants if it doesn't exist
    console.log('🏗️ Updating tenants table...');
    try {
      await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL`);
      await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS app_type VARCHAR(100)`);
      await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subdomain VARCHAR(100) UNIQUE`);
      await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255)`);
      await db.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'production'`);
      console.log('✅ Updated tenants table with client relationships');
    } catch (error) {
      console.log('ℹ️ Tenants table already updated or update failed:', error.message);
    }
    
    // Check if test admin exists and update/create
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
      // Update existing admin to have proper access
      await db.query(`
        UPDATE admins 
        SET client_access = $1, tenant_access = $2, role = $3
        WHERE email = $4
      `, [
        JSON.stringify(['*']),
        JSON.stringify(['*']),
        'superadmin',
        'test'
      ]);
      console.log('✅ Updated existing admin with proper access');
    }
    
    // Create sample client for testing
    console.log('🏢 Creating sample client...');
    const clientExists = await db.query('SELECT id FROM clients WHERE email = $1', ['demo@example.com']);
    
    if (clientExists.rows.length === 0) {
      const clientResult = await db.query(`
        INSERT INTO clients (name, email, company_name, subscription_tier, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        'Demo Client',
        'demo@example.com', 
        'Demo Company',
        'professional',
        'active'
      ]);
      
      const clientId = clientResult.rows[0].id;
      
      // Create sample tenant for this client
      console.log('🏗️ Creating sample tenant...');
      const tenantExists = await db.query('SELECT id FROM tenants WHERE id = $1', ['demo-app']);
      
      if (tenantExists.rows.length === 0) {
        await db.query(`
          INSERT INTO tenants (id, name, client_id, api_key, tier, status, app_type, subdomain)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          'demo-app',
          'Demo Application',
          clientId,
          'demo-api-key-' + Date.now(),
          'professional',
          'active',
          'web-app',
          'demo'
        ]);
        console.log('✅ Created sample tenant linked to client');
      }
      
      console.log('✅ Created sample client and tenant');
    } else {
      console.log('ℹ️ Sample client already exists');
    }
    
    // Show current structure
    console.log('📊 Current database state:');
    
    const clientsCount = await db.query('SELECT COUNT(*) as count FROM clients');
    console.log(`  📈 Clients: ${clientsCount.rows[0].count}`);
    
    const tenantsCount = await db.query('SELECT COUNT(*) as count FROM tenants');
    console.log(`  🏗️ Tenants: ${tenantsCount.rows[0].count}`);
    
    const adminsCount = await db.query('SELECT COUNT(*) as count FROM admins');
    console.log(`  👥 Admins: ${adminsCount.rows[0].count}`);
    
    // Test the relationships
    console.log('🔗 Testing client-tenant relationships...');
    const relationships = await db.query(`
      SELECT 
        c.name as client_name,
        c.company_name,
        t.id as tenant_id,
        t.name as tenant_name,
        t.app_type,
        t.status
      FROM clients c
      LEFT JOIN tenants t ON c.id = t.client_id
      ORDER BY c.name, t.name
    `);
    
    console.log('🔗 Client-Tenant relationships:');
    relationships.rows.forEach(row => {
      if (row.tenant_id) {
        console.log(`  ${row.client_name} (${row.company_name}) → ${row.tenant_name} [${row.tenant_id}] (${row.app_type})`);
      } else {
        console.log(`  ${row.client_name} (${row.company_name}) → No tenants`);
      }
    });
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await db.end();
  }
}

migrateDatabase();