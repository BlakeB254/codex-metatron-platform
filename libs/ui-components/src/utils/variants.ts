import { type VariantProps, cva } from 'class-variance-authority';

/**
 * Re-export class-variance-authority utilities for component variants
 * This provides a consistent API for variant-based styling across all components
 */
export { cva, type VariantProps };

/**
 * Common variant configurations used across multiple components
 */
export const commonVariants = {
  size: {
    sm: 'text-gr-sm px-gr-2 py-gr-1',
    md: 'text-gr-base px-gr-3 py-gr-2',
    lg: 'text-gr-lg px-gr-4 py-gr-3',
  },
  variant: {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'text-primary-500 hover:bg-primary-50',
  },
} as const;