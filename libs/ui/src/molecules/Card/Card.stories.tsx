import type { Meta, StoryObj } from '@storybook/react';
import { Settings, User, Heart, Star, MoreVertical } from 'lucide-react';
import { Card } from './Card';
import { Button } from '../../atoms/Button/Button';
import { Text } from '../../atoms/Text/Text';
import { Icon } from '../../atoms/Icon/Icon';

const meta: Meta<typeof Card> = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections using sacred geometry principles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'elevated', 'filled'],
    },
    size: {
      control: 'select',
      options: ['gr-sm', 'gr-md', 'gr-lg', 'gr-xl'],
    },
    hoverable: {
      control: 'boolean',
    },
    clickable: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Card Stories
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'gr-md',
    children: (
      <div>
        <Text variant="h3" className="mb-gr-2">Card Title</Text>
        <Text variant="body" color="secondary">
          This is a basic card with default styling. It includes a shadow and border for subtle elevation.
        </Text>
      </div>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    size: 'gr-md',
    children: (
      <div>
        <Text variant="h3" className="mb-gr-2">Outlined Card</Text>
        <Text variant="body" color="secondary">
          This card uses a thicker border instead of a shadow for definition.
        </Text>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    size: 'gr-md',
    children: (
      <div>
        <Text variant="h3" className="mb-gr-2">Elevated Card</Text>
        <Text variant="body" color="secondary">
          This card has a larger shadow for more pronounced elevation.
        </Text>
      </div>
    ),
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    size: 'gr-md',
    children: (
      <div>
        <Text variant="h3" className="mb-gr-2">Filled Card</Text>
        <Text variant="body" color="secondary">
          This card has a subtle background fill instead of a white background.
        </Text>
      </div>
    ),
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-gr-4">
      <Card size="gr-sm" variant="default">
        <Text variant="h5">Small Card</Text>
        <Text variant="body-small" color="secondary">Compact spacing</Text>
      </Card>
      <Card size="gr-md" variant="default">
        <Text variant="h4">Medium Card</Text>
        <Text variant="body" color="secondary">Standard spacing</Text>
      </Card>
      <Card size="gr-lg" variant="default">
        <Text variant="h3">Large Card</Text>
        <Text variant="body-large" color="secondary">Generous spacing</Text>
      </Card>
      <Card size="gr-xl" variant="default">
        <Text variant="h2">Extra Large</Text>
        <Text variant="body-large" color="secondary">Maximum spacing</Text>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// With Header and Footer
export const WithHeaderAndFooter: Story = {
  args: {
    variant: 'default',
    size: 'gr-md',
    header: (
      <div className="flex items-center justify-between">
        <Text variant="h4">Card with Header</Text>
        <Icon icon={MoreVertical} size="gr-sm" />
      </div>
    ),
    footer: (
      <div className="flex gap-gr-2">
        <Button size="gr-sm" variant="primary">Accept</Button>
        <Button size="gr-sm" variant="outline">Cancel</Button>
      </div>
    ),
    children: (
      <Text variant="body" color="secondary">
        This card demonstrates the use of header and footer sections with proper spacing and borders.
      </Text>
    ),
  },
};

// Interactive States
export const Hoverable: Story = {
  args: {
    variant: 'default',
    size: 'gr-md',
    hoverable: true,
    children: (
      <div>
        <Text variant="h3" className="mb-gr-2">Hoverable Card</Text>
        <Text variant="body" color="secondary">
          Hover over this card to see the elevation and scale effect.
        </Text>
      </div>
    ),
  },
};

export const Clickable: Story = {
  args: {
    variant: 'default',
    size: 'gr-md',
    clickable: true,
    onClick: () => alert('Card clicked!'),
    children: (
      <div>
        <Text variant="h3" className="mb-gr-2">Clickable Card</Text>
        <Text variant="body" color="secondary">
          This card is clickable and includes focus states for accessibility.
        </Text>
      </div>
    ),
  },
};

// Loading State
export const Loading: Story = {
  args: {
    variant: 'default',
    size: 'gr-md',
    loading: true,
    children: (
      <div>
        <Text variant="h3" className="mb-gr-2">Loading Card</Text>
        <Text variant="body" color="secondary">
          This card shows a loading overlay with spinner.
        </Text>
      </div>
    ),
  },
};

// Real-world Examples
export const UserProfile: Story = {
  render: () => (
    <Card 
      variant="default" 
      size="gr-md"
      header={
        <div className="flex items-center gap-gr-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Icon icon={User} color="white" size="gr-sm" />
          </div>
          <div>
            <Text variant="h5">John Doe</Text>
            <Text variant="caption" color="secondary">@johndoe</Text>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between items-center">
          <div className="flex gap-gr-4">
            <div className="flex items-center gap-gr-1">
              <Icon icon={Heart} size="gr-sm" color="danger" />
              <Text variant="caption">24</Text>
            </div>
            <div className="flex items-center gap-gr-1">
              <Icon icon={Star} size="gr-sm" color="warning" />
              <Text variant="caption">4.8</Text>
            </div>
          </div>
          <Button size="gr-sm" variant="outline">Follow</Button>
        </div>
      }
    >
      <Text variant="body" color="secondary">
        Frontend developer passionate about creating beautiful and functional user interfaces. 
        Loves working with React, TypeScript, and modern design systems.
      </Text>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card 
      variant="default" 
      size="gr-md"
      hoverable
      className="w-64"
    >
      <div className="aspect-video bg-gray-200 rounded-gr-md mb-gr-3 flex items-center justify-center">
        <Text variant="caption" color="secondary">Product Image</Text>
      </div>
      <div className="space-y-gr-2">
        <Text variant="h4">Wireless Headphones</Text>
        <Text variant="body" color="secondary">
          Premium quality wireless headphones with noise cancellation.
        </Text>
        <div className="flex items-center justify-between pt-gr-2">
          <Text variant="h5" color="primary">$99.99</Text>
          <Button size="gr-sm" variant="primary">Add to Cart</Button>
        </div>
      </div>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-gr-4">
      <Card variant="default" size="gr-md">
        <div className="text-center">
          <Text variant="h2" color="primary">1,234</Text>
          <Text variant="label" color="secondary">Total Users</Text>
        </div>
      </Card>
      <Card variant="default" size="gr-md">
        <div className="text-center">
          <Text variant="h2" color="success">98.5%</Text>
          <Text variant="label" color="secondary">Uptime</Text>
        </div>
      </Card>
      <Card variant="default" size="gr-md">
        <div className="text-center">
          <Text variant="h2" color="warning">$12.5K</Text>
          <Text variant="label" color="secondary">Revenue</Text>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const SettingsCard: Story = {
  render: () => (
    <Card 
      variant="default" 
      size="gr-md"
      className="w-80"
      header={
        <div className="flex items-center gap-gr-2">
          <Icon icon={Settings} size="gr-sm" />
          <Text variant="h4">Settings</Text>
        </div>
      }
    >
      <div className="space-y-gr-4">
        <div className="flex items-center justify-between">
          <Text variant="body">Dark Mode</Text>
          <Button size="gr-sm" variant="outline">Toggle</Button>
        </div>
        <div className="flex items-center justify-between">
          <Text variant="body">Notifications</Text>
          <Button size="gr-sm" variant="outline">Enable</Button>
        </div>
        <div className="flex items-center justify-between">
          <Text variant="body">Auto-save</Text>
          <Button size="gr-sm" variant="primary">On</Button>
        </div>
      </div>
    </Card>
  ),
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-gr-4">
      <Card variant="default">
        <Text variant="h5" className="mb-gr-2">Default</Text>
        <Text variant="body-small" color="secondary">Subtle shadow and border</Text>
      </Card>
      <Card variant="outlined">
        <Text variant="h5" className="mb-gr-2">Outlined</Text>
        <Text variant="body-small" color="secondary">Prominent border</Text>
      </Card>
      <Card variant="elevated">
        <Text variant="h5" className="mb-gr-2">Elevated</Text>
        <Text variant="body-small" color="secondary">Large shadow</Text>
      </Card>
      <Card variant="filled">
        <Text variant="h5" className="mb-gr-2">Filled</Text>
        <Text variant="body-small" color="secondary">Background fill</Text>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};