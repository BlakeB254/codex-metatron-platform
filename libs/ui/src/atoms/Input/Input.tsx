import React, { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { BaseComponentProps, InputVariant, SizeVariant, FormState } from '../../types'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    BaseComponentProps,
    FormState {
  variant?: InputVariant
  size?: SizeVariant
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'gr-md',
      fullWidth = false,
      isValid = false,
      isInvalid = false,
      isDisabled = false,
      isRequired = false,
      leftIcon,
      rightIcon,
      label,
      helperText,
      error,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputDisabled = disabled || isDisabled

    const containerStyles = cn(
      'relative flex items-center',
      {
        'w-full': fullWidth,
        'w-auto': !fullWidth,
      }
    )

    const inputStyles = cn(
      // Base styles
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400',
      
      // Size variants using sacred geometry
      {
        'px-gr-2 py-gr-1 text-gr-sm rounded-gr-sm': size === 'gr-sm',
        'px-gr-3 py-gr-2 text-gr-base rounded-gr-md': size === 'gr-md',
        'px-gr-4 py-gr-3 text-gr-lg rounded-gr-lg': size === 'gr-lg',
        'px-gr-5 py-gr-4 text-gr-xl rounded-gr-xl': size === 'gr-xl',
      },
      
      // Icon spacing
      {
        'pl-gr-8': leftIcon && size === 'gr-sm',
        'pl-gr-10': leftIcon && size === 'gr-md',
        'pl-gr-12': leftIcon && size === 'gr-lg',
        'pl-gr-14': leftIcon && size === 'gr-xl',
        'pr-gr-8': rightIcon && size === 'gr-sm',
        'pr-gr-10': rightIcon && size === 'gr-md',
        'pr-gr-12': rightIcon && size === 'gr-lg',
        'pr-gr-14': rightIcon && size === 'gr-xl',
      },
      
      // Width
      {
        'w-full': fullWidth,
        'w-auto': !fullWidth,
      },
      
      // Variant styles
      {
        // Default
        'border border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500': 
          variant === 'default' && !isInvalid && !isValid,
        
        // Filled
        'border-0 bg-gray-100 text-gray-900 hover:bg-gray-200 focus:bg-white focus:ring-blue-500': 
          variant === 'filled' && !isInvalid && !isValid,
        
        // Outline
        'border-2 border-gray-300 bg-transparent text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500': 
          variant === 'outline' && !isInvalid && !isValid,
        
        // Underline
        'border-0 border-b-2 border-gray-300 bg-transparent text-gray-900 rounded-none hover:border-gray-400 focus:border-blue-500 focus:ring-0': 
          variant === 'underline' && !isInvalid && !isValid,
      },
      
      // State styles
      {
        // Valid state
        'border-green-500 focus:border-green-500 focus:ring-green-500': isValid,
        
        // Invalid state
        'border-red-500 focus:border-red-500 focus:ring-red-500': isInvalid || error,
      },
      
      className
    )

    const iconStyles = cn(
      'absolute flex items-center justify-center text-gray-500 pointer-events-none',
      {
        'w-gr-6 h-gr-6': size === 'gr-sm',
        'w-gr-8 h-gr-8': size === 'gr-md',
        'w-gr-10 h-gr-10': size === 'gr-lg',
        'w-gr-12 h-gr-12': size === 'gr-xl',
      }
    )

    const leftIconStyles = cn(
      iconStyles,
      {
        'left-gr-2': size === 'gr-sm',
        'left-gr-3': size === 'gr-md',
        'left-gr-4': size === 'gr-lg',
        'left-gr-5': size === 'gr-xl',
      }
    )

    const rightIconStyles = cn(
      iconStyles,
      {
        'right-gr-2': size === 'gr-sm',
        'right-gr-3': size === 'gr-md',
        'right-gr-4': size === 'gr-lg',
        'right-gr-5': size === 'gr-xl',
      }
    )

    return (
      <div className={cn('space-y-gr-1', { 'w-full': fullWidth })}>
        {label && (
          <label className={cn(
            'block text-gr-sm font-medium text-gray-700',
            { 'after:content-["*"] after:text-red-500 after:ml-1': isRequired }
          )}>
            {label}
          </label>
        )}
        
        <div className={containerStyles}>
          {leftIcon && (
            <div className={leftIconStyles}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            disabled={inputDisabled}
            className={inputStyles}
            {...props}
          />
          
          {rightIcon && (
            <div className={rightIconStyles}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className={cn(
            'text-gr-sm',
            {
              'text-red-600': error,
              'text-gray-500': helperText && !error,
            }
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }