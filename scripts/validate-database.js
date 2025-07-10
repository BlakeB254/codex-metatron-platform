#!/usr/bin/env node

/**
 * Database Validation Script
 * Tests Neon database connectivity and validates schema
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env.example') });

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || process.env.MASTER_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ No DATABASE_URL found in environment variables');
  console.log('📝 Please set DATABASE_URL in your .env file');
  process.exit(1);
}

// Initialize Neon client
const sql = neon(DATABASE_URL);

async function validateDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const result = await sql`SELECT version(), current_database(), current_user`;
    
    console.log('✅ Database connection successful!');
    console.log(`📊 PostgreSQL Version: ${result[0].version}`);
    console.log(`🗄️  Database: ${result[0].current_database}`);
    console.log(`👤 User: ${result[0].current_user}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function validateTables() {
  try {
    console.log('\n🔍 Checking database tables...');
    
    const tables = await sql`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in public schema');
      return false;
    }
    
    console.log('✅ Found tables:');
    tables.forEach(table => {
      console.log(`  📋 ${table.table_name} (${table.table_type})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Table validation failed:', error.message);
    return false;
  }
}

async function validateUsersTable() {
  try {
    console.log('\n🔍 Validating users table structure...');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    if (columns.length === 0) {
      console.log('⚠️  Users table not found');
      return false;
    }
    
    console.log('✅ Users table structure:');
    columns.forEach(col => {
      console.log(`  🔸 ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // Test a simple query
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`👥 Total users: ${userCount[0].count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Users table validation failed:', error.message);
    return false;
  }
}

async function validateTenantsTable() {
  try {
    console.log('\n🔍 Validating tenants table structure...');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'tenants'
      ORDER BY ordinal_position
    `;
    
    if (columns.length === 0) {
      console.log('⚠️  Tenants table not found');
      return false;
    }
    
    console.log('✅ Tenants table structure:');
    columns.forEach(col => {
      console.log(`  🔸 ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    const tenantCount = await sql`SELECT COUNT(*) as count FROM tenants`;
    console.log(`🏢 Total tenants: ${tenantCount[0].count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Tenants table validation failed:', error.message);
    return false;
  }
}

async function testCRUDOperations() {
  try {
    console.log('\n🔍 Testing basic CRUD operations...');
    
    // Test INSERT
    const testTenant = await sql`
      INSERT INTO tenants (name, subdomain, status, settings)
      VALUES ('Test Tenant', 'test-' || extract(epoch from now()), 'active', '{}')
      RETURNING id, name, subdomain
    `;
    
    console.log(`✅ INSERT test passed - Created tenant: ${testTenant[0].name} (${testTenant[0].subdomain})`);
    
    // Test SELECT
    const tenant = await sql`
      SELECT id, name, subdomain, status, created_at
      FROM tenants 
      WHERE id = ${testTenant[0].id}
    `;
    
    console.log(`✅ SELECT test passed - Retrieved tenant: ${tenant[0].name}`);
    
    // Test UPDATE
    await sql`
      UPDATE tenants 
      SET name = 'Updated Test Tenant'
      WHERE id = ${testTenant[0].id}
    `;
    
    console.log('✅ UPDATE test passed');
    
    // Test DELETE
    await sql`DELETE FROM tenants WHERE id = ${testTenant[0].id}`;
    console.log('✅ DELETE test passed');
    
    return true;
  } catch (error) {
    console.error('❌ CRUD operations test failed:', error.message);
    return false;
  }
}

async function validateIndexes() {
  try {
    console.log('\n🔍 Checking database indexes...');
    
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    
    console.log('📊 Database indexes:');
    indexes.forEach(idx => {
      console.log(`  🔗 ${idx.tablename}.${idx.indexname}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Index validation failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Codex Metatron Platform Database Validation\n');
  
  const tests = [
    { name: 'Database Connection', fn: validateDatabaseConnection },
    { name: 'Table Structure', fn: validateTables },
    { name: 'Users Table', fn: validateUsersTable },
    { name: 'Tenants Table', fn: validateTenantsTable },
    { name: 'CRUD Operations', fn: testCRUDOperations },
    { name: 'Indexes', fn: validateIndexes }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error.message);
    }
  }
  
  console.log(`\n📊 Database Validation Results: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All database validations passed! Your Neon database is properly configured.');
    process.exit(0);
  } else {
    console.log('⚠️  Some validations failed. Please check your database configuration.');
    process.exit(1);
  }
}

// Run validation
main().catch(error => {
  console.error('💥 Validation script failed:', error);
  process.exit(1);
});