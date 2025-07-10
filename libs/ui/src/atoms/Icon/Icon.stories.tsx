import type { Meta, StoryObj } from '@storybook/react';
import { 
  Search, Mail, Lock, Settings, Heart, Star, Home, User, 
  Phone, Calendar, Map, Camera, Bell, Download, Upload,
  Edit, Trash2, Plus, Minus, Check, X, ChevronDown,
  ArrowLeft, ArrowRight, Play, Pause, Volume2, Wifi
} from 'lucide-react';
import { Icon } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible icon component using Lucide React icons with sacred geometry sizing and color variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
    },
    size: {
      control: 'select',
      options: ['gr-sm', 'gr-md', 'gr-lg', 'gr-xl'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'],
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.5 },
    },
    spin: {
      control: 'boolean',
    },
    pulse: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Icon Stories
export const Default: Story = {
  args: {
    icon: Search,
    size: 'gr-md',
    color: 'neutral',
  },
};

export const Primary: Story = {
  args: {
    icon: Heart,
    size: 'gr-md',
    color: 'primary',
  },
};

export const Success: Story = {
  args: {
    icon: Check,
    size: 'gr-md',
    color: 'success',
  },
};

export const Danger: Story = {
  args: {
    icon: X,
    size: 'gr-md',
    color: 'danger',
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-gr-4">
      <Icon icon={Star} size="gr-sm" />
      <Icon icon={Star} size="gr-md" />
      <Icon icon={Star} size="gr-lg" />
      <Icon icon={Star} size="gr-xl" />
    </div>
  ),
};

// Color Variants
export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-gr-4">
      <Icon icon={Heart} color="primary" />
      <Icon icon={Heart} color="secondary" />
      <Icon icon={Heart} color="success" />
      <Icon icon={Heart} color="warning" />
      <Icon icon={Heart} color="danger" />
      <Icon icon={Heart} color="info" />
      <Icon icon={Heart} color="neutral" />
    </div>
  ),
};

// Stroke Width Variants
export const StrokeWidths: Story = {
  render: () => (
    <div className="flex items-center gap-gr-4">
      <Icon icon={Settings} strokeWidth={1} />
      <Icon icon={Settings} strokeWidth={1.5} />
      <Icon icon={Settings} strokeWidth={2} />
      <Icon icon={Settings} strokeWidth={2.5} />
      <Icon icon={Settings} strokeWidth={3} />
    </div>
  ),
};

// Animations
export const Spinning: Story = {
  args: {
    icon: Settings,
    size: 'gr-lg',
    spin: true,
  },
};

export const Pulsing: Story = {
  args: {
    icon: Bell,
    size: 'gr-lg',
    color: 'warning',
    pulse: true,
  },
};

// Common UI Icons
export const CommonIcons: Story = {
  render: () => (
    <div className="grid grid-cols-8 gap-gr-4">
      <Icon icon={Home} />
      <Icon icon={User} />
      <Icon icon={Search} />
      <Icon icon={Settings} />
      <Icon icon={Bell} />
      <Icon icon={Mail} />
      <Icon icon={Phone} />
      <Icon icon={Calendar} />
      <Icon icon={Map} />
      <Icon icon={Camera} />
      <Icon icon={Heart} />
      <Icon icon={Star} />
      <Icon icon={Download} />
      <Icon icon={Upload} />
      <Icon icon={Edit} />
      <Icon icon={Trash2} />
    </div>
  ),
};

// Action Icons
export const ActionIcons: Story = {
  render: () => (
    <div className="flex items-center gap-gr-4">
      <Icon icon={Plus} color="success" />
      <Icon icon={Minus} color="warning" />
      <Icon icon={Edit} color="primary" />
      <Icon icon={Trash2} color="danger" />
      <Icon icon={Download} color="info" />
      <Icon icon={Upload} color="secondary" />
    </div>
  ),
};

// Navigation Icons
export const NavigationIcons: Story = {
  render: () => (
    <div className="flex items-center gap-gr-4">
      <Icon icon={ArrowLeft} />
      <Icon icon={ArrowRight} />
      <Icon icon={ChevronDown} />
      <Icon icon={Home} />
      <Icon icon={Search} />
      <Icon icon={Settings} />
    </div>
  ),
};

// Media Icons
export const MediaIcons: Story = {
  render: () => (
    <div className="flex items-center gap-gr-4">
      <Icon icon={Play} color="success" />
      <Icon icon={Pause} color="warning" />
      <Icon icon={Volume2} color="primary" />
      <Icon icon={Camera} color="secondary" />
      <Icon icon={Download} color="info" />
    </div>
  ),
};

// Status Icons
export const StatusIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-gr-4 items-center">
      <div className="flex items-center gap-gr-2">
        <Icon icon={Check} color="success" size="gr-sm" />
        <span className="text-sm">Success</span>
      </div>
      <div className="flex items-center gap-gr-2">
        <Icon icon={X} color="danger" size="gr-sm" />
        <span className="text-sm">Error</span>
      </div>
      <div className="flex items-center gap-gr-2">
        <Icon icon={Bell} color="warning" size="gr-sm" />
        <span className="text-sm">Warning</span>
      </div>
      <div className="flex items-center gap-gr-2">
        <Icon icon={Wifi} color="info" size="gr-sm" />
        <span className="text-sm">Connected</span>
      </div>
    </div>
  ),
};

// Icon with Custom Size (number)
export const CustomSize: Story = {
  render: () => (
    <div className="flex items-center gap-gr-4">
      <Icon icon={Star} size={16} />
      <Icon icon={Star} size={24} />
      <Icon icon={Star} size={32} />
      <Icon icon={Star} size={48} />
    </div>
  ),
};

// Interactive Examples
export const ButtonWithIcon: Story = {
  render: () => (
    <div className="flex gap-gr-2">
      <button className="flex items-center gap-gr-2 px-gr-3 py-gr-2 bg-blue-600 text-white rounded-gr-md hover:bg-blue-700">
        <Icon icon={Download} size="gr-sm" color="white" />
        Download
      </button>
      <button className="flex items-center gap-gr-2 px-gr-3 py-gr-2 border border-gray-300 rounded-gr-md hover:bg-gray-50">
        <Icon icon={Edit} size="gr-sm" />
        Edit
      </button>
      <button className="flex items-center gap-gr-2 px-gr-3 py-gr-2 bg-red-600 text-white rounded-gr-md hover:bg-red-700">
        <Icon icon={Trash2} size="gr-sm" color="white" />
        Delete
      </button>
    </div>
  ),
};

// All Sizes Comparison
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-gr-4">
      <div className="flex items-center gap-gr-4">
        <div className="w-20 text-sm text-gray-600">gr-sm</div>
        <Icon icon={Search} size="gr-sm" />
        <span className="text-sm text-gray-500">13px × 13px</span>
      </div>
      <div className="flex items-center gap-gr-4">
        <div className="w-20 text-sm text-gray-600">gr-md</div>
        <Icon icon={Search} size="gr-md" />
        <span className="text-sm text-gray-500">21px × 21px</span>
      </div>
      <div className="flex items-center gap-gr-4">
        <div className="w-20 text-sm text-gray-600">gr-lg</div>
        <Icon icon={Search} size="gr-lg" />
        <span className="text-sm text-gray-500">34px × 34px</span>
      </div>
      <div className="flex items-center gap-gr-4">
        <div className="w-20 text-sm text-gray-600">gr-xl</div>
        <Icon icon={Search} size="gr-xl" />
        <span className="text-sm text-gray-500">55px × 55px</span>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};