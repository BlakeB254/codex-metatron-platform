#!/bin/bash

echo "🚀 Starting Simple Codex Metatron Platform..."

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true  
lsof -ti:3003 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Create logs directory
mkdir -p logs

# Start Core Server (Port 3001)
echo "🔧 Starting Core Server on port 3001..."
cd apps/core-server
npx ts-node src/simple-server.ts > ../../logs/core-simple.log 2>&1 &
CORE_PID=$!
echo $CORE_PID > ../../pids/core-server.pid
cd ../..

# Wait a moment
sleep 2

# Start Auth Service (Port 3003)  
echo "🔐 Starting Auth Service on port 3003..."
cd services/auth-service
npx ts-node src/multi-db-auth.ts > ../../logs/auth-simple.log 2>&1 &
AUTH_PID=$!
echo $AUTH_PID > ../../pids/auth-service.pid
cd ../..

# Wait a moment
sleep 2

# Start API Gateway (Port 3000)
echo "🚪 Starting API Gateway on port 3000..."
cd services/api-gateway  
npx ts-node src/fixed-gateway.ts > ../../logs/gateway-simple.log 2>&1 &
GATEWAY_PID=$!
echo $GATEWAY_PID > ../../pids/api-gateway.pid
cd ../..

# Wait a moment  
sleep 2

# Start Frontend (Port 5173)
echo "🎨 Starting Frontend on port 5173..."
cd apps/cdx-pharaoh
npm run dev > ../../logs/frontend-simple.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../pids/frontend.pid
cd ../..

# Wait for services to start
sleep 5

echo ""
echo "✅ Codex Metatron Platform Started!"
echo "=================================="
echo "🚪 API Gateway:  http://localhost:3000"
echo "🔧 Core Server:  http://localhost:3001" 
echo "🔐 Auth Service: http://localhost:3003"
echo "🎨 Frontend:     http://localhost:5173"
echo ""
echo "📊 Health Checks:"
echo "curl http://localhost:3000/health"
echo "curl http://localhost:3001/health"  
echo "curl http://localhost:3003/health"
echo ""
echo "🛑 To stop: ./scripts/stop-simple.sh"