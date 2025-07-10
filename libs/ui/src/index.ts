// Main entry point for Codex Metatron UI Library
// Exports all components, types, and utilities

// Atoms (Basic building blocks)
export * from './atoms'

// Molecules (Combined atoms)
export * from './molecules'

// Types
export * from './types'

// Utilities
export { cn } from './utils/cn'

// Re-export commonly used types for convenience
export type {
  BaseComponentProps,
  ThemeVariant,
  SizeVariant,
  ColorVariant,
  ButtonVariant,
  InputVariant,
  TextVariant,
  LoadingState,
  FormState,
  IconProps,
  AnimationVariant,
  Breakpoint,
  CommonEventHandlers
} from './types'

// Component aliases for backward compatibility
export { Badge as StatusBadge } from './atoms/Badge'

// Version info (should be updated with package.json)
export const VERSION = '1.0.0'