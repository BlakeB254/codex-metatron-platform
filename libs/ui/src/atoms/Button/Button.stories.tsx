import type { Meta, StoryObj } from '@storybook/react';
import { Search, Download, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component built with sacred geometry principles and Tailwind CSS.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger'],
    },
    size: {
      control: 'select',
      options: ['gr-sm', 'gr-md', 'gr-lg', 'gr-xl'],
    },
    fullWidth: {
      control: 'boolean',
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Button Stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    size: 'gr-md',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
    size: 'gr-md',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
    size: 'gr-md',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
    size: 'gr-md',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
    size: 'gr-md',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
    size: 'gr-md',
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-gr-4">
      <Button size="gr-sm" variant="primary">Small</Button>
      <Button size="gr-md" variant="primary">Medium</Button>
      <Button size="gr-lg" variant="primary">Large</Button>
      <Button size="gr-xl" variant="primary">Extra Large</Button>
    </div>
  ),
};

// Loading States
export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Submit',
    isLoading: true,
    loadingText: 'Submitting...',
    size: 'gr-md',
  },
};

export const LoadingWithoutText: Story = {
  args: {
    variant: 'primary',
    children: 'Submit',
    isLoading: true,
    size: 'gr-md',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Search',
    leftIcon: <Search size={16} />,
    size: 'gr-md',
  },
};

export const WithRightIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Download',
    rightIcon: <Download size={16} />,
    size: 'gr-md',
  },
};

export const WithBothIcons: Story = {
  args: {
    variant: 'primary',
    children: 'Add Item',
    leftIcon: <Plus size={16} />,
    rightIcon: <Download size={16} />,
    size: 'gr-md',
  },
};

// Icon Only Buttons
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-gr-2">
      <Button variant="primary" size="gr-sm" aria-label="Add">
        <Plus size={16} />
      </Button>
      <Button variant="outline" size="gr-md" aria-label="Search">
        <Search size={20} />
      </Button>
      <Button variant="danger" size="gr-lg" aria-label="Delete">
        <Trash2 size={24} />
      </Button>
    </div>
  ),
};

// Full Width
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Full Width Button',
    fullWidth: true,
    size: 'gr-md',
  },
  parameters: {
    layout: 'padded',
  },
};

// Disabled States
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-gr-4">
      <div className="flex gap-gr-2">
        <Button variant="primary" disabled>Primary Disabled</Button>
        <Button variant="secondary" disabled>Secondary Disabled</Button>
        <Button variant="outline" disabled>Outline Disabled</Button>
      </div>
      <div className="flex gap-gr-2">
        <Button variant="ghost" disabled>Ghost Disabled</Button>
        <Button variant="link" disabled>Link Disabled</Button>
        <Button variant="danger" disabled>Danger Disabled</Button>
      </div>
    </div>
  ),
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-gr-4">
      <div className="grid grid-cols-3 gap-gr-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div className="grid grid-cols-3 gap-gr-2">
        <Button variant="primary" leftIcon={<Plus size={16} />}>With Icon</Button>
        <Button variant="secondary" isLoading>Loading</Button>
        <Button variant="outline" disabled>Disabled</Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};