import React, { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { BaseComponentProps, SizeVariant, ColorVariant } from '../../types'

export interface IconProps extends BaseComponentProps {
  icon: LucideIcon
  size?: SizeVariant | number
  color?: ColorVariant | string
  strokeWidth?: number
  spin?: boolean
  pulse?: boolean
  className?: string
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon: IconComponent,
      size = 'gr-md',
      color = 'neutral',
      strokeWidth = 2,
      spin = false,
      pulse = false,
      className,
      ...props
    },
    ref
  ) => {
    const getSizeClass = (size: SizeVariant | number): string => {
      if (typeof size === 'number') {
        return `w-[${size}px] h-[${size}px]`
      }
      
      switch (size) {
        case 'gr-sm':
          return 'w-gr-3 h-gr-3' // 13px
        case 'gr-md':
          return 'w-gr-4 h-gr-4' // 21px
        case 'gr-lg':
          return 'w-gr-5 h-gr-5' // 34px
        case 'gr-xl':
          return 'w-gr-6 h-gr-6' // 55px
        default:
          return 'w-gr-4 h-gr-4' // 21px
      }
    }

    const getColorClass = (color: ColorVariant | string): string => {
      if (typeof color === 'string' && color.startsWith('#')) {
        return `text-[${color}]`
      }
      
      if (typeof color === 'string' && !['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'].includes(color)) {
        return `text-${color}`
      }
      
      switch (color) {
        case 'primary':
          return 'text-blue-600'
        case 'secondary':
          return 'text-gray-600'
        case 'success':
          return 'text-green-600'
        case 'warning':
          return 'text-yellow-600'
        case 'danger':
          return 'text-red-600'
        case 'info':
          return 'text-blue-500'
        case 'neutral':
          return 'text-gray-900'
        default:
          return 'text-gray-900'
      }
    }

    const iconStyles = cn(
      // Base styles
      'flex-shrink-0',
      
      // Size
      getSizeClass(size),
      
      // Color
      getColorClass(color),
      
      // Animations
      {
        'animate-sacred-spin': spin,
        'animate-golden-pulse': pulse,
      },
      
      className
    )

    return (
      <IconComponent
        ref={ref}
        className={iconStyles}
        strokeWidth={strokeWidth}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'

export { Icon }