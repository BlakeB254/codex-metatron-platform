import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { BaseComponentProps, ButtonVariant, SizeVariant, LoadingState } from '../../types'

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    BaseComponentProps,
    LoadingState {
  variant?: ButtonVariant
  size?: SizeVariant
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  as?: React.ElementType
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'gr-md',
      fullWidth = false,
      isLoading = false,
      loadingText = 'Loading...',
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    const baseStyles = cn(
      // Base styles
      'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
      
      // Size variants using sacred geometry
      {
        'px-gr-2 py-gr-1 text-gr-sm rounded-gr-sm gap-gr-1': size === 'gr-sm',
        'px-gr-3 py-gr-2 text-gr-base rounded-gr-md gap-gr-2': size === 'gr-md',
        'px-gr-4 py-gr-3 text-gr-lg rounded-gr-lg gap-gr-2': size === 'gr-lg',
        'px-gr-5 py-gr-4 text-gr-xl rounded-gr-xl gap-gr-3': size === 'gr-xl',
      },
      
      // Width
      {
        'w-full': fullWidth,
        'w-auto': !fullWidth,
      },
      
      // Variant styles
      {
        // Primary
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800': 
          variant === 'primary',
        
        // Secondary
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400': 
          variant === 'secondary',
        
        // Outline
        'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100': 
          variant === 'outline',
        
        // Ghost
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200': 
          variant === 'ghost',
        
        // Link
        'text-blue-600 hover:text-blue-800 focus:ring-blue-500 underline-offset-4 hover:underline': 
          variant === 'link',
        
        // Danger
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800': 
          variant === 'danger',
      },
      
      className
    )

    const content = (
      <>
        {leftIcon && !isLoading && (
          <span className="shrink-0">{leftIcon}</span>
        )}
        
        {isLoading && (
          <span className="shrink-0 animate-sacred-spin">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        <span className={cn(
          'transition-all duration-200',
          { 'opacity-0': isLoading && loadingText !== children }
        )}>
          {isLoading && loadingText ? loadingText : children}
        </span>
        
        {rightIcon && !isLoading && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </>
    )

    return (
      <Component
        ref={ref}
        disabled={isDisabled}
        className={baseStyles}
        {...props}
      >
        {content}
      </Component>
    )
  }
)

Button.displayName = 'Button'

export { Button }