# Technology Stack Documentation - Codex Metatron Platform

## Project Classification: Complex AI SAAS

**Decision Rationale**: Multi-tenant platform managing 1000+ client applications requires sophisticated architecture with microservices, real-time monitoring, and advanced database management. The scale and complexity necessitate the Complex AI SAAS approach.

## Frontend Technology Stack

### Admin Interface (CDXPharaoh)
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Build Tool**: Turbo (Next.js built-in)
- **Styling**: TailwindCSS with Sacred Geometry principles
- **State Management**: React Context + SWR for data fetching
- **UI Components**: Headless UI + custom components
- **Icons**: Lucide React

### Client Applications Template
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Build Tool**: Turbo
- **Styling**: TailwindCSS
- **State Management**: React Context
- **Authentication**: NextAuth.js

## Backend Technology Stack

### Core Architecture
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Architecture Pattern**: Modular Monolith → Microservices
- **API Design**: RESTful APIs with OpenAPI documentation

### Database Strategy
- **Primary Database**: PostgreSQL 15+
- **Hosting**: Neon (managed PostgreSQL)
- **Connection**: Connection pooling with pg-pool
- **Schema Management**: Direct SQL migrations
- **Isolation**: Master DB + tenant-specific DBs

### Authentication & Security
- **Authentication**: JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Password Hashing**: bcrypt
- **API Security**: Helmet.js, CORS, rate limiting
- **Encryption**: HTTPS everywhere, encrypted connections

### Monitoring & Observability
- **Health Checks**: Custom health check endpoints
- **Logging**: Console logging with structured format
- **Metrics**: Basic response time and error tracking
- **Real-time Updates**: HTTP polling (5-second intervals)

## Microservices Architecture

### Service Breakdown
1. **Core Server** (Port 3000)
   - Tenant routing and API gateway
   - Authentication and authorization
   - Health monitoring coordination

2. **Auth Service** (Port 3001)
   - User authentication
   - Token management
   - Permission validation

3. **Billing Service** (Port 3002)
   - Usage tracking
   - Payment processing
   - Subscription management

4. **Subscription Service** (Port 3003)
   - Plan management
   - Feature flags
   - Tier enforcement

5. **CRM Service** (Port 3004)
   - Customer relationship management
   - Contact management
   - Deal tracking

6. **Client Service** (Port 3005)
   - Client data management
   - Profile management
   - Data import/export

7. **Admin Service** (Port 3006)
   - Admin user management
   - System configuration
   - Audit logging

### Service Communication
- **Pattern**: HTTP REST APIs
- **Authentication**: Service-to-service JWT tokens
- **Error Handling**: Standardized error responses
- **Timeout**: 30-second request timeouts

## Development Environment

### Local Development
- **Environment**: Local development with Docker Compose
- **Database**: Local PostgreSQL or Neon remote
- **Process Management**: Nodemon for development
- **Hot Reload**: TypeScript compilation with ts-node

### Production Environment
- **Infrastructure**: VPS (DigitalOcean/Hetzner)
- **Process Management**: PM2 for Node.js processes
- **Load Balancing**: Nginx reverse proxy
- **SSL**: Let's Encrypt certificates
- **Database**: Neon PostgreSQL (managed)

## Package Management

### Core Dependencies
```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "pg": "^8.11.0",
  "@neondatabase/serverless": "^0.9.0",
  "dotenv": "^16.0.0",
  "compression": "^1.7.4",
  "morgan": "^1.10.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.0.0",
  "ts-node": "^10.9.0",
  "nodemon": "^3.0.0",
  "@types/node": "^20.0.0",
  "@types/express": "^4.17.0",
  "@types/cors": "^2.8.0",
  "@types/jsonwebtoken": "^9.0.0",
  "@types/bcrypt": "^5.0.0",
  "@types/pg": "^8.10.0"
}
```

## API Design Standards

### Request/Response Format
- **Content-Type**: application/json
- **Authentication**: Bearer token in Authorization header
- **Tenant Context**: X-API-Key header for tenant identification
- **Error Format**: Standardized error objects with codes

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

### API Versioning
- **Strategy**: URL versioning (/api/v1/)
- **Backward Compatibility**: Maintain previous versions
- **Deprecation**: 6-month deprecation notice

## Database Design

### Master Database Tables
- **tenants**: Tenant information and API keys
- **admins**: Admin users with role-based access
- **services**: Service health and configuration
- **audit_log**: System audit trail

### Tenant Database Tables
- **users**: Tenant-specific users
- **clients**: Customer/client data
- **products**: Product catalog
- **subscriptions**: Subscription management
- **content**: Content management
- **activities**: CRM activities

## Technology Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| July 10, 2025 | Next.js for admin interface | Better SSR, built-in optimization, great TypeScript support |
| July 10, 2025 | Express.js for API server | Lightweight, flexible, extensive ecosystem |
| July 10, 2025 | PostgreSQL with Neon | Managed service, excellent performance, JSONB support |
| July 10, 2025 | Modular monolith first | Faster development, easier debugging, can extract later |
| July 10, 2025 | JWT authentication | Stateless, scalable, industry standard |
| July 10, 2025 | TailwindCSS | Utility-first, excellent performance, great DX |
| July 10, 2025 | TypeScript everywhere | Type safety, better tooling, reduced runtime errors |
| July 10, 2025 | Nx monorepo | Code sharing, consistent tooling, scalable structure |

## Deployment Pipeline

### MVP Deployment
1. **Build**: TypeScript compilation
2. **Test**: Unit tests with Jest
3. **Deploy**: rsync to VPS
4. **Process**: PM2 restart
5. **Health Check**: Automated health verification

### Future CI/CD
- **Version Control**: Git with feature branches
- **CI**: GitHub Actions
- **Testing**: Automated test suite
- **Deployment**: Blue-green deployment
- **Monitoring**: Automated rollback on failure

## Performance Targets

### Response Times
- **API Endpoints**: < 500ms
- **Database Queries**: < 100ms
- **Page Load**: < 2 seconds
- **Service Health Checks**: < 1 second

### Scalability Targets
- **Concurrent Users**: 10,000+ per tenant
- **Total Tenants**: 1,000+
- **Database Connections**: 100+ per service
- **Request Throughput**: 1,000+ requests/second

## Security Implementation

### Data Protection
- **Encryption in Transit**: HTTPS/TLS 1.3
- **Encryption at Rest**: Database encryption
- **API Security**: Rate limiting, input validation
- **Secret Management**: Environment variables

### Access Control
- **Authentication**: JWT with expiration
- **Authorization**: Role-based permissions
- **Tenant Isolation**: Strict data separation
- **Admin Access**: Multi-factor authentication (future)

## Monitoring Strategy

### Health Monitoring
- **Endpoint**: /health for each service
- **Metrics**: Response time, error rate, uptime
- **Alerting**: Console warnings for failures
- **Dashboard**: Real-time status in CDXPharaoh

### Error Tracking
- **Logging**: Structured console logging
- **Error Handling**: Graceful degradation
- **Monitoring**: Manual error review
- **Alerts**: Critical error notifications

## Last Updated: July 10, 2025