/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./stories/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Sacred Geometry Spacing Scale (Golden Ratio Based)
      spacing: {
        'gr-1': '0.3125rem',  // 5px
        'gr-2': '0.5rem',     // 8px
        'gr-3': '0.8125rem',  // 13px
        'gr-4': '1.3125rem',  // 21px
        'gr-5': '2.125rem',   // 34px
        'gr-6': '3.4375rem',  // 55px
        'gr-7': '5.5625rem',  // 89px
        'gr-8': '9rem',       // 144px
      },
      // Sacred Geometry Typography Scale
      fontSize: {
        'gr-xs': ['0.625rem', { lineHeight: '1rem' }],      // 10px
        'gr-sm': ['0.75rem', { lineHeight: '1.25rem' }],    // 12px
        'gr-base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
        'gr-lg': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        'gr-xl': ['1.625rem', { lineHeight: '2rem' }],      // 26px
        'gr-2xl': ['2rem', { lineHeight: '2.5rem' }],       // 32px
        'gr-3xl': ['2.625rem', { lineHeight: '3rem' }],     // 42px
        'gr-4xl': ['3.25rem', { lineHeight: '3.5rem' }],    // 52px
        'gr-5xl': ['4.25rem', { lineHeight: '4.5rem' }],    // 68px
      },
      // Sacred Geometry Container Widths
      maxWidth: {
        'gr-narrow': '38.625rem',  // 618px
        'gr-medium': '62.5rem',    // 1000px
        'gr-wide': '101.125rem',   // 1618px
      },
      // Golden Ratio Proportions
      aspectRatio: {
        'golden': '1.618',
        'golden-inverse': '0.618',
      },
      // Theme Colors
      colors: {
        // Ancient Khemet Theme (Egyptian Gold)
        'khemet': {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Emerald Tablets Theme (Mystical Green)
        'emerald-tablets': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Knights Templar Theme (Medieval Red)
        'templar': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Skybound Theme (Celestial Blue)
        'skybound': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // STTC Theme (Modern Tech Gray)
        'sttc': {
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
        },
      },
      // Sacred Geometry Animations
      animation: {
        'golden-pulse': 'golden-pulse 1.618s ease-in-out infinite',
        'sacred-spin': 'sacred-spin 1.618s linear infinite',
        'fibonacci-bounce': 'fibonacci-bounce 0.618s ease-in-out',
      },
      keyframes: {
        'golden-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.618' },
        },
        'sacred-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fibonacci-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-0.618rem)' },
        },
      },
      // Sacred Geometry Shadows
      boxShadow: {
        'gr-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'gr-md': '0 4px 8px -2px rgba(0, 0, 0, 0.1)',
        'gr-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'gr-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'gr-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'gr-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      // Sacred Geometry Border Radius
      borderRadius: {
        'gr-sm': '0.3125rem',  // 5px
        'gr-md': '0.5rem',     // 8px
        'gr-lg': '0.8125rem',  // 13px
        'gr-xl': '1.3125rem',  // 21px
        'gr-2xl': '2.125rem',  // 34px
      },
    },
  },
  plugins: [
    // Custom plugin for sacred geometry utilities
    function({ addUtilities }) {
      const newUtilities = {
        // Golden Ratio Aspect Ratios
        '.aspect-golden': {
          'aspect-ratio': '1.618',
        },
        '.aspect-golden-inverse': {
          'aspect-ratio': '0.618',
        },
        // Sacred Geometry Flex Utilities
        '.flex-golden': {
          'flex': '1.618',
        },
        '.flex-golden-inverse': {
          'flex': '0.618',
        },
        // Sacred Geometry Grid Utilities
        '.grid-golden': {
          'grid-template-columns': '1fr 1.618fr',
        },
        '.grid-golden-inverse': {
          'grid-template-columns': '1.618fr 1fr',
        },
        // Sacred Geometry Transform Utilities
        '.scale-golden': {
          'transform': 'scale(1.618)',
        },
        '.scale-golden-inverse': {
          'transform': 'scale(0.618)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}