const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_SsVgbmR5JPw2@ep-ancient-salad-aej1xvx3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const db = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspectDatabase() {
  try {
    console.log('🔍 INSPECTING CDX-DB STRUCTURE');
    console.log('='.repeat(50));
    
    // Get all tables
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Current Tables:');
    tables.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    console.log('\n' + '='.repeat(50));
    
    // Inspect each table structure
    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      console.log(`\n📊 TABLE: ${tableName.toUpperCase()}`);
      console.log('-'.repeat(30));
      
      // Get columns
      const columns = await db.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.log('Columns:');
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  • ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
      });
      
      // Get constraints
      const constraints = await db.query(`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = $1;
      `, [tableName]);
      
      if (constraints.rows.length > 0) {
        console.log('Constraints:');
        constraints.rows.forEach(constraint => {
          if (constraint.constraint_type === 'FOREIGN KEY') {
            console.log(`  🔗 FK: ${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
          } else if (constraint.constraint_type === 'PRIMARY KEY') {
            console.log(`  🔑 PK: ${constraint.column_name}`);
          } else if (constraint.constraint_type === 'UNIQUE') {
            console.log(`  ⭐ UNIQUE: ${constraint.column_name}`);
          }
        });
      }
      
      // Get row count
      const count = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`📈 Row Count: ${count.rows[0].count}`);
      
      // Show sample data for key tables
      if (['clients', 'tenants', 'admins'].includes(tableName)) {
        const sample = await db.query(`SELECT * FROM ${tableName} LIMIT 3`);
        if (sample.rows.length > 0) {
          console.log('Sample Data:');
          sample.rows.forEach((row, index) => {
            console.log(`  ${index + 1}. ${JSON.stringify(row, null, 2)}`);
          });
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🔗 RELATIONSHIP ANALYSIS');
    console.log('='.repeat(50));
    
    // Analyze relationships
    const relationships = await db.query(`
      SELECT 
        c.name as client_name,
        c.id as client_id,
        c.company_name,
        t.id as tenant_id,
        t.name as tenant_name,
        t.app_type,
        t.status as tenant_status,
        a.email as admin_email,
        a.role as admin_role
      FROM clients c
      LEFT JOIN tenants t ON c.id = t.client_id
      LEFT JOIN admins a ON c.id = a.client_id
      ORDER BY c.name, t.name, a.email
    `);
    
    console.log('Client-Tenant-Admin Relationships:');
    let currentClient = null;
    relationships.rows.forEach(row => {
      if (row.client_name !== currentClient) {
        currentClient = row.client_name;
        console.log(`\n🏢 CLIENT: ${row.client_name} (ID: ${row.client_id})`);
        if (row.company_name) console.log(`   Company: ${row.company_name}`);
      }
      
      if (row.tenant_id) {
        console.log(`  └── 📱 APP: ${row.tenant_name} [${row.tenant_id}] (${row.app_type || 'unknown'}) - ${row.tenant_status}`);
      }
      
      if (row.admin_email) {
        console.log(`  └── 👤 ADMIN: ${row.admin_email} (${row.admin_role})`);
      }
    });
    
    // Database statistics
    console.log('\n' + '='.repeat(50));
    console.log('📊 DATABASE STATISTICS');
    console.log('='.repeat(50));
    
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM clients) as total_clients,
        (SELECT COUNT(*) FROM tenants) as total_tenants,
        (SELECT COUNT(*) FROM admins) as total_admins,
        (SELECT COUNT(*) FROM tenants WHERE client_id IS NULL) as internal_apps,
        (SELECT COUNT(*) FROM tenants WHERE client_id IS NOT NULL) as client_apps
    `);
    
    const stat = stats.rows[0];
    console.log(`📈 Total Clients: ${stat.total_clients}`);
    console.log(`📱 Total Applications: ${stat.total_tenants}`);
    console.log(`👥 Total Admins: ${stat.total_admins}`);
    console.log(`🏠 Internal Apps: ${stat.internal_apps}`);
    console.log(`🏢 Client Apps: ${stat.client_apps}`);
    
  } catch (error) {
    console.error('❌ Database inspection error:', error);
  } finally {
    await db.end();
  }
}

inspectDatabase();