import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { cva, type VariantProps } from '../../utils/variants';

// Sacred Geometry Button variants using golden ratio spacing
const buttonVariants = cva(
  // Base styles with sacred geometry principles
  'inline-flex items-center justify-center rounded-gr font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
        secondary: 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 active:bg-secondary-400',
        outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100',
        ghost: 'text-primary-500 hover:bg-primary-50 active:bg-primary-100',
        destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
      },
      size: {
        sm: 'h-9 px-gr-2 text-gr-sm',
        md: 'h-11 px-gr-3 text-gr-base',
        lg: 'h-13 px-gr-4 text-gr-lg',
        xl: 'h-16 px-gr-5 text-gr-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * The content to display inside the button
   */
  children: React.ReactNode;
  /**
   * Whether the button should display a loading state
   */
  loading?: boolean;
  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode;
}

/**
 * Button component following Sacred Geometry design principles
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    children, 
    loading, 
    leftIcon, 
    rightIcon, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="mr-gr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : leftIcon ? (
          <span className="mr-gr-2">{leftIcon}</span>
        ) : null}
        
        {children}
        
        {rightIcon && !loading && (
          <span className="ml-gr-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';