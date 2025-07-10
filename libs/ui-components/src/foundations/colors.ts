// Sacred Geometry Color System
// Base color tokens that can be customized by consuming applications

export const colorTokens = {
  // Primary color scale (Golden ratio inspired)
  primary: {
    50: 'var(--primary-50, #fef7ff)',
    100: 'var(--primary-100, #fbeaff)',
    200: 'var(--primary-200, #f5d0fe)',
    300: 'var(--primary-300, #eeaafd)',
    400: 'var(--primary-400, #e478fa)',
    500: 'var(--primary-500, #d946ef)',
    600: 'var(--primary-600, #c026d3)',
    700: 'var(--primary-700, #a21caf)',
    800: 'var(--primary-800, #86198f)',
    900: 'var(--primary-900, #701a75)',
    950: 'var(--primary-950, #4a044e)',
  },
  
  // Secondary color scale
  secondary: {
    50: 'var(--secondary-50, #f8fafc)',
    100: 'var(--secondary-100, #f1f5f9)',
    200: 'var(--secondary-200, #e2e8f0)',
    300: 'var(--secondary-300, #cbd5e1)',
    400: 'var(--secondary-400, #94a3b8)',
    500: 'var(--secondary-500, #64748b)',
    600: 'var(--secondary-600, #475569)',
    700: 'var(--secondary-700, #334155)',
    800: 'var(--secondary-800, #1e293b)',
    900: 'var(--secondary-900, #0f172a)',
    950: 'var(--secondary-950, #020617)',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#a16207',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    1000: '#000000',
  },
} as const;

export type ColorToken = keyof typeof colorTokens;
export type ColorShade = keyof typeof colorTokens.primary;