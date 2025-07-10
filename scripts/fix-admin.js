const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const DATABASE_URL = 'postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const db = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAdmin() {
  try {
    console.log('🔧 Fixing admin user...');
    
    // Delete existing test admin if exists
    await db.query('DELETE FROM admins WHERE email = $1', ['test']);
    console.log('🗑️ Removed existing test admin');
    
    // Create new admin with simple access
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    await db.query(`
      INSERT INTO admins (email, password_hash, role, tenant_access, client_access)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      'test', 
      hashedPassword, 
      'superadmin', 
      '["*"]',
      '["*"]'
    ]);
    
    console.log('✅ Created new admin: test/test123');
    
    // Verify the admin
    const admin = await db.query('SELECT * FROM admins WHERE email = $1', ['test']);
    console.log('👤 Admin created:', {
      id: admin.rows[0].id,
      email: admin.rows[0].email,
      role: admin.rows[0].role,
      tenant_access: admin.rows[0].tenant_access,
      client_access: admin.rows[0].client_access
    });
    
  } catch (error) {
    console.error('❌ Fix admin error:', error);
  } finally {
    await db.end();
  }
}

fixAdmin();