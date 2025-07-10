import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible text component with semantic HTML elements and sacred geometry typography.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body-large', 'body', 'body-small', 'caption', 'label'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'],
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
    truncate: {
      control: 'boolean',
    },
    italic: {
      control: 'boolean',
    },
    underline: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Text Stories
export const Body: Story = {
  args: {
    variant: 'body',
    children: 'This is body text using the sacred geometry typography scale.',
  },
};

export const BodyLarge: Story = {
  args: {
    variant: 'body-large',
    children: 'This is large body text for emphasis and readability.',
  },
};

export const BodySmall: Story = {
  args: {
    variant: 'body-small',
    children: 'This is small body text for supporting information.',
  },
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'This is caption text for annotations and metadata.',
  },
};

export const Label: Story = {
  args: {
    variant: 'label',
    children: 'This is label text for form elements.',
  },
};

// Heading Variants
export const Headings: Story = {
  render: () => (
    <div className="space-y-gr-4">
      <Text variant="h1">Heading 1 - Main Title</Text>
      <Text variant="h2">Heading 2 - Section Title</Text>
      <Text variant="h3">Heading 3 - Subsection</Text>
      <Text variant="h4">Heading 4 - Article Title</Text>
      <Text variant="h5">Heading 5 - Card Title</Text>
      <Text variant="h6">Heading 6 - Small Title</Text>
    </div>
  ),
};

// Color Variants
export const Colors: Story = {
  render: () => (
    <div className="space-y-gr-2">
      <Text color="primary">Primary colored text</Text>
      <Text color="secondary">Secondary colored text</Text>
      <Text color="success">Success colored text</Text>
      <Text color="warning">Warning colored text</Text>
      <Text color="danger">Danger colored text</Text>
      <Text color="info">Info colored text</Text>
      <Text color="neutral">Neutral colored text</Text>
    </div>
  ),
};

// Weight Variants
export const Weights: Story = {
  render: () => (
    <div className="space-y-gr-2">
      <Text weight="normal">Normal weight text</Text>
      <Text weight="medium">Medium weight text</Text>
      <Text weight="semibold">Semibold weight text</Text>
      <Text weight="bold">Bold weight text</Text>
    </div>
  ),
};

// Text Alignment
export const Alignment: Story = {
  render: () => (
    <div className="space-y-gr-4 w-96">
      <Text align="left">Left aligned text sits at the beginning of the container and flows naturally with the reading direction.</Text>
      <Text align="center">Center aligned text is positioned in the middle of the container and works well for titles and headers.</Text>
      <Text align="right">Right aligned text sits at the end of the container and is often used for labels or numerical data.</Text>
      <Text align="justify">Justified text stretches across the full width of the container with even spacing between words to create clean edges on both sides.</Text>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Text Styling
export const Styling: Story = {
  render: () => (
    <div className="space-y-gr-2">
      <Text>Regular text without any styling</Text>
      <Text italic>Italic text for emphasis</Text>
      <Text underline>Underlined text for links</Text>
      <Text italic underline>Combined italic and underlined</Text>
      <Text truncate className="w-48">This is a very long text that will be truncated when it exceeds the container width</Text>
    </div>
  ),
};

// Custom Elements
export const CustomElements: Story = {
  render: () => (
    <div className="space-y-gr-4">
      <Text as="div" variant="body">Text rendered as div element</Text>
      <Text as="span" variant="body">Text rendered as span element</Text>
      <Text as="strong" variant="body" weight="bold">Text rendered as strong element</Text>
      <Text as="em" variant="body" italic>Text rendered as em element</Text>
      <Text as="code" variant="body-small" className="bg-gray-100 px-2 py-1 rounded font-mono">
        Text rendered as code element
      </Text>
    </div>
  ),
};

// Real-world Examples
export const Article: Story = {
  render: () => (
    <article className="max-w-2xl space-y-gr-4">
      <Text variant="h1">Sacred Geometry in Design</Text>
      <Text variant="body-large" color="secondary">
        Exploring the mathematical principles that create harmonious and visually pleasing designs.
      </Text>
      
      <Text variant="h2">The Golden Ratio</Text>
      <Text variant="body">
        The golden ratio (φ = 1.618) appears frequently in nature and has been used in art and 
        architecture for centuries. This mathematical relationship creates proportions that are 
        naturally pleasing to the human eye.
      </Text>
      
      <Text variant="h3">Applications in UI Design</Text>
      <Text variant="body">
        By applying sacred geometry principles to spacing, typography, and layout, we can create 
        interfaces that feel balanced and harmonious. Our design system uses the golden ratio 
        to define spacing scales and typography hierarchies.
      </Text>
      
      <Text variant="caption" color="secondary">
        Published on Sacred Geometry Design System • 5 min read
      </Text>
    </article>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Typography Scale
export const TypographyScale: Story = {
  render: () => (
    <div className="space-y-gr-6">
      <div>
        <Text variant="h2">Sacred Geometry Typography Scale</Text>
        <Text variant="body" color="secondary">
          All text sizes follow the golden ratio for harmonious proportions
        </Text>
      </div>
      
      <div className="space-y-gr-4">
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">H1</Text>
          <Text variant="h1">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">H2</Text>
          <Text variant="h2">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">H3</Text>
          <Text variant="h3">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">H4</Text>
          <Text variant="h4">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">H5</Text>
          <Text variant="h5">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">H6</Text>
          <Text variant="h6">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">Body Large</Text>
          <Text variant="body-large">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">Body</Text>
          <Text variant="body">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">Body Small</Text>
          <Text variant="body-small">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">Caption</Text>
          <Text variant="caption">The quick brown fox</Text>
        </div>
        <div className="flex items-baseline gap-gr-4">
          <Text variant="caption" color="secondary" className="w-20">Label</Text>
          <Text variant="label">The quick brown fox</Text>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};