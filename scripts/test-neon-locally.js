#!/usr/bin/env node

/**
 * Local Neon Database Test Script
 * This script safely tests your Neon database using environment variables
 * Run: npm run test:neon-local
 */

import { neon } from '@neondatabase/serverless';

// For testing, we'll use a direct connection string
// You can pass this as an environment variable or parameter
const testDatabaseUrl = process.argv[2] || process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  console.log('🔧 Usage: node scripts/test-neon-locally.js "your-neon-connection-string"');
  console.log('   Or: TEST_DATABASE_URL="your-connection-string" node scripts/test-neon-locally.js');
  console.log('');
  console.log('📝 Your Neon connection string should look like:');
  console.log('   postgresql://user:pass@host/db?sslmode=require');
  process.exit(1);
}

console.log('🚀 Testing Neon Database Connection...\n');

const sql = neon(testDatabaseUrl);

async function testConnection() {
  try {
    console.log('🔍 Testing basic connection...');
    const result = await sql`SELECT 
      version() as postgres_version,
      current_database() as database_name,
      current_user as user_name,
      now() as current_time
    `;
    
    console.log('✅ Connection successful!');
    console.log(`📊 PostgreSQL: ${result[0].postgres_version.split(' ')[0]} ${result[0].postgres_version.split(' ')[1]}`);
    console.log(`🗄️  Database: ${result[0].database_name}`);
    console.log(`👤 User: ${result[0].user_name}`);
    console.log(`⏰ Server Time: ${result[0].current_time}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function listTables() {
  try {
    console.log('\n🔍 Checking existing tables...');
    
    const tables = await sql`
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasindexes,
        hasrules,
        hastriggers
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    if (tables.length === 0) {
      console.log('📝 No tables found in public schema');
      console.log('💡 You may need to run database migrations first');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(table => {
        const features = [];
        if (table.hasindexes) features.push('indexes');
        if (table.hasrules) features.push('rules'); 
        if (table.hastriggers) features.push('triggers');
        
        console.log(`  📋 ${table.tablename} ${features.length > 0 ? `(${features.join(', ')})` : ''}`);
      });
    }
    
    return tables;
  } catch (error) {
    console.error('❌ Table listing failed:', error.message);
    return [];
  }
}

async function checkSchema() {
  try {
    console.log('\n🔍 Analyzing database schema...');
    
    const schemas = await sql`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `;
    
    console.log('📚 Available schemas:');
    schemas.forEach(schema => {
      console.log(`  📁 ${schema.schema_name}`);
    });
    
    return schemas;
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    return [];
  }
}

async function testReadWritePermissions() {
  try {
    console.log('\n🔍 Testing read/write permissions...');
    
    // Test if we can create a temporary table
    await sql`
      CREATE TEMP TABLE test_permissions (
        id SERIAL PRIMARY KEY,
        test_data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ CREATE permission: OK');
    
    // Test INSERT
    await sql`INSERT INTO test_permissions (test_data) VALUES ('test')`;
    console.log('✅ INSERT permission: OK');
    
    // Test SELECT  
    const result = await sql`SELECT COUNT(*) as count FROM test_permissions`;
    console.log(`✅ SELECT permission: OK (${result[0].count} rows)`);
    
    // Test UPDATE
    await sql`UPDATE test_permissions SET test_data = 'updated' WHERE id = 1`;
    console.log('✅ UPDATE permission: OK');
    
    // Test DELETE
    await sql`DELETE FROM test_permissions WHERE id = 1`;
    console.log('✅ DELETE permission: OK');
    
    console.log('🎉 All CRUD operations successful!');
    return true;
  } catch (error) {
    console.error('❌ Permission test failed:', error.message);
    return false;
  }
}

async function suggestNextSteps(tables) {
  console.log('\n📋 Next Steps Recommendations:');
  
  if (tables.length === 0) {
    console.log('1. 🚀 Run database migrations to create your tables');
    console.log('2. 📝 Check your schema files in the database/ directory');
    console.log('3. 🔧 Consider running: npm run db:migrate (if available)');
  } else {
    console.log('1. ✅ Your database is ready for development!');
    console.log('2. 🧪 Test your application services with this database');
    console.log('3. 📊 Consider running the full validation: npm run validate:db');
  }
  
  console.log('4. 🔒 Make sure to add your DATABASE_URL to .env file');
  console.log('5. 🔐 Keep your database credentials secure and never commit them');
}

async function main() {
  console.log('='.repeat(60));
  console.log('🧪 Codex Metatron Platform - Neon Database Test');
  console.log('='.repeat(60));
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Database connection failed. Please check:');
    console.log('   - Your connection string is correct');
    console.log('   - Your network connection');
    console.log('   - Neon database is accessible');
    process.exit(1);
  }
  
  // List schemas
  await checkSchema();
  
  // List tables
  const tables = await listTables();
  
  // Test permissions
  await testReadWritePermissions();
  
  // Suggest next steps
  await suggestNextSteps(tables);
  
  console.log('\n🎉 Neon database test completed successfully!');
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});