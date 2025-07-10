import { ReactNode } from 'react'

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
  'data-testid'?: string
}

// Theme variants
export type ThemeVariant = 'khemet' | 'emerald-tablets' | 'templar' | 'skybound' | 'sttc'

// Size variants based on sacred geometry
export type SizeVariant = 'gr-sm' | 'gr-md' | 'gr-lg' | 'gr-xl'

// Color variants
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'neutral'

// Button variants
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'link' 
  | 'danger'

// Input variants
export type InputVariant = 'default' | 'filled' | 'outline' | 'underline'

// Text variants
export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'body-large' 
  | 'body' 
  | 'body-small' 
  | 'caption' 
  | 'label'

// Loading states
export interface LoadingState {
  isLoading?: boolean
  loadingText?: string
}

// Form states
export interface FormState {
  isValid?: boolean
  isInvalid?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  error?: string
  helperText?: string
}

// Icon props
export interface IconProps extends BaseComponentProps {
  size?: SizeVariant | number
  color?: string
  strokeWidth?: number
}

// Animation variants
export type AnimationVariant = 'none' | 'fade' | 'slide' | 'bounce' | 'pulse' | 'spin'

// Responsive breakpoints
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Common event handlers
export interface CommonEventHandlers {
  onClick?: (event: React.MouseEvent) => void
  onMouseEnter?: (event: React.MouseEvent) => void
  onMouseLeave?: (event: React.MouseEvent) => void
  onFocus?: (event: React.FocusEvent) => void
  onBlur?: (event: React.FocusEvent) => void
}