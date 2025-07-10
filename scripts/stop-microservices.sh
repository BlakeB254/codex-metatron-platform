#!/bin/bash

# Codex Metatron Platform - Stop Microservices Script
# This script stops all running microservices

set -e

echo "🛑 Stopping Codex Metatron Platform Microservices..."
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop a service by PID file
stop_service() {
  local service_name=$1
  local pid_file="pids/${service_name}.pid"
  
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if ps -p $pid > /dev/null 2>&1; then
      echo -e "${BLUE}🛑 Stopping ${service_name} (PID: $pid)...${NC}"
      kill $pid
      
      # Wait for process to stop
      local attempts=0
      while ps -p $pid > /dev/null 2>&1 && [ $attempts -lt 10 ]; do
        sleep 1
        attempts=$((attempts + 1))
      done
      
      if ps -p $pid > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Force killing ${service_name}...${NC}"
        kill -9 $pid
      fi
      
      echo -e "${GREEN}✅ ${service_name} stopped${NC}"
    else
      echo -e "${YELLOW}⚠️  ${service_name} not running (stale PID file)${NC}"
    fi
    rm -f "$pid_file"
  else
    echo -e "${YELLOW}⚠️  No PID file found for ${service_name}${NC}"
  fi
}

# Function to stop services by port
stop_by_port() {
  local port=$1
  local service_name=$2
  
  local pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo -e "${BLUE}🛑 Stopping ${service_name} on port ${port} (PID: $pid)...${NC}"
    kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
    echo -e "${GREEN}✅ ${service_name} stopped${NC}"
  else
    echo -e "${YELLOW}⚠️  No process found on port ${port} for ${service_name}${NC}"
  fi
}

# Create pids directory if it doesn't exist
mkdir -p pids

echo -e "${BLUE}🔍 Stopping services by PID files...${NC}"

# Stop services in reverse order
stop_service "frontend"
stop_service "api-gateway"
stop_service "crm-service"
stop_service "auth-service"
stop_service "core-server"

echo ""
echo -e "${BLUE}🔍 Checking for remaining processes on known ports...${NC}"

# Also stop any remaining processes on the known ports
stop_by_port 5173 "Frontend"
stop_by_port 3000 "API Gateway"
stop_by_port 3002 "CRM Service"
stop_by_port 3003 "Auth Service"
stop_by_port 3001 "Core Server"

# Stop any remaining Node.js processes that might be related
echo ""
echo -e "${BLUE}🔍 Checking for remaining Node.js processes...${NC}"

# Find and stop any remaining related processes
local node_processes=$(ps aux | grep -E "(tsx|node).*src/server" | grep -v grep | awk '{print $2}')
if [ ! -z "$node_processes" ]; then
  echo -e "${YELLOW}⚠️  Found remaining Node.js server processes, stopping them...${NC}"
  echo "$node_processes" | xargs kill 2>/dev/null || true
  sleep 2
  echo "$node_processes" | xargs kill -9 2>/dev/null || true
fi

# Stop any remaining Vite dev processes
local vite_processes=$(ps aux | grep -E "vite.*dev" | grep -v grep | awk '{print $2}')
if [ ! -z "$vite_processes" ]; then
  echo -e "${YELLOW}⚠️  Found remaining Vite processes, stopping them...${NC}"
  echo "$vite_processes" | xargs kill 2>/dev/null || true
  sleep 2
  echo "$vite_processes" | xargs kill -9 2>/dev/null || true
fi

echo ""
echo -e "${BLUE}🧹 Cleaning up...${NC}"

# Clean up PID files
rm -f pids/*.pid

# Rotate logs if they exist
if [ -d "logs" ]; then
  timestamp=$(date +%Y%m%d_%H%M%S)
  mkdir -p "logs/archive"
  
  for logfile in logs/*.log; do
    if [ -f "$logfile" ]; then
      basename=$(basename "$logfile" .log)
      mv "$logfile" "logs/archive/${basename}_${timestamp}.log"
      echo -e "${BLUE}📄 Archived log: ${basename}_${timestamp}.log${NC}"
    fi
  done
fi

echo ""
echo -e "${GREEN}🎉 All microservices stopped successfully!${NC}"
echo "=================================================="
echo -e "${GREEN}📋 Final Status Check:${NC}"

# Verify all services are stopped
services_stopped=true

for port in 3000 3001 3002 3003 5173; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}❌ Port $port is still in use${NC}"
    services_stopped=false
  else
    echo -e "${GREEN}✅ Port $port is free${NC}"
  fi
done

if [ "$services_stopped" = true ]; then
  echo ""
  echo -e "${GREEN}✨ All services stopped cleanly!${NC}"
  echo -e "${YELLOW}💡 To restart services, run: ./scripts/start-microservices.sh${NC}"
else
  echo ""
  echo -e "${YELLOW}⚠️  Some services may still be running. Check manually if needed.${NC}"
  echo -e "${YELLOW}💡 You can use 'lsof -i :PORT' to check specific ports${NC}"
fi

echo -e "${GREEN}📁 Logs archived to:${NC} logs/archive/"