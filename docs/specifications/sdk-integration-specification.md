# SDK Integration Specification

## Overview
The Codex Metatron Platform SDK provides unified access to CMS functionality and UI components, enabling rapid application development with consistent design patterns and seamless content management integration.

## SDK Architecture

### Multi-Package Structure
```
@codex-metatron/
├── cms-sdk          # CMS API client and utilities
├── ui               # Component library and design system
├── auth             # Authentication utilities
├── analytics        # Analytics and tracking
├── webhooks         # Webhook utilities
└── react-integration # React-specific integrations
```

## Installation & Setup

### Package Installation
```bash
# Core packages
npm install @codex-metatron/cms-sdk @codex-metatron/ui

# Optional packages
npm install @codex-metatron/auth @codex-metatron/analytics
npm install @codex-metatron/react-integration
```

### Basic Configuration
```typescript
// codex-config.ts
import { CodexConfig } from '@codex-metatron/cms-sdk';

export const config: CodexConfig = {
  apiUrl: process.env.CODEX_API_URL || 'https://api.codexmetatron.com',
  apiKey: process.env.CODEX_API_KEY!,
  tenantId: process.env.CODEX_TENANT_ID!,
  environment: process.env.NODE_ENV as 'development' | 'staging' | 'production',
  
  // Optional configurations
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    storage: 'memory', // 'memory' | 'redis' | 'localStorage'
  },
  
  retry: {
    attempts: 3,
    delay: 1000,
    exponentialBackoff: true,
  },
  
  logging: {
    level: 'info',
    destination: 'console', // 'console' | 'file' | 'remote'
  },
};
```

## CMS SDK Implementation

### Core CMS Client
```typescript
// @codex-metatron/cms-sdk
import { CodexCMS } from '@codex-metatron/cms-sdk';
import { config } from './codex-config';

const cms = new CodexCMS(config);

// Content operations
export const contentAPI = {
  // Create content
  async create<T = any>(params: CreateContentParams): Promise<Content<T>> {
    return cms.content.create(params);
  },

  // Find content with filtering, sorting, pagination
  async find<T = any>(params: FindContentParams): Promise<ContentList<T>> {
    return cms.content.find(params);
  },

  // Get single content item
  async findById<T = any>(id: string, options?: FindOptions): Promise<Content<T>> {
    return cms.content.findById(id, options);
  },

  // Update content
  async update<T = any>(id: string, data: Partial<T>): Promise<Content<T>> {
    return cms.content.update(id, data);
  },

  // Delete content
  async delete(id: string): Promise<void> {
    return cms.content.delete(id);
  },

  // Publish content
  async publish(id: string): Promise<Content> {
    return cms.content.publish(id);
  },

  // Full-text search
  async search<T = any>(params: SearchParams): Promise<SearchResults<T>> {
    return cms.search.query(params);
  },
};

// Media operations
export const mediaAPI = {
  async upload(file: File, options?: UploadOptions): Promise<MediaAsset> {
    return cms.media.upload(file, options);
  },

  async find(params?: MediaFindParams): Promise<MediaAssetList> {
    return cms.media.find(params);
  },

  async delete(id: string): Promise<void> {
    return cms.media.delete(id);
  },

  // Generate transformed URLs
  getTransformUrl(assetId: string, transforms: ImageTransforms): string {
    return cms.media.getTransformUrl(assetId, transforms);
  },
};

// User and permission operations
export const userAPI = {
  async getCurrentUser(): Promise<User> {
    return cms.auth.getCurrentUser();
  },

  async getUserPermissions(): Promise<Permission[]> {
    return cms.auth.getPermissions();
  },

  async hasPermission(permission: string, resource?: string): Promise<boolean> {
    return cms.auth.hasPermission(permission, resource);
  },
};
```

### Type Definitions
```typescript
// Types for CMS operations
export interface CreateContentParams {
  contentType: string;
  data: Record<string, any>;
  metadata?: ContentMetadata;
  status?: 'draft' | 'review' | 'published';
}

export interface FindContentParams {
  contentType?: string;
  status?: string | string[];
  limit?: number;
  offset?: number;
  sort?: string;
  filters?: Record<string, any>;
  include?: string[];
  locale?: string;
}

export interface SearchParams {
  query: string;
  contentTypes?: string[];
  filters?: Record<string, any>;
  facets?: string[];
  highlight?: boolean;
  limit?: number;
  offset?: number;
}

export interface Content<T = any> {
  id: string;
  contentType: string;
  title: string;
  slug: string;
  status: string;
  version: number;
  data: T;
  metadata: ContentMetadata;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author: User;
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  createdAt: string;
}
```

## React Integration

### Content Hook
```typescript
// @codex-metatron/react-integration
import { useState, useEffect } from 'react';
import { contentAPI } from '@codex-metatron/cms-sdk';

export const useContent = <T = any>(
  contentType: string,
  options?: FindContentParams
) => {
  const [data, setData] = useState<Content<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const result = await contentAPI.find<T>({
          contentType,
          ...options,
        });
        setData(result.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType, JSON.stringify(options)]);

  return { data, loading, error, refetch: () => fetchContent() };
};

// Single content item hook
export const useContentItem = <T = any>(id: string) => {
  const [data, setData] = useState<Content<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const result = await contentAPI.findById<T>(id);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContent();
    }
  }, [id]);

  return { data, loading, error };
};

// Content mutation hook
export const useContentMutation = <T = any>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (params: CreateContentParams): Promise<Content<T>> => {
    try {
      setLoading(true);
      setError(null);
      return await contentAPI.create<T>(params);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<T>): Promise<Content<T>> => {
    try {
      setLoading(true);
      setError(null);
      return await contentAPI.update<T>(id, data);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publish = async (id: string): Promise<Content<T>> => {
    try {
      setLoading(true);
      setError(null);
      return await contentAPI.publish(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, publish, loading, error };
};
```

### Search Hook
```typescript
export const useSearch = <T = any>(initialQuery?: string) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<SearchResults<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = async (searchQuery: string, params?: Partial<SearchParams>) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await contentAPI.search<T>({
        query: searchQuery,
        ...params,
      });
      setResults(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      const debounceTimer = setTimeout(() => {
        search(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
  };
};
```

## High-Level Component Patterns

### Content Renderer
```typescript
// Content rendering component that dynamically renders based on content type
import { Card, Text, Image, Button } from '@codex-metatron/ui';
import { useContentItem } from '@codex-metatron/react-integration';

interface ContentRendererProps {
  contentId: string;
  className?: string;
}

export const ContentRenderer = ({ contentId, className }: ContentRendererProps) => {
  const { data: content, loading, error } = useContentItem(contentId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!content) return <NotFound />;

  // Dynamic rendering based on content type
  const renderContent = () => {
    switch (content.contentType) {
      case 'article':
        return <ArticleRenderer content={content} />;
      case 'product':
        return <ProductRenderer content={content} />;
      case 'event':
        return <EventRenderer content={content} />;
      default:
        return <GenericContentRenderer content={content} />;
    }
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
};

// Specific content type renderers
const ArticleRenderer = ({ content }: { content: Content<ArticleData> }) => (
  <Card>
    <Card.Header>
      <Text variant="h1">{content.data.title}</Text>
      <Text variant="caption" color="muted">
        By {content.author.name} on {formatDate(content.publishedAt)}
      </Text>
    </Card.Header>
    
    <Card.Body>
      {content.data.featuredImage && (
        <Image
          src={content.data.featuredImage.url}
          alt={content.data.featuredImage.alt}
          className="mb-gr-4"
        />
      )}
      
      <div
        dangerouslySetInnerHTML={{ __html: content.data.body }}
        className="prose max-w-none"
      />
    </Card.Body>
  </Card>
);
```

### Content List Component
```typescript
import { Grid, Card, Text, Badge } from '@codex-metatron/ui';
import { useContent } from '@codex-metatron/react-integration';

interface ContentListProps {
  contentType: string;
  limit?: number;
  filters?: Record<string, any>;
  renderItem?: (content: Content) => React.ReactNode;
  className?: string;
}

export const ContentList = ({
  contentType,
  limit = 12,
  filters,
  renderItem,
  className
}: ContentListProps) => {
  const { data: content, loading, error } = useContent(contentType, {
    limit,
    filters,
    sort: '-publishedAt',
  });

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorMessage error={error} />;

  const defaultRenderItem = (item: Content) => (
    <Card key={item.id} hoverable>
      <Card.Body>
        <Text variant="h4">{item.title}</Text>
        <Text variant="caption" color="muted" className="mb-gr-2">
          {formatDate(item.publishedAt)}
        </Text>
        <Badge variant="primary">{item.status}</Badge>
      </Card.Body>
    </Card>
  );

  return (
    <Grid cols={{ sm: 1, md: 2, lg: 3 }} className={className}>
      {content.map(renderItem || defaultRenderItem)}
    </Grid>
  );
};
```

### Form Builder Component
```typescript
import { Form, FormField, Input, Select, TextArea, Button } from '@codex-metatron/ui';
import { useContentMutation } from '@codex-metatron/react-integration';

interface ContentFormProps {
  contentType: string;
  initialData?: Record<string, any>;
  onSuccess?: (content: Content) => void;
  onError?: (error: Error) => void;
}

export const ContentForm = ({ 
  contentType, 
  initialData, 
  onSuccess, 
  onError 
}: ContentFormProps) => {
  const { create, update, loading } = useContentMutation();
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      let result;
      if (initialData?.id) {
        result = await update(initialData.id, data);
      } else {
        result = await create({
          contentType,
          data,
        });
      }
      onSuccess?.(result);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  // Dynamic form generation based on content type schema
  const renderFormFields = () => {
    // This would be populated from the content type schema
    const schema = getContentTypeSchema(contentType);
    
    return schema.fields.map((field) => (
      <FormField
        key={field.name}
        label={field.label}
        required={field.required}
        error={errors[field.name]}
      >
        {renderFieldInput(field, formData[field.name], (value) => 
          setFormData(prev => ({ ...prev, [field.name]: value }))
        )}
      </FormField>
    ));
  };

  return (
    <Form onSubmit={handleSubmit} loading={loading}>
      {renderFormFields()}
      
      <div className="flex gap-gr-3">
        <Button type="submit" variant="primary">
          {initialData?.id ? 'Update' : 'Create'}
        </Button>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};
```

## Middleware and Plugins

### Authentication Middleware
```typescript
// @codex-metatron/auth
export const authMiddleware = (config: AuthConfig) => {
  return (request: Request) => {
    const token = getStoredToken();
    
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return request;
  };
};

// Auto-refresh token middleware
export const tokenRefreshMiddleware = () => {
  return async (request: Request, next: () => Promise<Response>) => {
    const response = await next();
    
    if (response.status === 401) {
      try {
        const newToken = await refreshToken();
        if (newToken) {
          // Retry request with new token
          request.headers.set('Authorization', `Bearer ${newToken}`);
          return next();
        }
      } catch (error) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    return response;
  };
};
```

### Caching Plugin
```typescript
// @codex-metatron/cache
export const cachePlugin = (options: CacheOptions) => {
  const cache = new Map<string, CacheEntry>();
  
  return {
    beforeRequest: (request: Request) => {
      if (request.method === 'GET') {
        const cacheKey = getCacheKey(request);
        const cached = cache.get(cacheKey);
        
        if (cached && !isExpired(cached)) {
          return Promise.resolve(cached.response);
        }
      }
    },
    
    afterResponse: (request: Request, response: Response) => {
      if (request.method === 'GET' && response.ok) {
        const cacheKey = getCacheKey(request);
        cache.set(cacheKey, {
          response: response.clone(),
          timestamp: Date.now(),
          ttl: options.ttl,
        });
      }
      
      return response;
    },
  };
};
```

## Error Handling

### Global Error Handler
```typescript
// @codex-metatron/error-handling
export class CodexError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'CodexError';
  }
}

export const errorHandler = {
  handle: (error: Error | CodexError) => {
    if (error instanceof CodexError) {
      // Handle specific Codex errors
      switch (error.code) {
        case 'UNAUTHORIZED':
          // Redirect to login
          break;
        case 'FORBIDDEN':
          // Show permission denied message
          break;
        case 'NOT_FOUND':
          // Show 404 page
          break;
        default:
          // Show generic error message
          break;
      }
    } else {
      // Handle unexpected errors
      console.error('Unexpected error:', error);
    }
  },
  
  retry: async (operation: () => Promise<any>, attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await delay(Math.pow(2, i) * 1000); // Exponential backoff
      }
    }
  },
};
```

## Performance Optimization

### Lazy Loading Components
```typescript
// Auto-lazy loading for heavy components
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: P) => (
    <Suspense fallback={fallback ? <fallback /> : <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Usage
export const DataTable = withLazyLoading(
  () => import('./DataTable'),
  LoadingTable
);
```

### Content Prefetching
```typescript
// Prefetch related content
export const usePrefetch = () => {
  const prefetch = useCallback((contentId: string) => {
    // Prefetch content in the background
    contentAPI.findById(contentId).catch(() => {
      // Silent fail for prefetch
    });
  }, []);

  return { prefetch };
};
```

## Testing Utilities

### Mock SDK for Testing
```typescript
// @codex-metatron/testing
export const createMockCMS = (responses: MockResponses) => {
  return {
    content: {
      find: jest.fn().mockResolvedValue(responses.content.find),
      findById: jest.fn().mockResolvedValue(responses.content.findById),
      create: jest.fn().mockResolvedValue(responses.content.create),
      // ... other mocked methods
    },
    media: {
      upload: jest.fn().mockResolvedValue(responses.media.upload),
      // ... other mocked methods
    },
  };
};

// Test helpers
export const renderWithCMS = (
  component: React.ReactElement,
  mockResponses?: MockResponses
) => {
  const mockCMS = createMockCMS(mockResponses || defaultMockResponses);
  
  return render(
    <CMSProvider cms={mockCMS}>
      {component}
    </CMSProvider>
  );
};
```

## Documentation & Developer Experience

### TypeScript Integration
- Full TypeScript support with strict typing
- Auto-generated types from CMS schema
- Intellisense support for all SDK methods
- Type-safe content data access

### Developer Tools
- Browser extension for debugging
- Performance monitoring
- Cache inspection
- Request/response logging

### Code Generation
- CLI tool for generating components from content types
- Automatic type generation from CMS schemas
- Template scaffolding for new content types