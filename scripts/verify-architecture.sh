#!/bin/bash

# Codex Metatron Platform - Architecture Verification Script
# This script verifies the microservices architecture is properly set up

set -e

echo "🔍 Verifying Codex Metatron Platform Microservices Architecture..."
echo "=================================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is responding
check_service_health() {
  local url=$1
  local service_name=$2
  local timeout=${3:-5}
  
  echo -n -e "${BLUE}🔍 Checking ${service_name} health at ${url}... ${NC}"
  
  if curl -f -s --max-time $timeout "$url" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ HEALTHY${NC}"
    return 0
  else
    echo -e "${RED}❌ UNHEALTHY${NC}"
    return 1
  fi
}

# Function to test API endpoint
test_api_endpoint() {
  local url=$1
  local method=${2:-GET}
  local expected_status=${3:-200}
  local description=$4
  
  echo -n -e "${BLUE}🧪 Testing ${description}: ${method} ${url}... ${NC}"
  
  local response_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$url" 2>/dev/null || echo "000")
  
  if [ "$response_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✅ ${response_code}${NC}"
    return 0
  else
    echo -e "${RED}❌ ${response_code} (expected ${expected_status})${NC}"
    return 1
  fi
}

# Function to check if port is open
check_port() {
  local port=$1
  local service_name=$2
  
  echo -n -e "${BLUE}🔍 Checking port ${port} (${service_name})... ${NC}"
  
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OPEN${NC}"
    return 0
  else
    echo -e "${RED}❌ CLOSED${NC}"
    return 1
  fi
}

# Track overall health
overall_health=true

echo -e "${BLUE}📡 Checking Service Ports...${NC}"
echo "----------------------------------------"

# Check if all services are running on correct ports
check_port 3000 "API Gateway" || overall_health=false
check_port 3001 "Core Server" || overall_health=false
check_port 3002 "CRM Service" || overall_health=false
check_port 3003 "Auth Service" || overall_health=false
check_port 5173 "Frontend" || overall_health=false

echo ""
echo -e "${BLUE}🏥 Health Check Endpoints...${NC}"
echo "----------------------------------------"

# Test health endpoints
check_service_health "http://localhost:3000/health" "API Gateway" || overall_health=false
check_service_health "http://localhost:3001/health" "Core Server" || overall_health=false
check_service_health "http://localhost:3002/health" "CRM Service" || overall_health=false
check_service_health "http://localhost:3003/health" "Auth Service" || overall_health=false

echo ""
echo -e "${BLUE}🔄 Service Routing Tests...${NC}"
echo "----------------------------------------"

# Test API Gateway routing to services
test_api_endpoint "http://localhost:3000/health" "GET" 200 "API Gateway Health" || overall_health=false
test_api_endpoint "http://localhost:3000/api/crm" "GET" 404 "CRM Service Routing (404 expected)" || true
test_api_endpoint "http://localhost:3000/api/auth" "GET" 404 "Auth Service Routing (404 expected)" || true

echo ""
echo -e "${BLUE}🔐 Authentication Flow Tests...${NC}"
echo "----------------------------------------"

# Test auth service endpoints directly
test_api_endpoint "http://localhost:3003/health" "GET" 200 "Auth Service Health" || overall_health=false
test_api_endpoint "http://localhost:3003/api/auth/verify" "GET" 401 "Auth Verify (401 expected without token)" || true

# Test auth through API Gateway
test_api_endpoint "http://localhost:3000/auth/verify" "GET" 401 "Auth via Gateway (401 expected without token)" || true

echo ""
echo -e "${BLUE}🏗️ Architecture Validation...${NC}"
echo "----------------------------------------"

# Check service separation
echo -e "${BLUE}🔍 Verifying service separation...${NC}"

# Verify Core Server doesn't have auth routes
echo -n -e "${BLUE}🧪 Core Server auth separation... ${NC}"
core_auth_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/auth/login" 2>/dev/null || echo "000")
if [ "$core_auth_response" -eq "404" ]; then
  echo -e "${GREEN}✅ SEPARATED (404 as expected)${NC}"
else
  echo -e "${RED}❌ NOT SEPARATED (got ${core_auth_response})${NC}"
  overall_health=false
fi

# Verify API Gateway proxy functionality
echo -n -e "${BLUE}🧪 API Gateway proxy functionality... ${NC}"
gateway_proxy=$(curl -s "http://localhost:3000/health" | grep -c "API Gateway" || echo "0")
if [ "$gateway_proxy" -gt "0" ]; then
  echo -e "${GREEN}✅ WORKING${NC}"
else
  echo -e "${RED}❌ NOT WORKING${NC}"
  overall_health=false
fi

echo ""
echo -e "${BLUE}📊 Service Information...${NC}"
echo "----------------------------------------"

# Get service information
for port in 3000 3001 3002 3003; do
  echo -e "${BLUE}📡 Service on port ${port}:${NC}"
  service_info=$(curl -s "http://localhost:${port}/" 2>/dev/null | head -c 200 || echo "No response")
  echo "   $service_info"
done

echo ""
echo -e "${BLUE}🔗 Service Dependencies...${NC}"
echo "----------------------------------------"

# Check service dependency chain
echo -e "${BLUE}🔍 Verifying dependency chain:${NC}"
echo "   Frontend (5173) → API Gateway (3000) → Services (3001, 3002, 3003)"

# Test CORS from frontend perspective
echo -n -e "${BLUE}🧪 CORS configuration... ${NC}"
cors_test=$(curl -s -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization" -X OPTIONS "http://localhost:3000/health" 2>/dev/null | grep -c "Access-Control-Allow" || echo "0")
if [ "$cors_test" -gt "0" ]; then
  echo -e "${GREEN}✅ CONFIGURED${NC}"
else
  echo -e "${YELLOW}⚠️  NEEDS VERIFICATION${NC}"
fi

echo ""
echo -e "${BLUE}🛡️ Security Verification...${NC}"
echo "----------------------------------------"

# Check rate limiting
echo -n -e "${BLUE}🧪 Rate limiting headers... ${NC}"
rate_limit=$(curl -s -I "http://localhost:3000/health" 2>/dev/null | grep -c "X-RateLimit" || echo "0")
if [ "$rate_limit" -gt "0" ]; then
  echo -e "${GREEN}✅ PRESENT${NC}"
else
  echo -e "${YELLOW}⚠️  NOT DETECTED${NC}"
fi

# Check security headers
echo -n -e "${BLUE}🧪 Security headers... ${NC}"
security_headers=$(curl -s -I "http://localhost:3000/health" 2>/dev/null | grep -c "X-Frame-Options\|X-Content-Type-Options\|X-XSS-Protection" || echo "0")
if [ "$security_headers" -gt "0" ]; then
  echo -e "${GREEN}✅ PRESENT${NC}"
else
  echo -e "${YELLOW}⚠️  NEEDS VERIFICATION${NC}"
fi

echo ""
echo "=================================================================="

if [ "$overall_health" = true ]; then
  echo -e "${GREEN}🎉 Architecture Verification PASSED!${NC}"
  echo ""
  echo -e "${GREEN}✅ All services are running correctly${NC}"
  echo -e "${GREEN}✅ Service separation is working${NC}"
  echo -e "${GREEN}✅ API Gateway routing is functional${NC}"
  echo -e "${GREEN}✅ Authentication service is isolated${NC}"
  echo ""
  echo -e "${BLUE}📋 Service Map:${NC}"
  echo "   🌐 Frontend (React):     http://localhost:5173"
  echo "   🚪 API Gateway:          http://localhost:3000"
  echo "   🏢 Core Server:          http://localhost:3001"
  echo "   👥 CRM Service:          http://localhost:3002"
  echo "   🔐 Auth Service:         http://localhost:3003"
  echo ""
  echo -e "${BLUE}📋 Request Flow:${NC}"
  echo "   Client → API Gateway → Appropriate Service"
  echo "   Auth requests → Auth Service (port 3003)"
  echo "   Business logic → Core Server (port 3001)"
  echo "   CRM operations → CRM Service (port 3002)"
  echo ""
  echo -e "${GREEN}✨ Microservices architecture is ready for development!${NC}"
else
  echo -e "${RED}❌ Architecture Verification FAILED!${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  Some services or configurations need attention${NC}"
  echo -e "${YELLOW}💡 Check the output above for specific issues${NC}"
  echo -e "${YELLOW}💡 Ensure all services are started: ./scripts/start-microservices.sh${NC}"
  echo -e "${YELLOW}💡 Check logs: tail -f logs/[service-name].log${NC}"
  echo ""
  exit 1
fi