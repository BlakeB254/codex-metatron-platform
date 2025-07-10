#!/bin/bash

# Database Setup Script for Codex Metatron Platform
# This script initializes the master database with the required schema

echo "🚀 Setting up Codex Metatron Platform Database..."

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(cat .env | grep -v '#' | grep -v '^$' | xargs)
else
    echo "❌ ERROR: .env file not found"
    echo "Please copy .env.example to .env and configure your settings"
    exit 1
fi

# Check if environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL in your .env file"
    exit 1
fi

echo "📊 DATABASE_URL found: ${DATABASE_URL:0:20}..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: psql is not installed or not in PATH"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

echo "✅ PostgreSQL client found"

# Test database connection
echo "🔗 Testing database connection..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ ERROR: Cannot connect to database"
    echo "Please check your DATABASE_URL and ensure the database is accessible"
    exit 1
fi

echo "✅ Database connection successful"

# Run the master schema setup
echo "📋 Creating master database schema..."
if psql "$DATABASE_URL" -f database/master-schema.sql; then
    echo "✅ Master schema created successfully"
else
    echo "❌ ERROR: Failed to create master schema"
    exit 1
fi

# Verify schema creation
echo "🔍 Verifying schema creation..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('tenants', 'admins', 'services', 'audit_log');")

if [ "$TABLE_COUNT" -eq 4 ]; then
    echo "✅ All required tables created successfully"
else
    echo "⚠️  WARNING: Expected 4 tables, found $TABLE_COUNT"
fi

# Check if default superadmin exists
ADMIN_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM admins WHERE role = 'superadmin';")

if [ "$ADMIN_COUNT" -gt 0 ]; then
    echo "✅ Superadmin account exists"
    echo "📧 Default login: superadmin@codexmetatron.com"
    echo "🔑 Default password: changeme123"
    echo "⚠️  IMPORTANT: Change the default password immediately!"
else
    echo "❌ ERROR: No superadmin account found"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the core server: cd apps/core-server && npm run dev"
echo "2. Start the Pharaoh admin app: cd apps/cdx-pharaoh && npm run dev"
echo "3. Login with the default credentials and change the password"
echo "4. Create your first tenant via the admin interface"
echo ""
echo "🔗 Admin Interface: http://localhost:5173"
echo "🔗 API Server: http://localhost:3000"
echo ""