// Sacred Geometry Typography System
// Golden Ratio inspired type scale

export const typography = {
  // Sacred geometry font sizes
  'gr-xs': ['0.625rem', { lineHeight: '1rem' }],      // 10px - Small labels, captions
  'gr-sm': ['0.75rem', { lineHeight: '1.25rem' }],    // 12px - Helper text
  'gr-base': ['1rem', { lineHeight: '1.625rem' }],    // 16px - Body text, inputs
  'gr-md': ['1.25rem', { lineHeight: '2rem' }],       // 20px - Small headings
  'gr-lg': ['1.625rem', { lineHeight: '2.625rem' }],  // 26px - Subheadings
  'gr-xl': ['2rem', { lineHeight: '3.25rem' }],       // 32px - Section headings
  'gr-2xl': ['2.625rem', { lineHeight: '4.25rem' }], // 42px - Page headings
  'gr-3xl': ['3.25rem', { lineHeight: '5.25rem' }],  // 52px - Large headings
  'gr-4xl': ['4.25rem', { lineHeight: '6.875rem' }], // 68px - Hero text
} as const;

export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const fontFamilies = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  serif: ['Georgia', 'serif'],
  mono: ['Monaco', 'Consolas', 'monospace'],
} as const;

export type TypographyToken = keyof typeof typography;
export type FontWeightToken = keyof typeof fontWeights;
export type FontFamilyToken = keyof typeof fontFamilies;