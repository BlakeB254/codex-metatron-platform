# Component Implementation Guide

## Overview
This guide provides detailed implementation instructions for building the Codex Metatron UI Library components following sacred geometry principles and best practices.

## Sacred Geometry Implementation

### TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        'gr-1': '5px',    // φ^-4 * 89
        'gr-2': '8px',    // φ^-3 * 89  
        'gr-3': '13px',   // φ^-2 * 89
        'gr-4': '21px',   // φ^-1 * 89
        'gr-5': '34px',   // φ^0 * 89
        'gr-6': '55px',   // φ^1 * 89
        'gr-7': '89px',   // φ^2 * 89
        'gr-8': '144px',  // φ^3 * 89
      },
      fontSize: {
        'gr-xs': '10px',  // Caption text
        'gr-sm': '16px',  // Body text
        'gr-md': '26px',  // Subheading
        'gr-lg': '42px',  // Heading
        'gr-xl': '68px',  // Hero text
      },
      maxWidth: {
        'container-sm': '618px',   // φ * 382
        'container-md': '1000px',  // Round number
        'container-lg': '1618px',  // φ * 1000
      },
      colors: {
        // Golden ratio inspired color palette
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        }
      }
    }
  }
}
```

## Component Structure

### File Organization
```
libs/ui/src/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── index.ts
├── molecules/
├── organisms/
├── templates/
├── themes/
├── types/
└── utils/
```

### Base Component Template
```typescript
// Button/Button.tsx
import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { BaseComponentProps } from '../../types';

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  children,
  className,
  ...props
}, ref) => {
  const baseStyles = cn(
    // Base styles using golden ratio spacing
    'inline-flex items-center justify-center',
    'font-medium transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    
    // Size variants using golden ratio
    {
      'h-8 px-gr-3 text-gr-xs': size === 'sm',     // 32px height, 13px padding
      'h-gr-4 px-gr-4 text-gr-sm': size === 'md',  // 21px height, 21px padding  
      'h-gr-5 px-gr-5 text-gr-md': size === 'lg',  // 34px height, 34px padding
    },
    
    // Variant styles
    {
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': variant === 'primary',
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500': variant === 'secondary',
      'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
    },
    
    // Full width
    {
      'w-full': fullWidth,
    },
    
    className
  );

  const iconElement = icon && (
    <span className={cn(
      'flex-shrink-0',
      {
        'mr-gr-2': iconPosition === 'left' && children,
        'ml-gr-2': iconPosition === 'right' && children,
      }
    )}>
      {icon}
    </span>
  );

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={baseStyles}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={size} />
      ) : (
        <>
          {iconPosition === 'left' && iconElement}
          {children}
          {iconPosition === 'right' && iconElement}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
```

### Component Testing
```typescript
// Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct size classes', () => {
    render(<Button size="lg">Large button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-gr-5', 'px-gr-5');
  });

  it('shows loading state', () => {
    render(<Button loading>Loading button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('supports keyboard navigation', () => {
    render(<Button>Keyboard accessible</Button>);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    // Add assertion for Enter key handling
  });
});
```

### Storybook Stories
```typescript
// Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { IconPlus } from '../Icon';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    icon: <IconPlus />,
    children: 'Add Item',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-gr-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
```

## Advanced Component Patterns

### Compound Component (Tabs)
```typescript
// Tabs/Tabs.tsx
import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
};

interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
}

const Tabs = ({ defaultTab, children, className }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div 
      role="tablist"
      className={cn(
        'flex border-b border-gray-200',
        'space-x-gr-4',
        className
      )}
    >
      {children}
    </div>
  );
};

interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Tab = ({ value, children, disabled, className }: TabProps) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'py-gr-3 px-gr-4 text-gr-sm font-medium',
        'border-b-2 transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        {
          'border-primary-600 text-primary-600': isActive,
          'border-transparent text-gray-500 hover:text-gray-700': !isActive,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsPanel = ({ value, children, className }: TabsPanelProps) => {
  const { activeTab } = useTabs();
  
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('py-gr-4', className)}
    >
      {children}
    </div>
  );
};

// Compound component assignment
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabsPanel;

export { Tabs };
```

### Polymorphic Component (Text)
```typescript
// Text/Text.tsx
import React from 'react';
import { cn } from '../../utils/cn';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';

interface TextOwnProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'danger' | 'success';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  className?: string;
  children: React.ReactNode;
}

type TextProps<T extends React.ElementType> = TextOwnProps & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof TextOwnProps>;

const variantStyles: Record<TextVariant, string> = {
  h1: 'text-gr-xl font-bold leading-tight',
  h2: 'text-gr-lg font-bold leading-tight',
  h3: 'text-gr-md font-semibold leading-snug',
  h4: 'text-gr-sm font-semibold leading-snug',
  body: 'text-gr-sm leading-relaxed',
  caption: 'text-gr-xs leading-normal',
  label: 'text-gr-xs font-medium leading-normal',
};

const Text = <T extends React.ElementType = 'span'>({
  as,
  variant = 'body',
  color = 'primary',
  weight,
  align = 'left',
  truncate = false,
  className,
  children,
  ...props
}: TextProps<T>) => {
  const Component = as || getDefaultElement(variant);

  const styles = cn(
    variantStyles[variant],
    
    // Color variants
    {
      'text-gray-900': color === 'primary',
      'text-gray-600': color === 'secondary',
      'text-gray-400': color === 'muted',
      'text-red-600': color === 'danger',
      'text-green-600': color === 'success',
    },
    
    // Weight override
    weight && {
      'font-normal': weight === 'normal',
      'font-medium': weight === 'medium',
      'font-semibold': weight === 'semibold',
      'font-bold': weight === 'bold',
    },
    
    // Alignment
    {
      'text-left': align === 'left',
      'text-center': align === 'center',
      'text-right': align === 'right',
      'text-justify': align === 'justify',
    },
    
    // Truncation
    {
      'truncate': truncate,
    },
    
    className
  );

  return (
    <Component className={styles} {...props}>
      {children}
    </Component>
  );
};

const getDefaultElement = (variant: TextVariant): React.ElementType => {
  const elementMap: Record<TextVariant, React.ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    caption: 'span',
    label: 'label',
  };
  return elementMap[variant];
};

export { Text };
```

## Form Components

### Form Field with Validation
```typescript
// FormField/FormField.tsx
import React from 'react';
import { cn } from '../../utils/cn';
import { Text } from '../Text';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactElement;
  className?: string;
}

const FormField = ({
  label,
  required = false,
  error,
  hint,
  children,
  className
}: FormFieldProps) => {
  const id = children.props.id || `field-${Math.random().toString(36).substr(2, 9)}`;
  
  const childWithProps = React.cloneElement(children, {
    id,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    'aria-invalid': error ? 'true' : 'false',
  });

  return (
    <div className={cn('space-y-gr-2', className)}>
      <label htmlFor={id} className="block">
        <Text variant="label" color="primary">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </Text>
      </label>
      
      {childWithProps}
      
      {error && (
        <Text
          id={`${id}-error`}
          variant="caption"
          color="danger"
          role="alert"
        >
          {error}
        </Text>
      )}
      
      {hint && !error && (
        <Text
          id={`${id}-hint`}
          variant="caption"
          color="muted"
        >
          {hint}
        </Text>
      )}
    </div>
  );
};

export { FormField };
```

## Responsive Patterns

### Responsive Grid Component
```typescript
// Grid/Grid.tsx
import React from 'react';
import { cn } from '../../utils/cn';

interface GridProps {
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const Grid = ({ cols = 12, gap = 'md', className, children }: GridProps) => {
  const gapStyles = {
    sm: 'gap-gr-2',
    md: 'gap-gr-4',
    lg: 'gap-gr-6',
  };

  const getColumnClasses = () => {
    if (typeof cols === 'number') {
      return `grid-cols-${cols}`;
    }
    
    return cn(
      cols.sm && `grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`,
    );
  };

  return (
    <div
      className={cn(
        'grid',
        getColumnClasses(),
        gapStyles[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface GridItemProps {
  span?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  className?: string;
  children: React.ReactNode;
}

const GridItem = ({ span, className, children }: GridItemProps) => {
  const getSpanClasses = () => {
    if (!span) return '';
    
    if (typeof span === 'number') {
      return `col-span-${span}`;
    }
    
    return cn(
      span.sm && `col-span-${span.sm}`,
      span.md && `md:col-span-${span.md}`,
      span.lg && `lg:col-span-${span.lg}`,
      span.xl && `xl:col-span-${span.xl}`,
    );
  };

  return (
    <div className={cn(getSpanClasses(), className)}>
      {children}
    </div>
  );
};

Grid.Item = GridItem;

export { Grid };
```

## Accessibility Implementation

### Focus Management
```typescript
// hooks/useFocusManagement.ts
import { useRef, useEffect } from 'react';

export const useFocusManagement = (isOpen: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement;

    // Focus the container
    if (containerRef.current) {
      containerRef.current.focus();
    }

    // Focus trap implementation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus when component unmounts
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
};
```

## Performance Optimization

### Component Lazy Loading
```typescript
// components/LazyComponent.tsx
import React, { Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyComponentProps {
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

const LazyComponent: React.FC<LazyComponentProps> = ({
  importFunc,
  fallback = <LoadingSpinner />,
  ...props
}) => {
  const Component = React.lazy(importFunc);

  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Usage
const DataTable = (props: any) => (
  <LazyComponent
    importFunc={() => import('./DataTable')}
    {...props}
  />
);
```

## Theme System

### Theme Provider Implementation
```typescript
// themes/ThemeProvider.tsx
import React, { createContext, useContext } from 'react';

interface Theme {
  colors: {
    primary: Record<string, string>;
    gray: Record<string, string>;
    // ... other color scales
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
  };
}

const defaultTheme: Theme = {
  colors: {
    primary: {
      50: '#f0f4ff',
      // ... full color scale
    },
    // ... other colors
  },
  spacing: {
    'gr-1': '5px',
    // ... golden ratio spacing
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      'gr-xs': '10px',
      // ... typography scale
    },
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  theme?: Partial<Theme>;
  children: React.ReactNode;
}

export const ThemeProvider = ({ theme = {}, children }: ThemeProviderProps) => {
  const mergedTheme = { ...defaultTheme, ...theme };

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};
```