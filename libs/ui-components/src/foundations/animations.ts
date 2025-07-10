// Sacred Geometry Animation System
// Golden ratio timing and easing

export const animations = {
  // Sacred geometry timing (based on φ)
  'fade-in': 'fadeIn 0.618s ease-out',
  'slide-up': 'slideUp 0.618s ease-out',
  'scale-in': 'scaleIn 0.618s ease-out',
  'slide-down': 'slideDown 0.618s ease-out',
  'slide-left': 'slideLeft 0.618s ease-out',
  'slide-right': 'slideRight 0.618s ease-out',
} as const;

export const durations = {
  fast: '0.236s',      // φ⁻² ≈ 0.236
  normal: '0.382s',    // φ⁻¹ ≈ 0.382  
  slow: '0.618s',      // φ⁻¹ × φ ≈ 0.618
  slower: '1s',        // φ⁻¹ × φ² ≈ 1
} as const;

export const easings = {
  linear: 'linear',
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export type AnimationToken = keyof typeof animations;
export type DurationToken = keyof typeof durations;
export type EasingToken = keyof typeof easings;