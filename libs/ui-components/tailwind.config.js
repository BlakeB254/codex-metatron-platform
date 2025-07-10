/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./stories/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Sacred Geometry Design System - Golden Ratio (φ = 1.618)
      spacing: {
        // Golden Ratio Spacing Scale
        'gr-1': '0.3125rem',    // 5px
        'gr-2': '0.5rem',       // 8px
        'gr-3': '0.8125rem',    // 13px
        'gr-4': '1.3125rem',    // 21px
        'gr-5': '2.125rem',     // 34px
        'gr-6': '3.4375rem',    // 55px
        'gr-7': '5.5625rem',    // 89px
        'gr-8': '9rem',         // 144px
      },
      fontSize: {
        // Sacred Geometry Typography Scale
        'gr-xs': ['0.625rem', { lineHeight: '1rem' }],      // 10px - Small labels, captions
        'gr-sm': ['0.75rem', { lineHeight: '1.25rem' }],    // 12px - Helper text
        'gr-base': ['1rem', { lineHeight: '1.625rem' }],    // 16px - Body text, inputs
        'gr-md': ['1.25rem', { lineHeight: '2rem' }],       // 20px - Small headings
        'gr-lg': ['1.625rem', { lineHeight: '2.625rem' }],  // 26px - Subheadings
        'gr-xl': ['2rem', { lineHeight: '3.25rem' }],       // 32px - Section headings
        'gr-2xl': ['2.625rem', { lineHeight: '4.25rem' }], // 42px - Page headings
        'gr-3xl': ['3.25rem', { lineHeight: '5.25rem' }],  // 52px - Large headings
        'gr-4xl': ['4.25rem', { lineHeight: '6.875rem' }], // 68px - Hero text
      },
      maxWidth: {
        // Sacred Geometry Container Widths
        'gr-sm': '38.625rem',   // 618px - φ × 400px (approx)
        'gr-md': '62.5rem',     // 1000px
        'gr-lg': '101.125rem',  // 1618px - φ × 1000px
      },
      borderRadius: {
        // Golden Ratio Border Radius
        'gr-sm': '0.3125rem',   // 5px
        'gr': '0.5rem',         // 8px
        'gr-md': '0.8125rem',   // 13px
        'gr-lg': '1.3125rem',   // 21px
      },
      colors: {
        // Base color system (to be extended by consuming apps)
        primary: {
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          200: 'rgb(var(--primary-200) / <alpha-value>)',
          300: 'rgb(var(--primary-300) / <alpha-value>)',
          400: 'rgb(var(--primary-400) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
          700: 'rgb(var(--primary-700) / <alpha-value>)',
          800: 'rgb(var(--primary-800) / <alpha-value>)',
          900: 'rgb(var(--primary-900) / <alpha-value>)',
          950: 'rgb(var(--primary-950) / <alpha-value>)',
        },
        secondary: {
          50: 'rgb(var(--secondary-50) / <alpha-value>)',
          100: 'rgb(var(--secondary-100) / <alpha-value>)',
          200: 'rgb(var(--secondary-200) / <alpha-value>)',
          300: 'rgb(var(--secondary-300) / <alpha-value>)',
          400: 'rgb(var(--secondary-400) / <alpha-value>)',
          500: 'rgb(var(--secondary-500) / <alpha-value>)',
          600: 'rgb(var(--secondary-600) / <alpha-value>)',
          700: 'rgb(var(--secondary-700) / <alpha-value>)',
          800: 'rgb(var(--secondary-800) / <alpha-value>)',
          900: 'rgb(var(--secondary-900) / <alpha-value>)',
          950: 'rgb(var(--secondary-950) / <alpha-value>)',
        },
      },
      animation: {
        // Sacred geometry animations
        'fade-in': 'fadeIn 0.618s ease-out',
        'slide-up': 'slideUp 0.618s ease-out',
        'scale-in': 'scaleIn 0.618s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(1.3125rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.618)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}