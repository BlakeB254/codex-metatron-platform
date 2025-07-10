import React, { forwardRef, HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { BaseComponentProps, TextVariant, ColorVariant } from '../../types'

export interface TextProps
  extends HTMLAttributes<HTMLElement>,
    BaseComponentProps {
  variant?: TextVariant
  color?: ColorVariant
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right' | 'justify'
  truncate?: boolean
  italic?: boolean
  underline?: boolean
  as?: React.ElementType
}

const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      variant = 'body',
      color = 'neutral',
      weight = 'normal',
      align = 'left',
      truncate = false,
      italic = false,
      underline = false,
      className,
      as,
      children,
      ...props
    },
    ref
  ) => {
    // Default element mapping for semantic HTML
    const getDefaultElement = (variant: TextVariant): React.ElementType => {
      switch (variant) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return variant
        case 'body-large':
        case 'body':
        case 'body-small':
          return 'p'
        case 'caption':
          return 'span'
        case 'label':
          return 'label'
        default:
          return 'p'
      }
    }

    const Component = as || getDefaultElement(variant)

    const textStyles = cn(
      // Base styles
      'font-sans',
      
      // Variant styles with sacred geometry typography
      {
        'text-gr-5xl font-bold leading-tight': variant === 'h1',
        'text-gr-4xl font-bold leading-tight': variant === 'h2',
        'text-gr-3xl font-semibold leading-tight': variant === 'h3',
        'text-gr-2xl font-semibold leading-snug': variant === 'h4',
        'text-gr-xl font-medium leading-snug': variant === 'h5',
        'text-gr-lg font-medium leading-normal': variant === 'h6',
        'text-gr-lg leading-relaxed': variant === 'body-large',
        'text-gr-base leading-normal': variant === 'body',
        'text-gr-sm leading-normal': variant === 'body-small',
        'text-gr-xs leading-tight': variant === 'caption',
        'text-gr-sm font-medium leading-normal': variant === 'label',
      },
      
      // Weight styles
      {
        'font-normal': weight === 'normal',
        'font-medium': weight === 'medium',
        'font-semibold': weight === 'semibold',
        'font-bold': weight === 'bold',
      },
      
      // Color styles
      {
        'text-blue-600': color === 'primary',
        'text-gray-600': color === 'secondary',
        'text-green-600': color === 'success',
        'text-yellow-600': color === 'warning',
        'text-red-600': color === 'danger',
        'text-blue-500': color === 'info',
        'text-gray-900': color === 'neutral',
      },
      
      // Alignment
      {
        'text-left': align === 'left',
        'text-center': align === 'center',
        'text-right': align === 'right',
        'text-justify': align === 'justify',
      },
      
      // Text styling
      {
        'truncate': truncate,
        'italic': italic,
        'underline': underline,
      },
      
      className
    )

    return (
      <Component
        ref={ref}
        className={textStyles}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Text.displayName = 'Text'

export { Text }