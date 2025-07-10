# Claude Code Development Context

This directory contains Claude Code's development context and memory for the Codex Metatron Platform project.

## 🤖 For Claude Code

This documentation is specifically for Claude Code to understand the project context, architecture decisions, and development state.

### Project Context Files
- `project/PRD.md` - Product requirements and business context
- `project/tech-stack-doc.md` - Technology decisions and rationale  
- `project/cms-architecture.md` - CMS system architecture
- `development/` - Development guidelines and patterns
- `security/` - Security implementation details
- `deployment/` - Deployment configurations and procedures
- `integration/` - Integration patterns and API documentation

### Session Memory
- `SESSION_SUMMARY.md` - Latest development session summary
- `CURRENT_STATUS.md` - Current project state and active tasks
- `FINAL_STATUS.md` - Completed tasks and achievements

### Architecture Context
- `MULTI_DATABASE_ARCHITECTURE.md` - Database design and multi-tenant architecture

## 👨‍💻 For Human Developers

**For human-readable documentation, guides, and tutorials, see the [`docs/`](../docs/) directory instead.**

## Quick Start for Claude Code
1. Read this file for immediate context
2. Check `project/` for business requirements and tech decisions
3. Review `development/` for coding patterns and component guidelines
4. See `integration/` for API and authentication patterns
5. Check session files for current development state

## Project Type: Complex AI SAAS
- [x] **Local Project** (Personal usage, full control)
- [ ] **Replit Project** (Not applicable for this scale)

## Critical Rules for Multi-Tenant Platform
- **SECURITY FIRST**: All tenant data must be isolated
- **API KEY VALIDATION**: Every request must validate tenant context
- **DATABASE ISOLATION**: Each tenant gets separate database or strict tenant_id filtering
- **SERVICE HEALTH**: All services must expose /health endpoints
- **MONITORING**: Real-time service status tracking required

## Current Development Context
- **Working On**: ✅ **COMPLETED** - Multi-database architecture implementation (July 10, 2025)
- **Last Session**: Implemented federated database architecture with service isolation, dual authentication system, and complete testing
- **Session Accomplishments**:
  1. ✅ Multi-database architecture (CDX-DB + 5 service schemas)
  2. ✅ Dual authentication system (superadmin via CDX-DB, users via AUTH-DB)
  3. ✅ Service isolation with database connection factory
  4. ✅ Real-time data aggregation and synchronization
  5. ✅ Complete testing and validation of all systems
- **Next Session Priorities**: 
  1. Implement CRM Service using crm_db schema
  2. Implement CMS Service using cms_db schema  
  3. Implement Billing Service using billing_db schema
  4. Implement Analytics Service using analytics_db schema
  5. Fix API Gateway proxy timeout issue
- **Blockers**: None - Core architecture complete and operational

## NEW: Integration Documentation (COMPLETED)
- **`.claude/integration/permission-system.md`**: Complete three-tier permission system (SUPERADMIN, ADMIN, CLIENT)
- **`.claude/integration/integration-levels.md`**: API integration guide for each user level
- **`.claude/integration/api-authentication.md`**: JWT, API key, OAuth2 authentication flows
- **`.claude/integration/sdk-usage-guide.md`**: SDK usage examples for TypeScript, Python, Go
- **`.claude/integration/examples-by-role.md`**: Real-world integration examples by role

## Architecture Summary
- **Frontend**: React + TypeScript + TailwindCSS + Vite (Port 5173) ✅ RUNNING
- **Backend**: Node.js + Express + TypeScript microservices ✅ OPERATIONAL
- **Database**: PostgreSQL (Neon) with federated multi-database architecture ✅ IMPLEMENTED
- **Authentication**: Dual-DB system (CDX-DB for superadmin, AUTH-DB for tenant users) ✅ WORKING
- **Services**: 
  - ✅ Core Server (3001): HEALTHY
  - ✅ Auth Service (3003): HEALTHY + Multi-DB  
  - ✅ API Gateway (3000): HEALTHY
  - 🔄 CRM Service (3004): Schema ready
  - 🔄 CMS Service (3005): Schema ready
  - 🔄 Billing Service (3006): Schema ready
  - 🔄 Analytics Service (3007): Schema ready

## Database Architecture (IMPLEMENTED) ✅
- **Master DB**: CDX-DB (superadmin access, cross-service aggregation) 
- **Service Databases**: 5 isolated schemas (auth_db, crm_db, cms_db, billing_db, analytics_db)
- **Connection Factory**: Service-specific database connections with automatic schema switching
- **Real-time Sync**: Service events automatically sync to CDX-DB for aggregation
- **Authentication**: 
  - Superadmin: `test/test123` (via CDX-DB)
  - Demo Users: `john.doe@demo.com/demo123`, `jane.smith@demo.com/demo123` (via AUTH-DB)
- **Documentation**: See `.claude/MULTI_DATABASE_ARCHITECTURE.md` for complete implementation details

## Target Scale
- **Tenants**: 1000+ client applications
- **Architecture**: Modular monolith first, then extract to microservices
- **Deployment**: Hetzner/DigitalOcean for core services
- **Client Apps**: Deployed to Replit for individual tenants

## Component Status
- **Available**: Nx workspace initialized
- **In Progress**: Documentation system setup
- **Needed**: Core server, CDXPharaoh dashboard, database schemas

## Critical 72-Hour Timeline
### Day 1 (Hours 0-24)
- [x] Set up monorepo structure
- [ ] Implement core server with tenant routing
- [ ] Create master database schema
- [ ] Basic auth with JWT
- [ ] Deploy to VPS

### Day 2 (Hours 24-48)
- [ ] Build CDXPharaoh dashboard
- [ ] Implement tenant CRUD operations
- [ ] Add service health monitoring
- [ ] Create client/product management endpoints
- [ ] Test with real data

### Day 3 (Hours 48-72)
- [ ] Client template creation
- [ ] Data import scripts
- [ ] Basic documentation
- [ ] Production deployment
- [ ] SSL setup
- [ ] Smoke testing

## Emergency Contacts
- **Technical Lead**: CodexMetatron
- **Product Owner**: CodexMetatron

## Last Updated: July 10, 2025