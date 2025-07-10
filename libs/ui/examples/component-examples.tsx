import React, { useState } from 'react'
import { 
  Button, 
  Input, 
  Card, 
  Badge, 
  Text, 
  Icon,
  type ButtonProps,
  type InputProps,
  type CardProps,
  type BadgeProps,
  type TextProps,
  type IconProps
} from '@codex-metatron/ui'
import { Search, Star, AlertCircle, CheckCircle, User, Mail, Lock } from 'lucide-react'

/**
 * Comprehensive examples of all UI components in the Codex Metatron UI library
 * Following sacred geometry design principles and atomic design methodology
 */

// Button Examples
export const ButtonExamples: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="space-y-gr-4">
      <Text variant="h3">Button Component Examples</Text>
      
      {/* Variants */}
      <div className="space-y-gr-3">
        <Text variant="h4">Variants</Text>
        <div className="flex flex-wrap gap-gr-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-gr-3">
        <Text variant="h4">Sizes (Sacred Geometry)</Text>
        <div className="flex flex-wrap items-center gap-gr-2">
          <Button size="gr-sm">Small (gr-sm)</Button>
          <Button size="gr-md">Medium (gr-md)</Button>
          <Button size="gr-lg">Large (gr-lg)</Button>
          <Button size="gr-xl">Extra Large (gr-xl)</Button>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-gr-3">
        <Text variant="h4">With Icons</Text>
        <div className="flex flex-wrap gap-gr-2">
          <Button leftIcon={<Star className="w-4 h-4" />}>
            With Left Icon
          </Button>
          <Button rightIcon={<AlertCircle className="w-4 h-4" />}>
            With Right Icon
          </Button>
        </div>
      </div>

      {/* Loading State */}
      <div className="space-y-gr-3">
        <Text variant="h4">Loading State</Text>
        <div className="flex flex-wrap gap-gr-2">
          <Button 
            isLoading={isLoading} 
            onClick={handleLoadingDemo}
            loadingText="Processing..."
          >
            {isLoading ? 'Processing...' : 'Start Loading Demo'}
          </Button>
          <Button isLoading disabled>
            Always Loading
          </Button>
        </div>
      </div>

      {/* Full Width */}
      <div className="space-y-gr-3">
        <Text variant="h4">Full Width</Text>
        <Button fullWidth variant="primary">
          Full Width Button
        </Button>
      </div>
    </div>
  )
}

// Input Examples
export const InputExamples: React.FC = () => {
  const [values, setValues] = useState({
    basic: '',
    withIcon: '',
    password: '',
    error: '',
    disabled: 'Disabled input'
  })

  return (
    <div className="space-y-gr-4">
      <Text variant="h3">Input Component Examples</Text>
      
      {/* Basic Inputs */}
      <div className="space-y-gr-3">
        <Text variant="h4">Basic Input Variants</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gr-3">
          <Input
            variant="default"
            placeholder="Default variant"
            label="Default Input"
            value={values.basic}
            onChange={(e) => setValues(prev => ({ ...prev, basic: e.target.value }))}
          />
          <Input
            variant="filled"
            placeholder="Filled variant"
            label="Filled Input"
          />
          <Input
            variant="outline"
            placeholder="Outline variant"
            label="Outline Input"
          />
          <Input
            variant="underline"
            placeholder="Underline variant"
            label="Underline Input"
          />
        </div>
      </div>

      {/* Input Types */}
      <div className="space-y-gr-3">
        <Text variant="h4">Input Types</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gr-3">
          <Input
            type="email"
            placeholder="user@example.com"
            label="Email"
            leftIcon={<Mail className="w-4 h-4" />}
          />
          <Input
            type="password"
            placeholder="Enter password"
            label="Password"
            leftIcon={<Lock className="w-4 h-4" />}
            value={values.password}
            onChange={(e) => setValues(prev => ({ ...prev, password: e.target.value }))}
          />
          <Input
            type="search"
            placeholder="Search..."
            label="Search"
            leftIcon={<Search className="w-4 h-4" />}
            value={values.withIcon}
            onChange={(e) => setValues(prev => ({ ...prev, withIcon: e.target.value }))}
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-gr-3">
        <Text variant="h4">Sizes (Sacred Geometry)</Text>
        <div className="space-y-gr-2">
          <Input size="gr-sm" placeholder="Small (gr-sm)" label="Small Input" />
          <Input size="gr-md" placeholder="Medium (gr-md)" label="Medium Input" />
          <Input size="gr-lg" placeholder="Large (gr-lg)" label="Large Input" />
          <Input size="gr-xl" placeholder="Extra Large (gr-xl)" label="Extra Large Input" />
        </div>
      </div>

      {/* States */}
      <div className="space-y-gr-3">
        <Text variant="h4">Input States</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gr-3">
          <Input
            placeholder="Required field"
            label="Required Field"
            isRequired
            helperText="This field is required"
          />
          <Input
            placeholder="Valid input"
            label="Valid Input"
            isValid
            helperText="Input is valid"
            rightIcon={<CheckCircle className="w-4 h-4 text-green-500" />}
          />
          <Input
            placeholder="Invalid input"
            label="Invalid Input"
            isInvalid
            error="This field has an error"
            rightIcon={<AlertCircle className="w-4 h-4 text-red-500" />}
          />
          <Input
            placeholder="Disabled input"
            label="Disabled Input"
            isDisabled
            value={values.disabled}
          />
        </div>
      </div>
    </div>
  )
}

// Badge Examples
export const BadgeExamples: React.FC = () => {
  const [badges, setBadges] = useState([
    { id: 1, text: 'Removable 1' },
    { id: 2, text: 'Removable 2' },
    { id: 3, text: 'Removable 3' }
  ])

  const removeBadge = (id: number) => {
    setBadges(prev => prev.filter(badge => badge.id !== id))
  }

  return (
    <div className="space-y-gr-4">
      <Text variant="h3">Badge Component Examples</Text>
      
      {/* Variants */}
      <div className="space-y-gr-3">
        <Text variant="h4">Variants</Text>
        <div className="flex flex-wrap gap-gr-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="solid">Solid</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="soft">Soft</Badge>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-gr-3">
        <Text variant="h4">Colors</Text>
        <div className="space-y-gr-2">
          <div className="flex flex-wrap gap-gr-2">
            <Badge color="neutral">Neutral</Badge>
            <Badge color="primary">Primary</Badge>
            <Badge color="secondary">Secondary</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="danger">Danger</Badge>
            <Badge color="info">Info</Badge>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-gr-3">
        <Text variant="h4">Sizes (Sacred Geometry)</Text>
        <div className="flex flex-wrap items-center gap-gr-2">
          <Badge size="gr-sm">Small</Badge>
          <Badge size="gr-md">Medium</Badge>
          <Badge size="gr-lg">Large</Badge>
          <Badge size="gr-xl">Extra Large</Badge>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-gr-3">
        <Text variant="h4">With Icons</Text>
        <div className="flex flex-wrap gap-gr-2">
          <Badge 
            variant="solid" 
            color="success" 
            icon={<CheckCircle className="w-3 h-3" />}
          >
            Verified
          </Badge>
          <Badge 
            variant="outline" 
            color="warning" 
            icon={<AlertCircle className="w-3 h-3" />}
          >
            Warning
          </Badge>
          <Badge 
            variant="soft" 
            color="primary" 
            icon={<User className="w-3 h-3" />}
          >
            User
          </Badge>
        </div>
      </div>

      {/* Dot Badges */}
      <div className="space-y-gr-3">
        <Text variant="h4">Dot Badges</Text>
        <div className="flex flex-wrap items-center gap-gr-3">
          <div className="flex items-center gap-gr-1">
            <Badge dot color="success" size="gr-sm" />
            <Text variant="body-small">Online</Text>
          </div>
          <div className="flex items-center gap-gr-1">
            <Badge dot color="warning" size="gr-md" />
            <Text variant="body-small">Away</Text>
          </div>
          <div className="flex items-center gap-gr-1">
            <Badge dot color="danger" size="gr-lg" />
            <Text variant="body-small">Offline</Text>
          </div>
        </div>
      </div>

      {/* Removable Badges */}
      <div className="space-y-gr-3">
        <Text variant="h4">Removable Badges</Text>
        <div className="flex flex-wrap gap-gr-2">
          {badges.map(badge => (
            <Badge
              key={badge.id}
              variant="soft"
              color="primary"
              removable
              onRemove={() => removeBadge(badge.id)}
            >
              {badge.text}
            </Badge>
          ))}
          {badges.length === 0 && (
            <Text variant="body-small" color="secondary">
              All badges removed! Refresh to reset.
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}

// Card Examples
export const CardExamples: React.FC = () => {
  const [loadingCard, setLoadingCard] = useState(false)

  const handleLoadingCard = () => {
    setLoadingCard(true)
    setTimeout(() => setLoadingCard(false), 3000)
  }

  return (
    <div className="space-y-gr-4">
      <Text variant="h3">Card Component Examples</Text>
      
      {/* Basic Variants */}
      <div className="space-y-gr-3">
        <Text variant="h4">Variants</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gr-3">
          <Card variant="default">
            <Text variant="h5">Default Card</Text>
            <Text variant="body-small" color="secondary">
              Standard card with border and subtle shadow
            </Text>
          </Card>
          <Card variant="outlined">
            <Text variant="h5">Outlined Card</Text>
            <Text variant="body-small" color="secondary">
              Card with emphasized border
            </Text>
          </Card>
          <Card variant="elevated">
            <Text variant="h5">Elevated Card</Text>
            <Text variant="body-small" color="secondary">
              Card with prominent shadow
            </Text>
          </Card>
          <Card variant="filled">
            <Text variant="h5">Filled Card</Text>
            <Text variant="body-small" color="secondary">
              Card with background fill
            </Text>
          </Card>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-gr-3">
        <Text variant="h4">Sizes (Sacred Geometry)</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gr-3">
          <Card size="gr-sm">
            <Text variant="h6">Small Card (gr-sm)</Text>
            <Text variant="body-small">Compact padding</Text>
          </Card>
          <Card size="gr-md">
            <Text variant="h5">Medium Card (gr-md)</Text>
            <Text variant="body">Standard padding</Text>
          </Card>
          <Card size="gr-lg">
            <Text variant="h4">Large Card (gr-lg)</Text>
            <Text variant="body-large">Generous padding</Text>
          </Card>
          <Card size="gr-xl">
            <Text variant="h3">Extra Large Card (gr-xl)</Text>
            <Text variant="body-large">Maximum padding</Text>
          </Card>
        </div>
      </div>

      {/* With Header and Footer */}
      <div className="space-y-gr-3">
        <Text variant="h4">With Header and Footer</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gr-3">
          <Card 
            variant="elevated"
            header={
              <div className="flex items-center justify-between">
                <Text variant="h5">User Profile</Text>
                <Badge variant="soft" color="success">Active</Badge>
              </div>
            }
            footer={
              <div className="flex justify-end gap-gr-2">
                <Button variant="ghost" size="gr-sm">Cancel</Button>
                <Button variant="primary" size="gr-sm">Save</Button>
              </div>
            }
          >
            <div className="space-y-gr-2">
              <Input 
                label="Full Name" 
                placeholder="Enter your name"
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input 
                label="Email" 
                placeholder="Enter your email"
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>
          </Card>

          <Card 
            variant="default"
            header={<Text variant="h5">Quick Stats</Text>}
          >
            <div className="grid grid-cols-2 gap-gr-3">
              <div className="text-center">
                <Text variant="h2" color="primary">124</Text>
                <Text variant="caption" color="secondary">Users</Text>
              </div>
              <div className="text-center">
                <Text variant="h2" color="success">98%</Text>
                <Text variant="caption" color="secondary">Uptime</Text>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Interactive Cards */}
      <div className="space-y-gr-3">
        <Text variant="h4">Interactive Cards</Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gr-3">
          <Card hoverable variant="outlined">
            <Text variant="h5">Hoverable Card</Text>
            <Text variant="body-small" color="secondary">
              Hover to see elevation effect
            </Text>
          </Card>
          
          <Card 
            clickable 
            variant="default"
            onClick={() => alert('Card clicked!')}
          >
            <Text variant="h5">Clickable Card</Text>
            <Text variant="body-small" color="secondary">
              Click me for interaction
            </Text>
          </Card>

          <Card 
            variant="elevated"
            loading={loadingCard}
          >
            <Text variant="h5">Loading Card</Text>
            <Text variant="body-small" color="secondary">
              {loadingCard ? 'Loading...' : 'Click button below to load'}
            </Text>
            {!loadingCard && (
              <Button 
                size="gr-sm" 
                variant="primary" 
                onClick={handleLoadingCard}
                className="mt-gr-2"
              >
                Start Loading
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

// Text Examples
export const TextExamples: React.FC = () => {
  return (
    <div className="space-y-gr-4">
      <Text variant="h3">Text Component Examples</Text>
      
      {/* Typography Hierarchy */}
      <div className="space-y-gr-3">
        <Text variant="h4">Typography Hierarchy (Sacred Geometry)</Text>
        <div className="space-y-gr-2">
          <Text variant="h1">Heading 1 (gr-5xl)</Text>
          <Text variant="h2">Heading 2 (gr-4xl)</Text>
          <Text variant="h3">Heading 3 (gr-3xl)</Text>
          <Text variant="h4">Heading 4 (gr-2xl)</Text>
          <Text variant="h5">Heading 5 (gr-xl)</Text>
          <Text variant="h6">Heading 6 (gr-lg)</Text>
          <Text variant="body-large">Body Large (gr-lg)</Text>
          <Text variant="body">Body Text (gr-base)</Text>
          <Text variant="body-small">Body Small (gr-sm)</Text>
          <Text variant="caption">Caption Text (gr-xs)</Text>
          <Text variant="label">Label Text (gr-sm, medium weight)</Text>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-gr-3">
        <Text variant="h4">Colors</Text>
        <div className="space-y-gr-1">
          <Text color="neutral">Neutral text color</Text>
          <Text color="primary">Primary text color</Text>
          <Text color="secondary">Secondary text color</Text>
          <Text color="success">Success text color</Text>
          <Text color="warning">Warning text color</Text>
          <Text color="danger">Danger text color</Text>
          <Text color="info">Info text color</Text>
        </div>
      </div>

      {/* Weights */}
      <div className="space-y-gr-3">
        <Text variant="h4">Font Weights</Text>
        <div className="space-y-gr-1">
          <Text weight="normal">Normal weight text</Text>
          <Text weight="medium">Medium weight text</Text>
          <Text weight="semibold">Semibold weight text</Text>
          <Text weight="bold">Bold weight text</Text>
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-gr-3">
        <Text variant="h4">Text Alignment</Text>
        <div className="space-y-gr-2">
          <Text align="left">Left aligned text</Text>
          <Text align="center">Center aligned text</Text>
          <Text align="right">Right aligned text</Text>
          <Text align="justify">
            Justified text that spreads across the full width of the container, 
            creating even spacing between words to align with both margins.
          </Text>
        </div>
      </div>

      {/* Text Styling */}
      <div className="space-y-gr-3">
        <Text variant="h4">Text Styling</Text>
        <div className="space-y-gr-1">
          <Text italic>Italic text styling</Text>
          <Text underline>Underlined text styling</Text>
          <Text italic underline>Combined italic and underline</Text>
          <div className="w-32">
            <Text truncate>
              This is a very long text that will be truncated with ellipsis
            </Text>
          </div>
        </div>
      </div>

      {/* Custom Elements */}
      <div className="space-y-gr-3">
        <Text variant="h4">Custom HTML Elements</Text>
        <div className="space-y-gr-1">
          <Text as="span" variant="body">Text as span element</Text>
          <Text as="div" variant="body">Text as div element</Text>
          <Text as="p" variant="body">Text as paragraph (default for body)</Text>
          <Text as="label" variant="label">Text as label element</Text>
        </div>
      </div>
    </div>
  )
}

// Icon Examples
export const IconExamples: React.FC = () => {
  const [spinning, setSpinning] = useState(false)
  const [pulsing, setPulsing] = useState(false)

  return (
    <div className="space-y-gr-4">
      <Text variant="h3">Icon Component Examples</Text>
      
      {/* Sizes */}
      <div className="space-y-gr-3">
        <Text variant="h4">Sizes (Sacred Geometry)</Text>
        <div className="flex flex-wrap items-center gap-gr-3">
          <div className="flex items-center gap-gr-1">
            <Icon icon={Star} size="gr-sm" />
            <Text variant="body-small">Small (gr-sm)</Text>
          </div>
          <div className="flex items-center gap-gr-1">
            <Icon icon={Star} size="gr-md" />
            <Text variant="body-small">Medium (gr-md)</Text>
          </div>
          <div className="flex items-center gap-gr-1">
            <Icon icon={Star} size="gr-lg" />
            <Text variant="body-small">Large (gr-lg)</Text>
          </div>
          <div className="flex items-center gap-gr-1">
            <Icon icon={Star} size="gr-xl" />
            <Text variant="body-small">Extra Large (gr-xl)</Text>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-gr-3">
        <Text variant="h4">Colors</Text>
        <div className="flex flex-wrap items-center gap-gr-3">
          <Icon icon={CheckCircle} color="neutral" />
          <Icon icon={CheckCircle} color="primary" />
          <Icon icon={CheckCircle} color="secondary" />
          <Icon icon={CheckCircle} color="success" />
          <Icon icon={AlertCircle} color="warning" />
          <Icon icon={AlertCircle} color="danger" />
          <Icon icon={CheckCircle} color="info" />
        </div>
      </div>

      {/* Custom Stroke Width */}
      <div className="space-y-gr-3">
        <Text variant="h4">Stroke Width</Text>
        <div className="flex flex-wrap items-center gap-gr-3">
          <div className="flex items-center gap-gr-1">
            <Icon icon={Search} strokeWidth={1} />
            <Text variant="body-small">Stroke 1</Text>
          </div>
          <div className="flex items-center gap-gr-1">
            <Icon icon={Search} strokeWidth={2} />
            <Text variant="body-small">Stroke 2 (default)</Text>
          </div>
          <div className="flex items-center gap-gr-1">
            <Icon icon={Search} strokeWidth={3} />
            <Text variant="body-small">Stroke 3</Text>
          </div>
        </div>
      </div>

      {/* Animations */}
      <div className="space-y-gr-3">
        <Text variant="h4">Animations</Text>
        <div className="flex flex-wrap items-center gap-gr-3">
          <div className="flex items-center gap-gr-2">
            <Icon icon={Star} spin={spinning} color="primary" />
            <Button 
              size="gr-sm" 
              variant="outline"
              onClick={() => setSpinning(!spinning)}
            >
              {spinning ? 'Stop Spin' : 'Start Spin'}
            </Button>
          </div>
          <div className="flex items-center gap-gr-2">
            <Icon icon={CheckCircle} pulse={pulsing} color="success" />
            <Button 
              size="gr-sm" 
              variant="outline"
              onClick={() => setPulsing(!pulsing)}
            >
              {pulsing ? 'Stop Pulse' : 'Start Pulse'}
            </Button>
          </div>
        </div>
      </div>

      {/* Common Icon Usage */}
      <div className="space-y-gr-3">
        <Text variant="h4">Common Usage in Components</Text>
        <div className="space-y-gr-2">
          <Button leftIcon={<Icon icon={User} size="gr-sm" />}>
            User Profile
          </Button>
          <Badge 
            icon={<Icon icon={CheckCircle} size="gr-sm" />}
            variant="soft" 
            color="success"
          >
            Verified Account
          </Badge>
          <Input
            leftIcon={<Icon icon={Search} size="gr-sm" />}
            placeholder="Search with icon..."
          />
        </div>
      </div>
    </div>
  )
}

// Complete Example Application
export const ComponentShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-gr-4">
      <div className="max-w-gr-wide mx-auto space-y-gr-8">
        {/* Header */}
        <Card variant="elevated" size="gr-lg">
          <div className="text-center space-y-gr-2">
            <Text variant="h1" color="primary">
              Codex Metatron UI Library
            </Text>
            <Text variant="body-large" color="secondary">
              Sacred Geometry Design System - Component Showcase
            </Text>
            <div className="flex justify-center gap-gr-2">
              <Badge variant="soft" color="primary">Atomic Design</Badge>
              <Badge variant="soft" color="success">Sacred Geometry</Badge>
              <Badge variant="soft" color="info">TypeScript</Badge>
            </div>
          </div>
        </Card>

        {/* Component Examples */}
        <div className="space-y-gr-8">
          <Card variant="default" size="gr-lg">
            <ButtonExamples />
          </Card>
          
          <Card variant="default" size="gr-lg">
            <InputExamples />
          </Card>
          
          <Card variant="default" size="gr-lg">
            <BadgeExamples />
          </Card>
          
          <Card variant="default" size="gr-lg">
            <CardExamples />
          </Card>
          
          <Card variant="default" size="gr-lg">
            <TextExamples />
          </Card>
          
          <Card variant="default" size="gr-lg">
            <IconExamples />
          </Card>
        </div>

        {/* Footer */}
        <Card variant="filled" size="gr-md">
          <div className="text-center">
            <Text variant="body" color="secondary">
              Built with sacred geometry principles and atomic design methodology
            </Text>
            <Text variant="caption" color="secondary">
              Golden ratio: φ = 1.618 | Spacing scale: 5px, 8px, 13px, 21px, 34px, 55px, 89px, 144px
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ComponentShowcase