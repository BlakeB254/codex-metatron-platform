import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { cva, type VariantProps } from '../../utils/variants';

// Sacred Geometry Text variants
const textVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-gr-4xl font-bold text-neutral-900',
      h2: 'text-gr-3xl font-bold text-neutral-900',
      h3: 'text-gr-2xl font-semibold text-neutral-900',
      h4: 'text-gr-xl font-semibold text-neutral-900',
      h5: 'text-gr-lg font-medium text-neutral-900',
      h6: 'text-gr-md font-medium text-neutral-900',
      body: 'text-gr-base text-neutral-700',
      caption: 'text-gr-sm text-neutral-600',
      small: 'text-gr-xs text-neutral-500',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    color: {
      default: '',
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      muted: 'text-neutral-500',
    },
  },
  defaultVariants: {
    variant: 'body',
    align: 'left',
    color: 'default',
  },
});

type TextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  /**
   * The HTML element to render
   */
  as?: TextElement;
  /**
   * The content to display
   */
  children: React.ReactNode;
}

/**
 * Text component following Sacred Geometry typography scale
 * 
 * @example
 * ```tsx
 * <Text variant="h1">Main Heading</Text>
 * <Text variant="body" color="muted">Body text</Text>
 * ```
 */
export const Text = forwardRef<HTMLElement, TextProps>(
  ({ className, variant, align, weight, color, as, children, ...props }, ref) => {
    // Determine the HTML element based on variant or explicit 'as' prop
    const Component = as || (variant?.startsWith('h') ? variant as TextElement : 'p');
    
    return (
      <Component
        className={cn(textVariants({ variant, align, weight, color, className }))}
        ref={ref as any}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';