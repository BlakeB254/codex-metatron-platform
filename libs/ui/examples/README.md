# Component Examples

This directory contains comprehensive examples of all UI components in the Codex Metatron UI library.

## Files

- `component-examples.tsx` - Complete showcase of all atomic components with interactive examples

## Usage

The examples demonstrate:

### Button Component
- All variants: primary, secondary, outline, ghost, link, danger
- Sacred geometry sizes: gr-sm, gr-md, gr-lg, gr-xl
- Loading states and icons
- Full width options

### Input Component  
- Variants: default, filled, outline, underline
- Types: text, email, password, search
- Icons, labels, helper text, and error states
- Form validation states

### Badge Component
- Variants: default, solid, outline, soft
- All color variants: neutral, primary, secondary, success, warning, danger, info
- Dot badges for status indicators
- Removable badges with icons

### Card Component
- Variants: default, outlined, elevated, filled
- Header and footer sections
- Interactive states: hoverable, clickable, loading
- Sacred geometry sizing

### Text Component
- Complete typography hierarchy (h1-h6, body variants, caption, label)
- Color variants and font weights
- Text alignment and styling options
- Custom HTML element rendering

### Icon Component
- Sacred geometry sizing system
- Color variants and custom colors
- Stroke width customization
- Animations (spin, pulse)
- Integration with other components

## Sacred Geometry Design System

All components follow the sacred geometry spacing scale:
- gr-1: 5px
- gr-2: 8px  
- gr-3: 13px
- gr-4: 21px
- gr-5: 34px
- gr-6: 55px
- gr-7: 89px
- gr-8: 144px

Typography scale based on golden ratio proportions for optimal visual harmony.

## Running Examples

To use these examples in your application:

```tsx
import { ComponentShowcase } from '@codex-metatron/ui/examples/component-examples'

// Use the complete showcase
<ComponentShowcase />

// Or use individual example components
import { ButtonExamples, InputExamples } from '@codex-metatron/ui/examples/component-examples'
```

Each example component is self-contained and demonstrates best practices for component usage.