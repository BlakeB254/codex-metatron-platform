// Sacred Geometry Spacing System
// Golden Ratio (φ = 1.618) based spacing scale

export const spacing = {
  // Golden Ratio spacing progression
  'gr-1': '0.3125rem',    // 5px  - Minimal spacing
  'gr-2': '0.5rem',       // 8px  - Small spacing
  'gr-3': '0.8125rem',    // 13px - Medium spacing
  'gr-4': '1.3125rem',    // 21px - Large spacing
  'gr-5': '2.125rem',     // 34px - Extra large spacing
  'gr-6': '3.4375rem',    // 55px - Section spacing
  'gr-7': '5.5625rem',    // 89px - Page section spacing
  'gr-8': '9rem',         // 144px - Hero spacing
} as const;

export const containers = {
  // Sacred geometry container widths
  'gr-sm': '38.625rem',   // 618px - φ × 400px (approx)
  'gr-md': '62.5rem',     // 1000px
  'gr-lg': '101.125rem',  // 1618px - φ × 1000px
} as const;

export const borderRadius = {
  // Golden ratio border radius
  'gr-sm': '0.3125rem',   // 5px
  'gr': '0.5rem',         // 8px
  'gr-md': '0.8125rem',   // 13px
  'gr-lg': '1.3125rem',   // 21px
} as const;

export type SpacingToken = keyof typeof spacing;
export type ContainerToken = keyof typeof containers;
export type BorderRadiusToken = keyof typeof borderRadius;