#!/bin/bash

# Start Script for Codex Metatron Platform
# This script starts all necessary services for development

echo "🚀 Starting Codex Metatron Platform..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found"
    echo "Please copy .env.example to .env and configure your settings"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '#' | xargs)

echo "✅ Environment variables loaded"

# Check if database is accessible
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set in .env file"
    exit 1
fi

echo "🔗 Testing database connection..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ ERROR: Cannot connect to database"
    echo "Please run: ./scripts/setup-database.sh first"
    exit 1
fi

echo "✅ Database connection successful"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check required ports
CORE_PORT=${PORT:-3000}
PHARAOH_PORT=5173

if ! check_port $CORE_PORT; then
    echo "Please stop the service using port $CORE_PORT or change PORT in .env"
    exit 1
fi

if ! check_port $PHARAOH_PORT; then
    echo "Please stop the service using port $PHARAOH_PORT"
    exit 1
fi

echo "✅ Required ports are available"

# Install dependencies if needed
echo "📦 Checking dependencies..."

if [ ! -d "apps/core-server/node_modules" ]; then
    echo "Installing core-server dependencies..."
    cd apps/core-server && npm install && cd ../..
fi

if [ ! -d "apps/cdx-pharaoh/node_modules" ]; then
    echo "Installing pharaoh app dependencies..."
    cd apps/cdx-pharaoh && npm install && cd ../..
fi

echo "✅ Dependencies ready"

# Create log directory
mkdir -p logs

echo "🎯 Starting services..."

# Start core server in background
echo "Starting Core API Server on port $CORE_PORT..."
cd apps/core-server
npm run dev > ../../logs/core-server.log 2>&1 &
CORE_PID=$!
cd ../..

# Wait a moment for core server to start
sleep 3

# Check if core server started successfully
if ! kill -0 $CORE_PID 2>/dev/null; then
    echo "❌ ERROR: Core server failed to start"
    echo "Check logs/core-server.log for details"
    exit 1
fi

echo "✅ Core API Server started (PID: $CORE_PID)"

# Start Pharaoh admin app in background
echo "Starting Pharaoh Admin App on port $PHARAOH_PORT..."
cd apps/cdx-pharaoh
npm run dev > ../../logs/pharaoh-app.log 2>&1 &
PHARAOH_PID=$!
cd ../..

# Wait a moment for pharaoh app to start
sleep 3

# Check if pharaoh app started successfully
if ! kill -0 $PHARAOH_PID 2>/dev/null; then
    echo "❌ ERROR: Pharaoh app failed to start"
    echo "Check logs/pharaoh-app.log for details"
    # Kill core server
    kill $CORE_PID 2>/dev/null
    exit 1
fi

echo "✅ Pharaoh Admin App started (PID: $PHARAOH_PID)"

# Create process tracking file
echo "$CORE_PID" > .core-server.pid
echo "$PHARAOH_PID" > .pharaoh-app.pid

echo ""
echo "🎉 Codex Metatron Platform is now running!"
echo ""
echo "📊 Core API Server: http://localhost:$CORE_PORT"
echo "🏛️  Pharaoh Admin: http://localhost:$PHARAOH_PORT"
echo ""
echo "📧 Default Login: superadmin@codexmetatron.com"
echo "🔑 Default Password: changeme123"
echo "⚠️  IMPORTANT: Change the default password immediately!"
echo ""
echo "📋 Useful commands:"
echo "  View API logs: tail -f logs/core-server.log"
echo "  View Admin logs: tail -f logs/pharaoh-app.log"
echo "  Stop platform: ./scripts/stop-platform.sh"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    
    if [ -f ".core-server.pid" ]; then
        CORE_PID=$(cat .core-server.pid)
        kill $CORE_PID 2>/dev/null && echo "✅ Core server stopped"
        rm .core-server.pid
    fi
    
    if [ -f ".pharaoh-app.pid" ]; then
        PHARAOH_PID=$(cat .pharaoh-app.pid)
        kill $PHARAOH_PID 2>/dev/null && echo "✅ Pharaoh app stopped"
        rm .pharaoh-app.pid
    fi
    
    echo "👋 Platform stopped successfully"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait