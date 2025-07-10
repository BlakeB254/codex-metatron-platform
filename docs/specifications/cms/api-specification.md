# CMS API Specification

## API Overview
RESTful API following OpenAPI 3.0 specification with JSON:API format support.

## Base URL
```
Production: https://api.codexmetatron.com/cms/v1
Staging: https://api-staging.codexmetatron.com/cms/v1
Development: http://localhost:3000/cms/v1
```

## Authentication

### API Key Authentication
```http
GET /api/v1/content
Authorization: Bearer YOUR_API_KEY
X-Tenant-ID: YOUR_TENANT_ID
```

### JWT Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "tenantId": "tenant_uuid"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "role": "editor"
  }
}
```

## Content Type Management

### Create Content Type
```http
POST /api/v1/content-types
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Article",
  "slug": "article",
  "description": "Blog article content type",
  "schema": {
    "fields": [
      {
        "name": "title",
        "type": "text",
        "required": true,
        "validation": {
          "minLength": 10,
          "maxLength": 200
        }
      },
      {
        "name": "body",
        "type": "richtext",
        "required": true
      },
      {
        "name": "author",
        "type": "reference",
        "referenceType": "user",
        "required": true
      },
      {
        "name": "tags",
        "type": "array",
        "itemType": "text"
      },
      {
        "name": "publishDate",
        "type": "datetime",
        "required": true
      },
      {
        "name": "featuredImage",
        "type": "media",
        "validation": {
          "mimeTypes": ["image/jpeg", "image/png", "image/webp"],
          "maxSize": 5242880
        }
      }
    ]
  },
  "settings": {
    "versionable": true,
    "draftable": true,
    "localizable": true,
    "searchable": true
  }
}

Response: 201 Created
{
  "data": {
    "id": "content_type_uuid",
    "type": "content-type",
    "attributes": {
      "name": "Article",
      "slug": "article",
      "description": "Blog article content type",
      "schema": {...},
      "settings": {...},
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    }
  }
}
```

### List Content Types
```http
GET /api/v1/content-types?page[size]=20&page[number]=1
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "data": [
    {
      "id": "content_type_uuid",
      "type": "content-type",
      "attributes": {
        "name": "Article",
        "slug": "article",
        "description": "Blog article content type",
        "itemCount": 150
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "pageCount": 3,
      "total": 45
    }
  }
}
```

## Content Management

### Create Content
```http
POST /api/v1/content
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "contentType": "article",
  "data": {
    "title": "Getting Started with Codex Metatron",
    "body": "<p>Rich text content...</p>",
    "author": "user_uuid",
    "tags": ["tutorial", "getting-started"],
    "publishDate": "2024-01-10T10:00:00Z",
    "featuredImage": "media_asset_uuid"
  },
  "metadata": {
    "seo": {
      "title": "Getting Started Guide - Codex Metatron",
      "description": "Learn how to get started with Codex Metatron platform",
      "keywords": ["codex", "metatron", "tutorial"]
    }
  }
}

Response: 201 Created
{
  "data": {
    "id": "content_uuid",
    "type": "content",
    "attributes": {
      "contentType": "article",
      "title": "Getting Started with Codex Metatron",
      "slug": "getting-started-with-codex-metatron",
      "status": "draft",
      "version": 1,
      "data": {...},
      "metadata": {...},
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z"
    },
    "relationships": {
      "author": {
        "data": { "type": "user", "id": "user_uuid" }
      },
      "contentType": {
        "data": { "type": "content-type", "id": "content_type_uuid" }
      }
    }
  }
}
```

### Query Content
```http
GET /api/v1/content?filter[contentType]=article&filter[status]=published&sort=-publishedAt&include=author,media
Authorization: Bearer YOUR_TOKEN

Response: 200 OK
{
  "data": [
    {
      "id": "content_uuid",
      "type": "content",
      "attributes": {
        "title": "Getting Started with Codex Metatron",
        "slug": "getting-started-with-codex-metatron",
        "status": "published",
        "excerpt": "Learn the basics...",
        "publishedAt": "2024-01-10T10:00:00Z"
      },
      "relationships": {
        "author": {
          "data": { "type": "user", "id": "user_uuid" }
        }
      }
    }
  ],
  "included": [
    {
      "type": "user",
      "id": "user_uuid",
      "attributes": {
        "name": "John Doe",
        "avatar": "avatar_url"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "pageCount": 5,
      "total": 95
    }
  }
}
```

### Advanced Search
```http
POST /api/v1/content/search
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "query": "codex metatron tutorial",
  "filters": {
    "contentType": ["article", "documentation"],
    "status": "published",
    "dateRange": {
      "field": "publishedAt",
      "from": "2024-01-01",
      "to": "2024-12-31"
    },
    "tags": {
      "include": ["tutorial"],
      "exclude": ["deprecated"]
    }
  },
  "facets": ["contentType", "tags", "author"],
  "highlight": {
    "fields": ["title", "body"],
    "preTag": "<mark>",
    "postTag": "</mark>"
  },
  "pagination": {
    "page": 1,
    "size": 20
  }
}

Response: 200 OK
{
  "data": [...],
  "meta": {
    "query": "codex metatron tutorial",
    "took": 45,
    "total": 23,
    "facets": {
      "contentType": {
        "article": 15,
        "documentation": 8
      },
      "tags": {
        "tutorial": 23,
        "beginner": 12,
        "advanced": 5
      }
    }
  }
}
```

## Media Management

### Upload Media
```http
POST /api/v1/media/upload
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

FormData:
- file: [binary]
- folder: /images/articles
- metadata[alt]: Article hero image
- metadata[caption]: Codex Metatron Dashboard

Response: 201 Created
{
  "data": {
    "id": "media_uuid",
    "type": "media",
    "attributes": {
      "filename": "hero-image-12345.jpg",
      "originalName": "dashboard-screenshot.jpg",
      "mimeType": "image/jpeg",
      "size": 245760,
      "url": "https://cdn.codexmetatron.com/media/hero-image-12345.jpg",
      "thumbnailUrl": "https://cdn.codexmetatron.com/media/thumb-hero-image-12345.jpg",
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "metadata": {
        "alt": "Article hero image",
        "caption": "Codex Metatron Dashboard"
      }
    }
  }
}
```

### Media Transformations
```http
GET /api/v1/media/{id}/transform?w=800&h=600&fit=cover&q=85
Authorization: Bearer YOUR_TOKEN

Response: 302 Redirect
Location: https://cdn.codexmetatron.com/media/transformed/...
```

## Workflow Management

### Create Workflow
```http
POST /api/v1/workflows
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "contentId": "content_uuid",
  "type": "approval",
  "stages": [
    {
      "name": "editorial_review",
      "assignee": "editor_uuid",
      "dueDate": "2024-01-15T10:00:00Z"
    },
    {
      "name": "legal_review",
      "assignee": "legal_team_uuid",
      "dueDate": "2024-01-16T10:00:00Z"
    },
    {
      "name": "final_approval",
      "assignee": "admin_uuid",
      "dueDate": "2024-01-17T10:00:00Z"
    }
  ],
  "metadata": {
    "priority": "high",
    "notes": "Urgent article for product launch"
  }
}

Response: 201 Created
{
  "data": {
    "id": "workflow_uuid",
    "type": "workflow",
    "attributes": {
      "status": "pending",
      "currentStage": "editorial_review",
      "stages": [...],
      "createdAt": "2024-01-10T10:00:00Z"
    }
  }
}
```

## Webhooks

### Register Webhook
```http
POST /api/v1/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "url": "https://your-app.com/webhooks/cms",
  "events": [
    "content.created",
    "content.updated",
    "content.published",
    "content.deleted"
  ],
  "headers": {
    "X-Webhook-Secret": "your_secret"
  },
  "active": true
}

Response: 201 Created
{
  "data": {
    "id": "webhook_uuid",
    "type": "webhook",
    "attributes": {
      "url": "https://your-app.com/webhooks/cms",
      "events": [...],
      "active": true,
      "secret": "generated_secret_for_validation"
    }
  }
}
```

### Webhook Payload
```json
{
  "id": "event_uuid",
  "type": "content.published",
  "timestamp": "2024-01-10T10:00:00Z",
  "data": {
    "content": {
      "id": "content_uuid",
      "type": "article",
      "title": "New Article Published"
    },
    "user": {
      "id": "user_uuid",
      "email": "editor@example.com"
    }
  },
  "signature": "sha256=..."
}
```

## Error Handling

### Error Response Format
```json
{
  "errors": [
    {
      "status": "422",
      "code": "VALIDATION_ERROR",
      "title": "Validation Failed",
      "detail": "The title field must be at least 10 characters long",
      "source": {
        "pointer": "/data/attributes/title"
      }
    }
  ]
}
```

### Common Error Codes
- 400 Bad Request: `INVALID_REQUEST`
- 401 Unauthorized: `UNAUTHORIZED`
- 403 Forbidden: `FORBIDDEN`
- 404 Not Found: `NOT_FOUND`
- 409 Conflict: `CONFLICT`
- 422 Unprocessable Entity: `VALIDATION_ERROR`
- 429 Too Many Requests: `RATE_LIMIT_EXCEEDED`
- 500 Internal Server Error: `INTERNAL_ERROR`

## Rate Limiting

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1672531200
```

### Limits by Plan
- Free: 1,000 requests/hour
- Starter: 10,000 requests/hour
- Professional: 50,000 requests/hour
- Enterprise: Custom limits

## SDK Examples

### JavaScript/TypeScript
```typescript
import { CMS } from '@codex-metatron/cms-sdk';

const cms = new CMS({
  apiKey: process.env.CMS_API_KEY,
  tenantId: process.env.TENANT_ID
});

// Create content
const article = await cms.content.create({
  type: 'article',
  data: {
    title: 'My Article',
    body: 'Content...'
  }
});

// Query with filters
const articles = await cms.content.find({
  contentType: 'article',
  filters: {
    status: 'published',
    tags: { $in: ['tutorial'] }
  },
  sort: '-publishedAt',
  limit: 10
});

// Full-text search
const results = await cms.search({
  query: 'codex metatron',
  types: ['article', 'documentation'],
  highlight: true
});
```

### Python
```python
from codex_metatron import CMS

cms = CMS(
    api_key=os.environ['CMS_API_KEY'],
    tenant_id=os.environ['TENANT_ID']
)

# Create content
article = cms.content.create(
    type='article',
    data={
        'title': 'My Article',
        'body': 'Content...'
    }
)

# Query with filters
articles = cms.content.find(
    content_type='article',
    filters={'status': 'published'},
    sort='-published_at',
    limit=10
)
```