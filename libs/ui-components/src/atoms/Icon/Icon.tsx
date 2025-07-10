import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { cva, type VariantProps } from '../../utils/variants';

// Sacred Geometry Icon variants
const iconVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
      '2xl': 'h-10 w-10',
    },
    color: {
      default: 'text-current',
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      muted: 'text-neutral-500',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
});

export interface IconProps
  extends React.SVGAttributes<SVGElement>,
    VariantProps<typeof iconVariants> {
  /**
   * The icon content (usually an SVG element)
   */
  children: React.ReactNode;
  /**
   * Whether the icon should have a spinning animation
   */
  spinning?: boolean;
}

/**
 * Icon wrapper component following Sacred Geometry design principles
 * 
 * @example
 * ```tsx
 * import { Search } from 'lucide-react';
 * 
 * <Icon size="md" color="primary">
 *   <Search />
 * </Icon>
 * ```
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, color, spinning, children, ...props }, ref) => {
    return (
      <span
        className={cn(
          iconVariants({ size, color, className }),
          spinning && 'animate-spin'
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Icon.displayName = 'Icon';