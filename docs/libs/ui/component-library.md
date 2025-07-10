# Shared Component/UI Library Specification

## Overview
The Codex Metatron UI Library is a comprehensive design system built on sacred geometry principles, providing reusable components for building consistent, accessible, and beautiful user interfaces across all platform applications.

## Design Principles

### Sacred Geometry Foundation
Based on the Golden Ratio (φ = 1.618), all spacing, sizing, and proportions follow Fibonacci sequences.

#### Spacing Scale
```css
/* TailwindCSS Classes with Golden Ratio spacing */
.gr-1 { /* 5px */ }
.gr-2 { /* 8px */ }
.gr-3 { /* 13px */ }
.gr-4 { /* 21px */ }
.gr-5 { /* 34px */ }
.gr-6 { /* 55px */ }
.gr-7 { /* 89px */ }
.gr-8 { /* 144px */ }
```

#### Typography Scale
```css
/* Golden Ratio Typography */
.text-gr-xs { font-size: 10px; }  /* Captions */
.text-gr-sm { font-size: 16px; }  /* Body text */
.text-gr-md { font-size: 26px; }  /* Subheadings */
.text-gr-lg { font-size: 42px; }  /* Headings */
.text-gr-xl { font-size: 68px; }  /* Hero text */
```

#### Container Widths
```css
.container-sm { max-width: 618px; }   /* φ * 382 */
.container-md { max-width: 1000px; }  /* Round number */
.container-lg { max-width: 1618px; }  /* φ * 1000 */
```

## Component Hierarchy

### 1. Atoms (Basic Building Blocks)

#### Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

#### Input
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  size: 'sm' | 'md' | 'lg';
  variant: 'default' | 'filled' | 'borderless';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}
```

#### Text
```typescript
interface TextProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'danger' | 'success';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

#### Icon
```typescript
interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}
```

#### Badge
```typescript
interface BadgeProps {
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

#### Avatar
```typescript
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  fallback?: string | React.ReactNode;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}
```

### 2. Molecules (Composite Components)

#### Card
```typescript
interface CardProps {
  variant?: 'default' | 'bordered' | 'shadow' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}
```

#### FormField
```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactElement;
  className?: string;
}
```

#### SearchBox
```typescript
interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions?: string[];
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### StatusBadge
```typescript
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'warning';
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}
```

#### Dropdown
```typescript
interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  position?: 'bottom' | 'top' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}
```

#### Toast
```typescript
interface ToastProps {
  title: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}
```

### 3. Organisms (Complex Components)

#### DataTable
```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}
```

#### Modal
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}
```

#### Sidebar
```typescript
interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
}
```

#### Form
```typescript
interface FormProps<T> {
  fields: FormFieldConfig<T>[];
  values: T;
  errors?: Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
  onChange?: (values: T) => void;
  loading?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
  className?: string;
}

interface FormFieldConfig<T> {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: any }[];
  validation?: (value: any) => string | undefined;
}
```

#### Chart
```typescript
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter';
  data: ChartData;
  options?: ChartOptions;
  height?: number;
  loading?: boolean;
  className?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}
```

### 4. Templates (Page Layouts)

#### DashboardLayout
```typescript
interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

#### AuthLayout
```typescript
interface AuthLayoutProps {
  children: React.ReactNode;
  logo?: React.ReactNode;
  background?: 'gradient' | 'pattern' | 'image';
  backgroundImage?: string;
}
```

#### ContentLayout
```typescript
interface ContentLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}
```

## Component Patterns

### Nested Component Pattern
```typescript
// Example: Card with nested components
const Card = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card>
  <Card.Header title="Dashboard" />
  <Card.Body>
    <p>Content goes here</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Compound Component Pattern
```typescript
// Example: Tabs component
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;
```

## SDK Integration

### Installation
```bash
npm install @codex-metatron/ui
```

### Basic Usage
```typescript
import { Button, Card, Input } from '@codex-metatron/ui';
import '@codex-metatron/ui/styles.css';

function App() {
  return (
    <Card>
      <Card.Header title="Login" />
      <Card.Body>
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button variant="primary" fullWidth>
          Sign In
        </Button>
      </Card.Body>
    </Card>
  );
}
```

### Theme Customization
```typescript
import { ThemeProvider, createTheme } from '@codex-metatron/ui';

const customTheme = createTheme({
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
  },
  spacing: {
    // Uses golden ratio by default
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

## Accessibility Standards

### WCAG 2.1 AA Compliance
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation support for all interactive elements
- ARIA labels and roles properly implemented
- Focus indicators with proper visibility
- Screen reader announcements for dynamic content

### Keyboard Shortcuts
```
Tab         - Navigate forward
Shift+Tab   - Navigate backward
Enter       - Activate buttons/links
Space       - Toggle checkboxes, activate buttons
Arrow keys  - Navigate within components
Escape      - Close modals/dropdowns
```

## Animation & Transitions

### Micro-interactions
```css
/* Golden ratio-based timing */
.transition-fast { transition-duration: 100ms; }
.transition-base { transition-duration: 161ms; } /* ~φ * 100 */
.transition-slow { transition-duration: 261ms; } /* ~φ * 161 */
.transition-slower { transition-duration: 423ms; } /* ~φ * 261 */
```

### Animation Presets
```typescript
const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { transform: 'translateY(21px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  scaleIn: {
    from: { transform: 'scale(0.618)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
};
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const DataTable = lazy(() => import('./components/DataTable'));
const Chart = lazy(() => import('./components/Chart'));
```

### Bundle Size Targets
- Core components: < 50KB gzipped
- Full library: < 150KB gzipped
- CSS: < 30KB gzipped

### Tree Shaking Support
```typescript
// Import only what you need
import { Button, Card } from '@codex-metatron/ui';
// Not this
import * as UI from '@codex-metatron/ui';
```

## Testing Strategy

### Unit Tests
- 100% coverage for all components
- Test accessibility features
- Test keyboard navigation
- Test responsive behavior

### Visual Regression Tests
- Snapshot testing for all component states
- Cross-browser visual testing
- Dark mode testing

### Integration Tests
- Test compound components together
- Test theme switching
- Test form validation flows

## Documentation

### Component Documentation Structure
```markdown
# Component Name

## Overview
Brief description of the component and its use cases.

## Props
Table of all props with types and descriptions.

## Examples
### Basic Usage
### Advanced Usage
### With Other Components

## Accessibility
Specific accessibility features and considerations.

## Best Practices
Do's and don'ts for using the component.
```

### Storybook Integration
- Interactive component playground
- Live prop editing
- Accessibility checks
- Mobile viewport testing
- Theme switching

## Release Process

### Versioning
- Semantic versioning (MAJOR.MINOR.PATCH)
- Breaking changes only in major versions
- Deprecation warnings for 2 minor versions

### Distribution
- NPM package: `@codex-metatron/ui`
- CDN distribution for quick prototyping
- Source maps for debugging
- TypeScript definitions included