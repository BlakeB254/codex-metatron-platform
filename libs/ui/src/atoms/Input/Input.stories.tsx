import type { Meta, StoryObj } from '@storybook/react';
import { Search, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with support for icons, validation states, and sacred geometry sizing.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'filled', 'outline', 'underline'],
    },
    size: {
      control: 'select',
      options: ['gr-sm', 'gr-md', 'gr-lg', 'gr-xl'],
    },
    fullWidth: {
      control: 'boolean',
    },
    isValid: {
      control: 'boolean',
    },
    isInvalid: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
    isRequired: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Input Stories
export const Default: Story = {
  args: {
    variant: 'default',
    placeholder: 'Enter text...',
    size: 'gr-md',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    placeholder: 'Enter text...',
    size: 'gr-md',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    placeholder: 'Enter text...',
    size: 'gr-md',
  },
};

export const Underline: Story = {
  args: {
    variant: 'underline',
    placeholder: 'Enter text...',
    size: 'gr-md',
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-gr-4 w-80">
      <Input size="gr-sm" placeholder="Small input" />
      <Input size="gr-md" placeholder="Medium input" />
      <Input size="gr-lg" placeholder="Large input" />
      <Input size="gr-xl" placeholder="Extra large input" />
    </div>
  ),
};

// With Labels
export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    size: 'gr-md',
  },
};

export const WithRequiredLabel: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    isRequired: true,
    size: 'gr-md',
  },
};

// With Helper Text
export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'Choose a username',
    helperText: 'Must be 3-20 characters long',
    size: 'gr-md',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search...',
    leftIcon: <Search size={20} />,
    size: 'gr-md',
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: 'Enter email',
    rightIcon: <Mail size={20} />,
    type: 'email',
    size: 'gr-md',
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: 'Search users...',
    leftIcon: <Search size={20} />,
    rightIcon: <Mail size={20} />,
    size: 'gr-md',
  },
};

// Validation States
export const Valid: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter email',
    value: 'user@example.com',
    isValid: true,
    helperText: 'Email is valid',
    size: 'gr-md',
  },
};

export const Invalid: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter email',
    value: 'invalid-email',
    isInvalid: true,
    error: 'Please enter a valid email address',
    size: 'gr-md',
  },
};

// Form Examples
export const LoginForm: Story = {
  render: () => (
    <div className="space-y-gr-4 w-80">
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        leftIcon={<Mail size={20} />}
        isRequired
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        leftIcon={<Lock size={20} />}
        rightIcon={<Eye size={20} />}
        isRequired
      />
    </div>
  ),
};

// Different Input Types
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-gr-4 w-80">
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="email@example.com" />
      <Input label="Password" type="password" placeholder="Password" />
      <Input label="Number" type="number" placeholder="123" />
      <Input label="Date" type="date" />
      <Input label="Time" type="time" />
      <Input label="URL" type="url" placeholder="https://example.com" />
      <Input label="Search" type="search" placeholder="Search..." />
    </div>
  ),
};

// Disabled State
export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    isDisabled: true,
    size: 'gr-md',
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'This input spans the full width',
    fullWidth: true,
    size: 'gr-md',
  },
  parameters: {
    layout: 'padded',
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-gr-6 w-96">
      <div className="space-y-gr-2">
        <h3 className="text-lg font-semibold">Variants</h3>
        <Input variant="default" placeholder="Default variant" />
        <Input variant="filled" placeholder="Filled variant" />
        <Input variant="outline" placeholder="Outline variant" />
        <Input variant="underline" placeholder="Underline variant" />
      </div>
      
      <div className="space-y-gr-2">
        <h3 className="text-lg font-semibold">With Icons</h3>
        <Input 
          variant="default" 
          placeholder="Search..." 
          leftIcon={<Search size={20} />} 
        />
        <Input 
          variant="filled" 
          placeholder="Email" 
          rightIcon={<Mail size={20} />} 
        />
      </div>
      
      <div className="space-y-gr-2">
        <h3 className="text-lg font-semibold">States</h3>
        <Input 
          placeholder="Valid input" 
          value="valid@email.com"
          isValid 
          helperText="Email is valid"
        />
        <Input 
          placeholder="Invalid input" 
          value="invalid"
          isInvalid 
          error="This field is required"
        />
        <Input 
          placeholder="Disabled input" 
          isDisabled 
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};