import React, { forwardRef, HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { BaseComponentProps, SizeVariant } from '../../types'

export interface CardProps extends HTMLAttributes<HTMLDivElement>, BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled'
  size?: SizeVariant
  header?: React.ReactNode
  footer?: React.ReactNode
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
}

const Card = forwardRef<HTMLDivElement | HTMLButtonElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'gr-md',
      header,
      footer,
      hoverable = false,
      clickable = false,
      loading = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const cardStyles = cn(
      // Base styles
      'relative overflow-hidden transition-all duration-200 ease-in-out',
      
      // Size variants using sacred geometry
      {
        'rounded-gr-sm': size === 'gr-sm',
        'rounded-gr-md': size === 'gr-md',
        'rounded-gr-lg': size === 'gr-lg',
        'rounded-gr-xl': size === 'gr-xl',
      },
      
      // Variant styles
      {
        // Default
        'bg-white border border-gray-200 shadow-gr-sm': variant === 'default',
        
        // Outlined
        'bg-white border-2 border-gray-300': variant === 'outlined',
        
        // Elevated
        'bg-white border-0 shadow-gr-lg': variant === 'elevated',
        
        // Filled
        'bg-gray-50 border-0': variant === 'filled',
      },
      
      // Interactive states
      {
        'hover:shadow-gr-md hover:scale-[1.02] cursor-pointer': hoverable || clickable,
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2': clickable,
      },
      
      // Loading state
      {
        'animate-golden-pulse': loading,
      },
      
      className
    )

    const contentPadding = cn({
      'p-gr-2': size === 'gr-sm',
      'p-gr-3': size === 'gr-md',
      'p-gr-4': size === 'gr-lg',
      'p-gr-5': size === 'gr-xl',
    })

    const headerStyles = cn(
      'border-b border-gray-200 last:border-b-0',
      {
        'px-gr-2 py-gr-1': size === 'gr-sm',
        'px-gr-3 py-gr-2': size === 'gr-md',
        'px-gr-4 py-gr-3': size === 'gr-lg',
        'px-gr-5 py-gr-4': size === 'gr-xl',
      }
    )

    const footerStyles = cn(
      'border-t border-gray-200 last:border-t-0',
      {
        'px-gr-2 py-gr-1': size === 'gr-sm',
        'px-gr-3 py-gr-2': size === 'gr-md',
        'px-gr-4 py-gr-3': size === 'gr-lg',
        'px-gr-5 py-gr-4': size === 'gr-xl',
      }
    )

    const CardComponent = clickable ? 'button' : 'div'

    return (
      <CardComponent
        ref={ref as any}
        className={cardStyles}
        {...(clickable && { type: 'button' })}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-sacred-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
        
        {header && (
          <div className={headerStyles}>
            {header}
          </div>
        )}
        
        {children && (
          <div className={contentPadding}>
            {children}
          </div>
        )}
        
        {footer && (
          <div className={footerStyles}>
            {footer}
          </div>
        )}
      </CardComponent>
    )
  }
)

Card.displayName = 'Card'

export { Card }