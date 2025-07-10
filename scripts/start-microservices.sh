#!/bin/bash

# Codex Metatron Platform - Microservices Startup Script
# This script starts all microservices in the correct order

set -e

echo "🚀 Starting Codex Metatron Platform Microservices..."
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
  local port=$1
  local service_name=$2
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port $port is already in use (${service_name} may already be running)${NC}"
    return 1
  fi
  return 0
}

# Function to wait for service to be ready
wait_for_service() {
  local port=$1
  local service_name=$2
  local max_attempts=30
  local attempt=1
  
  echo -e "${BLUE}🔄 Waiting for ${service_name} to be ready on port ${port}...${NC}"
  
  while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:$port/health >/dev/null 2>&1; then
      echo -e "${GREEN}✅ ${service_name} is ready!${NC}"
      return 0
    fi
    
    echo -e "${YELLOW}⏳ Attempt $attempt/$max_attempts - ${service_name} not ready yet...${NC}"
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo -e "${RED}❌ ${service_name} failed to start within expected time${NC}"
  return 1
}

# Check if required environment variables are set
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env from template. Please review and update the configuration.${NC}"
  else
    echo -e "${RED}❌ No .env.example found. Please create .env manually.${NC}"
    exit 1
  fi
fi

# Source environment variables
source .env

# Check ports availability
echo -e "${BLUE}🔍 Checking port availability...${NC}"
check_service 3000 "API Gateway" || echo -e "${YELLOW}Continuing anyway...${NC}"
check_service 3001 "Core Server" || echo -e "${YELLOW}Continuing anyway...${NC}"
check_service 3002 "CRM Service" || echo -e "${YELLOW}Continuing anyway...${NC}"
check_service 3003 "Auth Service" || echo -e "${YELLOW}Continuing anyway...${NC}"
check_service 5173 "Frontend" || echo -e "${YELLOW}Continuing anyway...${NC}"

echo ""
echo -e "${BLUE}🏗️  Building services...${NC}"

# Install dependencies and build services
echo -e "${BLUE}📦 Installing Core Server dependencies...${NC}"
cd apps/core-server
npm install >/dev/null 2>&1 || {
  echo -e "${RED}❌ Failed to install Core Server dependencies${NC}"
  exit 1
}
npm run build >/dev/null 2>&1 || {
  echo -e "${YELLOW}⚠️  Core Server build failed, will run in dev mode${NC}"
}
cd ../..

echo -e "${BLUE}📦 Installing Auth Service dependencies...${NC}"
cd services/auth-service
npm install >/dev/null 2>&1 || {
  echo -e "${RED}❌ Failed to install Auth Service dependencies${NC}"
  exit 1
}
npm run build >/dev/null 2>&1 || {
  echo -e "${YELLOW}⚠️  Auth Service build failed, will run in dev mode${NC}"
}
cd ../..

echo -e "${BLUE}📦 Installing API Gateway dependencies...${NC}"
cd services/api-gateway
npm install >/dev/null 2>&1 || {
  echo -e "${RED}❌ Failed to install API Gateway dependencies${NC}"
  exit 1
}
npm run build >/dev/null 2>&1 || {
  echo -e "${YELLOW}⚠️  API Gateway build failed, will run in dev mode${NC}"
}
cd ../..

echo -e "${BLUE}📦 Installing CRM Service dependencies...${NC}"
cd services/crm-service
npm install >/dev/null 2>&1 || {
  echo -e "${RED}❌ Failed to install CRM Service dependencies${NC}"
  exit 1
}
npm run build >/dev/null 2>&1 || {
  echo -e "${YELLOW}⚠️  CRM Service build failed, will run in dev mode${NC}"
}
cd ../..

echo -e "${BLUE}📦 Installing Frontend dependencies...${NC}"
cd apps/cdx-pharaoh
npm install >/dev/null 2>&1 || {
  echo -e "${RED}❌ Failed to install Frontend dependencies${NC}"
  exit 1
}
cd ../..

echo ""
echo -e "${GREEN}🚀 Starting services in correct order...${NC}"
echo "=================================================="

# Start services in dependency order
# 1. Core Server (port 3001) - Business logic and database operations
echo -e "${BLUE}1. Starting Core Server on port 3001...${NC}"
cd apps/core-server
if [ -f dist/server.js ]; then
  PORT=3001 nohup node dist/server.js > ../../logs/core-server.log 2>&1 &
else
  PORT=3001 nohup npm run dev > ../../logs/core-server.log 2>&1 &
fi
CORE_SERVER_PID=$!
echo $CORE_SERVER_PID > ../../pids/core-server.pid
cd ../..

# Wait for Core Server to be ready
wait_for_service 3001 "Core Server"

# 2. Auth Service (port 3003) - Authentication and authorization
echo -e "${BLUE}2. Starting Auth Service on port 3003...${NC}"
cd services/auth-service
if [ -f dist/server.js ]; then
  PORT=3003 nohup node dist/server.js > ../../logs/auth-service.log 2>&1 &
else
  PORT=3003 nohup npm run dev > ../../logs/auth-service.log 2>&1 &
fi
AUTH_SERVICE_PID=$!
echo $AUTH_SERVICE_PID > ../../pids/auth-service.pid
cd ../..

# Wait for Auth Service to be ready
wait_for_service 3003 "Auth Service"

# 3. CRM Service (port 3002) - Customer relationship management
echo -e "${BLUE}3. Starting CRM Service on port 3002...${NC}"
cd services/crm-service
if [ -f dist/server.js ]; then
  PORT=3002 nohup node dist/server.js > ../../logs/crm-service.log 2>&1 &
else
  PORT=3002 nohup npm run dev > ../../logs/crm-service.log 2>&1 &
fi
CRM_SERVICE_PID=$!
echo $CRM_SERVICE_PID > ../../pids/crm-service.pid
cd ../..

# Wait for CRM Service to be ready
wait_for_service 3002 "CRM Service"

# 4. API Gateway (port 3000) - Routes requests to appropriate services
echo -e "${BLUE}4. Starting API Gateway on port 3000...${NC}"
cd services/api-gateway
if [ -f dist/server.js ]; then
  PORT=3000 nohup node dist/server.js > ../../logs/api-gateway.log 2>&1 &
else
  PORT=3000 nohup npm run dev > ../../logs/api-gateway.log 2>&1 &
fi
API_GATEWAY_PID=$!
echo $API_GATEWAY_PID > ../../pids/api-gateway.pid
cd ../..

# Wait for API Gateway to be ready
wait_for_service 3000 "API Gateway"

# 5. Frontend (port 5173) - React application
echo -e "${BLUE}5. Starting Frontend on port 5173...${NC}"
cd apps/cdx-pharaoh
nohup npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../pids/frontend.pid
cd ../..

# Wait for Frontend to be ready
echo -e "${BLUE}🔄 Waiting for Frontend to be ready on port 5173...${NC}"
sleep 5

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo "=================================================="
echo -e "${GREEN}📋 Service Status:${NC}"
echo -e "${BLUE}• API Gateway:${NC}     http://localhost:3000"
echo -e "${BLUE}• Core Server:${NC}     http://localhost:3001"
echo -e "${BLUE}• CRM Service:${NC}     http://localhost:3002"
echo -e "${BLUE}• Auth Service:${NC}    http://localhost:3003"
echo -e "${BLUE}• Frontend:${NC}        http://localhost:5173"
echo ""
echo -e "${GREEN}📊 Health Checks:${NC}"
echo -e "${BLUE}• API Gateway:${NC}     http://localhost:3000/health"
echo -e "${BLUE}• Core Server:${NC}     http://localhost:3001/health"
echo -e "${BLUE}• CRM Service:${NC}     http://localhost:3002/health"
echo -e "${BLUE}• Auth Service:${NC}    http://localhost:3003/health"
echo ""
echo -e "${GREEN}📁 Logs Location:${NC}   ./logs/"
echo -e "${GREEN}📁 PIDs Location:${NC}    ./pids/"
echo ""
echo -e "${YELLOW}💡 To stop all services, run: ./scripts/stop-microservices.sh${NC}"
echo -e "${YELLOW}💡 To monitor logs, run: tail -f logs/[service-name].log${NC}"
echo ""
echo -e "${GREEN}✨ Platform is ready for development!${NC}"