# CMS Architecture for Codex Metatron Platform

## Overview
The CMS system will be implemented as a multi-tenant, component-based content management solution that integrates seamlessly with our existing platform architecture.

## Architecture Components

### 1. CMS Microservice (`apps/services/cms-service`)
**Purpose**: Dedicated service for content management operations
**Port**: 3007
**Features**:
- Content CRUD operations with versioning
- Component-based content structure
- Media upload and management
- Content localization (i18n support)
- Caching with Redis integration
- Multi-tenant data isolation

### 2. NPM Package (`packages/cms-sdk`)
**Package Name**: `@codex-metatron/cms-sdk`
**Purpose**: Client-side SDK for CMS integration
**Features**:
- React Server Component compatibility
- Next.js App Router optimizations
- Built-in caching and ISR support
- TypeScript-first development
- Component renderer utilities
- Tenant API key integration

### 3. CLI Tool (`packages/create-codex-app`)
**Purpose**: Automated client application scaffolding
**Features**:
- Interactive setup wizard
- Tenant credential configuration
- Theme selection (5 brand themes)
- CMS integration setup
- Environment variable generation

### 4. Enhanced Client Template (`apps/client-template`)
**Purpose**: Production-ready template for tenant applications
**Features**:
- Dynamic [...slug] routing for CMS pages
- Component registry pattern
- Theme system integration
- Pre-built CMS components
- TypeScript support throughout

## Technical Specifications

### Content Model
```typescript
interface CMSContent {
  id: string;
  tenantId: string;
  slug: string;
  contentType: string;
  status: 'draft' | 'published' | 'scheduled';
  version: number;
  locale: string;
  data: Record<string, any>;
  components: ComponentInstance[];
  seo: SEOMetadata;
  publishedAt?: Date;
  scheduledFor?: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ComponentInstance {
  id: string;
  type: string; // 'hero', 'features', 'cta', etc.
  props: Record<string, any>;
  children?: ComponentInstance[];
  visibility?: VisibilityRules;
}
```

### Database Schema Extensions
Add to each tenant's database:
- `cms_content` - Main content storage with versioning
- `cms_content_types` - Custom content type definitions
- `cms_media` - Media library with cloud storage URLs
- `cms_content_versions` - Complete version history
- `cms_components` - Reusable component definitions

### API Endpoints
```
# Content Management
GET    /api/cms/content/:slug
GET    /api/cms/contents?type=:type&status=:status
POST   /api/cms/content
PUT    /api/cms/content/:id
DELETE /api/cms/content/:id
POST   /api/cms/content/:id/publish
POST   /api/cms/content/:id/unpublish

# Media Management  
POST   /api/cms/media/upload
GET    /api/cms/media
DELETE /api/cms/media/:id

# Content Types
GET    /api/cms/content-types
POST   /api/cms/content-types
PUT    /api/cms/content-types/:id

# Preview System
GET    /api/cms/preview/:slug?token=:token
```

## Component Hierarchy Design

### UI Component Separation Strategy

#### 1. Atomic Design Principles
```
libs/ui/src/components/
├── atoms/          # Basic building blocks
│   ├── Button/
│   ├── Input/
│   ├── Text/
│   └── Image/
├── molecules/      # Simple combinations
│   ├── Card/
│   ├── SearchBox/
│   └── Navigation/
├── organisms/      # Complex UI sections
│   ├── Header/
│   ├── Footer/
│   └── ProductGrid/
└── templates/      # Page-level layouts
    ├── LandingPage/
    └── BlogPost/
```

#### 2. CMS-Specific Components
```
packages/cms-sdk/src/components/
├── cms/            # CMS-specific components
│   ├── CMSRenderer/
│   ├── CMSPage/
│   └── CMSPreview/
├── blocks/         # Content blocks
│   ├── Hero/
│   ├── Features/
│   ├── Testimonials/
│   ├── Gallery/
│   ├── CTA/
│   └── RichText/
└── layout/         # Layout components
    ├── Container/
    ├── Grid/
    └── Section/
```

#### 3. Theme System Components
```
apps/client-template/src/components/
├── theme/          # Theme-specific components
│   ├── ancient-khemet/
│   ├── emerald-tablets/
│   ├── knights-templar/
│   ├── skybound/
│   └── sttc/
├── cms/            # App-specific CMS components
│   ├── Hero.tsx
│   ├── Features.tsx
│   └── CustomBlocks.tsx
└── layout/         # App layout components
    ├── AppHeader.tsx
    └── AppFooter.tsx
```

## Component Registry Pattern

### Implementation Strategy
```typescript
// Component mapping for CMS integration
export const componentMap = {
  // Shared UI components
  'button': Button,
  'card': Card,
  'grid': Grid,
  
  // CMS content blocks
  'hero': Hero,
  'features': Features,
  'testimonials': Testimonials,
  'gallery': Gallery,
  'cta': CTA,
  
  // Layout components
  'container': Container,
  'section': Section,
  
  // Custom components (tenant-specific)
  'custom-block': CustomBlock,
} as const;
```

### Dynamic Component Loading
```typescript
// Support for dynamic component loading
const DynamicComponent = dynamic(() => 
  import(`../components/blocks/${componentType}`)
);
```

## Theme System Architecture

### 1. Sacred Geometry Integration
Each theme implements our sacred geometry design system:
- **Golden Ratio**: φ = 1.618 for spacing and proportions
- **Spacing Scale**: 5px, 8px, 13px, 21px, 34px, 55px, 89px, 144px
- **Typography Scale**: 10px, 12px, 16px, 20px, 26px, 32px, 42px, 52px, 68px

### 2. Theme Configuration
```typescript
interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    gr1: string; // 5px
    gr2: string; // 8px
    // ... up to gr8
  };
  components: {
    [key: string]: ComponentTheme;
  };
}
```

### 3. Available Themes
1. **ancient-khemet**: Egyptian-inspired design with gold accents
2. **emerald-tablets**: Mystical green theme with sacred symbols
3. **knights-templar**: Medieval design with red and white
4. **skybound**: Celestial blue theme with cosmic elements
5. **sttc**: Modern tech theme with clean lines

## Integration with Existing Platform

### 1. Tenant Isolation
- CMS service uses existing tenant middleware
- Content stored in tenant-specific databases
- API keys provide tenant context
- All CMS operations respect tenant boundaries

### 2. Authentication Integration
- Leverages existing JWT token system
- Admin users can manage CMS content
- Role-based permissions for content editing
- Audit logging for all CMS operations

### 3. CDXPharaoh Dashboard Integration
- Content management interface
- Media library management
- Content analytics and statistics
- Tenant content overview

## Development Workflow

### 1. Component Development Process
1. **Create atomic components** in shared UI library
2. **Compose molecules and organisms** using atoms
3. **Build CMS blocks** using organism components
4. **Register components** in component map
5. **Test in client template** with live CMS data

### 2. Content Creation Workflow
1. **Define content structure** in CMS service
2. **Create reusable components** in UI library
3. **Map components** to CMS blocks
4. **Test content rendering** in client applications
5. **Deploy to production** via automated pipeline

### 3. Local Development Setup
```bash
# Terminal 1: Core services
npm run dev:server  # Port 3000
npm run dev:cms     # Port 3007

# Terminal 2: CMS SDK development
cd packages/cms-sdk
npm run dev         # Watch mode

# Terminal 3: Client template
cd apps/client-template
npm run dev         # Port 3001

# Terminal 4: CDXPharaoh
cd apps/cdx-pharaoh
npm run dev         # Port 5173
```

## Performance Optimization

### 1. Caching Strategy
- **Redis caching** for frequently accessed content
- **ISR (Incremental Static Regeneration)** for static content
- **On-demand revalidation** for content updates
- **CDN integration** for media assets

### 2. Component Optimization
- **Code splitting** for theme-specific components
- **Lazy loading** for non-critical components
- **Tree shaking** for unused UI components
- **Bundle analysis** for size optimization

## Security Considerations

### 1. Content Security
- **Tenant isolation** at database level
- **Input sanitization** for all content
- **XSS protection** in component rendering
- **CSRF protection** for content updates

### 2. Media Security
- **Signed URLs** for media access
- **File type validation** for uploads
- **Size limits** for media files
- **Virus scanning** for uploaded content

## Future Enhancements

### Phase 2 Features
- Visual drag-and-drop editor
- Real-time collaborative editing
- Advanced SEO optimization
- A/B testing capabilities
- Advanced analytics integration

### Phase 3 Features
- Multi-language content management
- Workflow approval systems
- Advanced permissions and roles
- Content scheduling automation
- AI-powered content suggestions

## Success Metrics

### Technical Metrics
- **Page Load Time**: < 2 seconds for CMS pages
- **API Response Time**: < 200ms for content endpoints
- **Cache Hit Rate**: > 85% for content requests
- **Bundle Size**: < 100KB for CMS SDK

### Business Metrics
- **Time to Deploy**: < 5 minutes for new client app
- **Content Update Speed**: < 30 seconds from edit to live
- **Developer Onboarding**: < 1 hour to create first CMS page
- **Client Satisfaction**: > 90% satisfaction with CMS experience

## Implementation Priority

### Week 1 (MVP)
1. CMS service basic CRUD operations
2. SDK package core functionality
3. Client template CMS integration
4. Component registry implementation

### Week 2 (Enhanced Features)
1. Media upload and management
2. Content versioning system
3. Theme system implementation
4. CLI tool development

### Week 3 (Production Ready)
1. Performance optimizations
2. Security hardening
3. Documentation completion
4. Testing and quality assurance

This CMS architecture ensures scalability, maintainability, and seamless integration with our existing multi-tenant platform while providing a superior developer and client experience.