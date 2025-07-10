const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const DATABASE_URL = 'postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const db = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdminCorrect() {
  try {
    console.log('🔧 Creating admin user with correct data types...');
    
    // Delete existing test admin if exists
    await db.query('DELETE FROM admins WHERE email = $1', ['test']);
    console.log('🗑️ Removed existing test admin');
    
    // Create new admin with correct data types
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    // tenant_access is ARRAY type, client_access is JSONB type
    await db.query(`
      INSERT INTO admins (email, password_hash, role, tenant_access, client_access, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      'test', 
      hashedPassword, 
      'superadmin', 
      ['*'],  // Array for tenant_access
      JSON.stringify(['*']),  // JSON string for client_access JSONB
      true
    ]);
    
    console.log('✅ Created new admin: test/test123');
    
    // Verify the admin
    const admin = await db.query('SELECT * FROM admins WHERE email = $1', ['test']);
    console.log('👤 Admin details:', {
      id: admin.rows[0].id,
      email: admin.rows[0].email,
      role: admin.rows[0].role,
      tenant_access: admin.rows[0].tenant_access,
      client_access: admin.rows[0].client_access,
      is_active: admin.rows[0].is_active
    });
    
    // Test password verification
    const testPassword = await bcrypt.compare('test123', admin.rows[0].password_hash);
    console.log('🔑 Password verification:', testPassword ? '✅ Valid' : '❌ Invalid');
    
    console.log('🎉 Admin user ready for authentication!');
    
  } catch (error) {
    console.error('❌ Create admin error:', error);
  } finally {
    await db.end();
  }
}

createAdminCorrect();