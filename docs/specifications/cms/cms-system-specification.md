# CMS System Specification

## Overview
The Codex Metatron CMS is a multi-tenant content management system designed to provide comprehensive content management capabilities with enterprise-grade features, role-based access control, and seamless SDK integration.

## Core Features

### 1. Content Management
- **Content Types**: Dynamic content type creation and management
- **Version Control**: Full content versioning with rollback capabilities
- **Workflow Management**: Content approval workflows with customizable stages
- **Media Management**: Asset library with CDN integration
- **Localization**: Multi-language content support
- **SEO Management**: Built-in SEO tools and metadata management
- **Content Scheduling**: Time-based content publishing and expiration

### 2. User Roles and Permissions

#### Role Hierarchy
```
Super Admin (Platform Level)
├── Organization Admin
├── Content Admin
│   ├── Editor
│   ├── Author
│   └── Contributor
└── Viewer
```

#### Permission Matrix

| Feature | Super Admin | Org Admin | Content Admin | Editor | Author | Contributor | Viewer |
|---------|------------|-----------|---------------|--------|--------|-------------|--------|
| View Content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Own Content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Any Content | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete Content | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Publish Content | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage Users | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Settings | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Access Analytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

### 3. Content Types Structure

#### Base Content Type Schema
```typescript
interface BaseContentType {
  id: string;
  tenantId: string;
  type: string;
  title: string;
  slug: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  metadata: ContentMetadata;
  fields: ContentField[];
}

interface ContentMetadata {
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  tags: string[];
  categories: string[];
  customMeta: Record<string, any>;
}

interface ContentField {
  name: string;
  type: FieldType;
  value: any;
  validation?: FieldValidation;
  localized?: boolean;
}
```

#### Supported Field Types
- Text (single line, multi-line, rich text)
- Number (integer, decimal)
- Boolean
- Date/DateTime
- Media (image, video, file)
- Reference (to other content)
- Array (repeatable fields)
- Object (nested fields)
- Location (geo coordinates)
- Color
- URL
- Email

## API Endpoints

### Authentication & Authorization
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

### Content Management
```
# Content Types
GET    /api/v1/content-types
POST   /api/v1/content-types
GET    /api/v1/content-types/:id
PUT    /api/v1/content-types/:id
DELETE /api/v1/content-types/:id

# Content Items
GET    /api/v1/content
POST   /api/v1/content
GET    /api/v1/content/:id
PUT    /api/v1/content/:id
DELETE /api/v1/content/:id
POST   /api/v1/content/:id/publish
POST   /api/v1/content/:id/unpublish
GET    /api/v1/content/:id/versions
POST   /api/v1/content/:id/revert/:version

# Bulk Operations
POST   /api/v1/content/bulk/create
PUT    /api/v1/content/bulk/update
DELETE /api/v1/content/bulk/delete
POST   /api/v1/content/bulk/publish
```

### Media Management
```
GET    /api/v1/media
POST   /api/v1/media/upload
GET    /api/v1/media/:id
PUT    /api/v1/media/:id
DELETE /api/v1/media/:id
POST   /api/v1/media/bulk/upload
```

### User Management
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
PUT    /api/v1/users/:id/role
```

### Workflow Management
```
GET    /api/v1/workflows
POST   /api/v1/workflows
GET    /api/v1/workflows/:id
PUT    /api/v1/workflows/:id
DELETE /api/v1/workflows/:id
POST   /api/v1/workflows/:id/approve
POST   /api/v1/workflows/:id/reject
```

### Analytics & Reporting
```
GET    /api/v1/analytics/content/views
GET    /api/v1/analytics/content/engagement
GET    /api/v1/analytics/users/activity
GET    /api/v1/analytics/performance
```

## Data Models

### Content Model
```sql
-- Content Types Table
CREATE TABLE content_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Content Items Table
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    content_type_id UUID NOT NULL REFERENCES content_types(id),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, content_type_id, slug, version)
);

-- Content Versions Table
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID NOT NULL REFERENCES content_items(id),
    version INTEGER NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_summary TEXT
);

-- Media Assets Table
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    metadata JSONB DEFAULT '{}',
    folder_path VARCHAR(500) DEFAULT '/',
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflows Table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    content_item_id UUID NOT NULL REFERENCES content_items(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    current_stage VARCHAR(100),
    stages JSONB NOT NULL,
    assignee_id UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Audit Log Table
CREATE TABLE cms_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## SDK Integration

### TypeScript SDK Example
```typescript
import { CodexMetatronCMS } from '@codex-metatron/cms-sdk';

// Initialize CMS
const cms = new CodexMetatronCMS({
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id',
  baseUrl: 'https://api.codexmetatron.com'
});

// Content Operations
const content = await cms.content.create({
  type: 'article',
  title: 'My First Article',
  fields: {
    body: 'Article content...',
    author: 'John Doe',
    tags: ['technology', 'tutorial']
  }
});

// Query Content
const articles = await cms.content.find({
  type: 'article',
  status: 'published',
  limit: 10,
  orderBy: 'publishedAt',
  order: 'desc'
});

// Media Upload
const asset = await cms.media.upload({
  file: fileBlob,
  folder: '/images/articles',
  metadata: {
    alt: 'Article hero image'
  }
});
```

## Security Considerations

### Authentication
- JWT-based authentication with refresh tokens
- OAuth2 support for enterprise SSO
- API key authentication for SDK access
- IP whitelisting for API access

### Data Security
- Encryption at rest for sensitive content
- TLS 1.3 for all API communications
- Field-level encryption for PII data
- Regular security audits and penetration testing

### Access Control
- Row-level security in database
- Tenant isolation at all levels
- API rate limiting per tenant/user
- Content access logs and audit trails

## Performance Requirements

### API Response Times
- GET requests: < 100ms (p95)
- POST/PUT requests: < 200ms (p95)
- Bulk operations: < 1s for 100 items
- Search queries: < 150ms (p95)

### Scalability
- Support 10,000+ concurrent users
- Handle 1M+ content items per tenant
- 99.9% uptime SLA
- Auto-scaling based on load

### Caching Strategy
- CDN for published content
- Redis for API responses
- Database query caching
- Edge caching for static assets

## Integration Points

### Webhooks
- Content lifecycle events
- User activity events
- Workflow status changes
- Custom event triggers

### Third-party Integrations
- Slack/Teams notifications
- Email service providers
- Analytics platforms
- Translation services
- AI content generation

## Compliance & Standards

### Data Privacy
- GDPR compliance
- CCPA compliance
- Right to deletion
- Data portability

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- API accessibility features

### Content Standards
- OpenAPI 3.0 specification
- JSON:API format support
- GraphQL endpoint option
- REST best practices