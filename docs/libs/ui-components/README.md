# @codex-metatron/ui-components

A Sacred Geometry-based UI component library built with React, TypeScript, and TailwindCSS. This library follows the golden ratio (φ = 1.618) for spacing, typography, and design principles.

## Features

- 🎨 **Sacred Geometry Design System** - All spacing and typography based on the golden ratio
- ⚛️ **React + TypeScript** - Fully typed components with excellent DX
- 🎯 **Atomic Design** - Organized following atomic design principles
- 🖌️ **TailwindCSS** - Utility-first styling with custom golden ratio classes
- 📦 **Tree Shakeable** - Import only what you need
- 🔧 **Customizable** - CSS variables for theming
- ♿ **Accessible** - WCAG 2.1 AA compliant components

## Installation

```bash
npm install @codex-metatron/ui-components
```

## Usage

```tsx
import { Button, Input, Text } from '@codex-metatron/ui-components';
import '@codex-metatron/ui-components/dist/styles.css';

function App() {
  return (
    <div>
      <Text variant="h1">Welcome</Text>
      <Input placeholder="Enter your email" />
      <Button variant="primary" size="md">
        Get Started
      </Button>
    </div>
  );
}
```

## Sacred Geometry Design System

### Spacing Scale

Based on the golden ratio (φ = 1.618):

- `gr-1`: 5px - Minimal spacing
- `gr-2`: 8px - Small spacing  
- `gr-3`: 13px - Medium spacing
- `gr-4`: 21px - Large spacing
- `gr-5`: 34px - Extra large spacing
- `gr-6`: 55px - Section spacing
- `gr-7`: 89px - Page section spacing
- `gr-8`: 144px - Hero spacing

### Typography Scale

- `gr-xs`: 10px - Small labels, captions
- `gr-sm`: 12px - Helper text
- `gr-base`: 16px - Body text, inputs
- `gr-md`: 20px - Small headings
- `gr-lg`: 26px - Subheadings
- `gr-xl`: 32px - Section headings
- `gr-2xl`: 42px - Page headings
- `gr-3xl`: 52px - Large headings
- `gr-4xl`: 68px - Hero text

### Container Widths

- `gr-sm`: 618px - φ × 400px (approx)
- `gr-md`: 1000px
- `gr-lg`: 1618px - φ × 1000px

## Components

### Atoms

- **Button** - Sacred geometry styled button with variants
- **Input** - Form input with validation states
- **Text** - Typography component with semantic variants
- **Icon** - Icon wrapper with consistent sizing

### Molecules

- **FormField** - Input with enhanced labeling and validation
- **SearchInput** - Search-specific input with clear functionality
- **ButtonGroup** - Grouped button layouts

### Organisms

Coming soon...

### Templates

Coming soon...

## Customization

Override CSS variables to customize colors:

```css
:root {
  --primary-500: 59 130 246; /* Blue */
  --secondary-500: 107 114 128; /* Gray */
}
```

## Development

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Build the library
npm run build

# Run tests
npm test

# Start Storybook
npm run storybook
```

## Contributing

1. Follow the Sacred Geometry design principles
2. Maintain atomic design organization
3. Include proper TypeScript types
4. Add tests for new components
5. Update documentation

## License

MIT License - see LICENSE file for details.