import React, { forwardRef, HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { BaseComponentProps, ColorVariant, SizeVariant } from '../../types'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, BaseComponentProps {
  variant?: 'default' | 'solid' | 'outline' | 'soft'
  color?: ColorVariant
  size?: SizeVariant
  dot?: boolean
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      color = 'neutral',
      size = 'gr-md',
      dot = false,
      icon,
      removable = false,
      onRemove,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const badgeStyles = cn(
      // Base styles
      'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out',
      'whitespace-nowrap',
      
      // Size variants using sacred geometry
      {
        'px-gr-1 py-0.5 text-gr-xs rounded-gr-sm gap-gr-1 min-h-[1rem]': size === 'gr-sm',
        'px-gr-2 py-gr-1 text-gr-sm rounded-gr-md gap-gr-1 min-h-[1.25rem]': size === 'gr-md',
        'px-gr-3 py-gr-2 text-gr-base rounded-gr-lg gap-gr-2 min-h-[1.5rem]': size === 'gr-lg',
        'px-gr-4 py-gr-2 text-gr-lg rounded-gr-xl gap-gr-2 min-h-[2rem]': size === 'gr-xl',
      },
      
      // Dot badge specific styles
      {
        'w-gr-2 h-gr-2 p-0 rounded-full': dot && size === 'gr-sm',
        'w-gr-3 h-gr-3 p-0 rounded-full': dot && size === 'gr-md',
        'w-gr-4 h-gr-4 p-0 rounded-full': dot && size === 'gr-lg',
        'w-gr-5 h-gr-5 p-0 rounded-full': dot && size === 'gr-xl',
      },
      
      // Color and variant combinations
      {
        // Default variant
        'bg-gray-100 text-gray-800 border border-gray-200': 
          variant === 'default' && color === 'neutral',
        'bg-blue-50 text-blue-800 border border-blue-200': 
          variant === 'default' && color === 'primary',
        'bg-gray-50 text-gray-600 border border-gray-200': 
          variant === 'default' && color === 'secondary',
        'bg-green-50 text-green-800 border border-green-200': 
          variant === 'default' && color === 'success',
        'bg-yellow-50 text-yellow-800 border border-yellow-200': 
          variant === 'default' && color === 'warning',
        'bg-red-50 text-red-800 border border-red-200': 
          variant === 'default' && color === 'danger',
        'bg-blue-50 text-blue-700 border border-blue-200': 
          variant === 'default' && color === 'info',
        
        // Solid variant
        'bg-gray-600 text-white border border-gray-600': 
          variant === 'solid' && color === 'neutral',
        'bg-blue-600 text-white border border-blue-600': 
          variant === 'solid' && color === 'primary',
        'bg-gray-500 text-white border border-gray-500': 
          variant === 'solid' && color === 'secondary',
        'bg-green-600 text-white border border-green-600': 
          variant === 'solid' && color === 'success',
        'bg-yellow-500 text-white border border-yellow-500': 
          variant === 'solid' && color === 'warning',
        'bg-red-600 text-white border border-red-600': 
          variant === 'solid' && color === 'danger',
        'bg-blue-500 text-white border border-blue-500': 
          variant === 'solid' && color === 'info',
        
        // Outline variant
        'bg-transparent text-gray-700 border border-gray-400': 
          variant === 'outline' && color === 'neutral',
        'bg-transparent text-blue-700 border border-blue-400': 
          variant === 'outline' && color === 'primary',
        'bg-transparent text-gray-600 border border-gray-400': 
          variant === 'outline' && color === 'secondary',
        'bg-transparent text-green-700 border border-green-400': 
          variant === 'outline' && color === 'success',
        'bg-transparent text-yellow-700 border border-yellow-400': 
          variant === 'outline' && color === 'warning',
        'bg-transparent text-red-700 border border-red-400': 
          variant === 'outline' && color === 'danger',
        'bg-transparent text-blue-600 border border-blue-400': 
          variant === 'outline' && color === 'info',
        
        // Soft variant
        'bg-gray-100 text-gray-700 border-0': 
          variant === 'soft' && color === 'neutral',
        'bg-blue-100 text-blue-700 border-0': 
          variant === 'soft' && color === 'primary',
        'bg-gray-100 text-gray-600 border-0': 
          variant === 'soft' && color === 'secondary',
        'bg-green-100 text-green-700 border-0': 
          variant === 'soft' && color === 'success',
        'bg-yellow-100 text-yellow-700 border-0': 
          variant === 'soft' && color === 'warning',
        'bg-red-100 text-red-700 border-0': 
          variant === 'soft' && color === 'danger',
        'bg-blue-100 text-blue-600 border-0': 
          variant === 'soft' && color === 'info',
      },
      
      className
    )

    const removeButtonStyles = cn(
      'ml-gr-1 hover:bg-black/10 rounded-full p-0.5 transition-colors duration-200',
      'focus:outline-none focus:bg-black/20',
      {
        'w-gr-3 h-gr-3': size === 'gr-sm',
        'w-gr-4 h-gr-4': size === 'gr-md',
        'w-gr-5 h-gr-5': size === 'gr-lg',
        'w-gr-6 h-gr-6': size === 'gr-xl',
      }
    )

    // For dot badges, don't render children
    if (dot) {
      return (
        <span
          ref={ref}
          className={badgeStyles}
          {...props}
        />
      )
    }

    return (
      <span
        ref={ref}
        className={badgeStyles}
        {...props}
      >
        {icon && (
          <span className="shrink-0">
            {icon}
          </span>
        )}
        
        {children && (
          <span className="truncate">
            {children}
          </span>
        )}
        
        {removable && onRemove && (
          <button
            type="button"
            className={removeButtonStyles}
            onClick={onRemove}
            aria-label="Remove badge"
          >
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }