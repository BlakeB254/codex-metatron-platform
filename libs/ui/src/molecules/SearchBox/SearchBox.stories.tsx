import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchBox } from './SearchBox';

const meta: Meta<typeof SearchBox> = {
  title: 'Molecules/SearchBox',
  component: SearchBox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A search input component with debounced search, clear functionality, and loading states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['gr-sm', 'gr-md', 'gr-lg', 'gr-xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'filled', 'outline', 'underline'],
    },
    showClearButton: {
      control: 'boolean',
    },
    searchDelay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
    },
    fullWidth: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic SearchBox Stories
export const Default: Story = {
  args: {
    placeholder: 'Search...',
    size: 'gr-md',
    onSearch: (value) => console.log('Search:', value),
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Search products, users, or content...',
    size: 'gr-md',
    onSearch: (value) => console.log('Search:', value),
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-gr-4 w-80">
      <SearchBox 
        size="gr-sm" 
        placeholder="Small search"
        onSearch={(value) => console.log('Small search:', value)}
      />
      <SearchBox 
        size="gr-md" 
        placeholder="Medium search"
        onSearch={(value) => console.log('Medium search:', value)}
      />
      <SearchBox 
        size="gr-lg" 
        placeholder="Large search"
        onSearch={(value) => console.log('Large search:', value)}
      />
      <SearchBox 
        size="gr-xl" 
        placeholder="Extra large search"
        onSearch={(value) => console.log('XL search:', value)}
      />
    </div>
  ),
};

// Input Variants
export const InputVariants: Story = {
  render: () => (
    <div className="space-y-gr-4 w-80">
      <SearchBox 
        variant="default" 
        placeholder="Default variant"
        onSearch={(value) => console.log('Default search:', value)}
      />
      <SearchBox 
        variant="filled" 
        placeholder="Filled variant"
        onSearch={(value) => console.log('Filled search:', value)}
      />
      <SearchBox 
        variant="outline" 
        placeholder="Outline variant"
        onSearch={(value) => console.log('Outline search:', value)}
      />
      <SearchBox 
        variant="underline" 
        placeholder="Underline variant"
        onSearch={(value) => console.log('Underline search:', value)}
      />
    </div>
  ),
};

// With Custom Search Delay
export const WithSearchDelay: Story = {
  args: {
    placeholder: 'Search with 1 second delay...',
    searchDelay: 1000,
    onSearch: (value) => console.log('Delayed search:', value),
  },
};

export const InstantSearch: Story = {
  args: {
    placeholder: 'Instant search (no delay)...',
    searchDelay: 0,
    onSearch: (value) => console.log('Instant search:', value),
  },
};

// Without Clear Button
export const WithoutClearButton: Story = {
  args: {
    placeholder: 'Search without clear button...',
    showClearButton: false,
    onSearch: (value) => console.log('Search:', value),
  },
};

// Controlled Component
export const Controlled: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState<string[]>([]);

    const handleSearch = (value: string) => {
      console.log('Searching for:', value);
      // Simulate search results
      if (value.trim()) {
        setResults([
          `Result 1 for "${value}"`,
          `Result 2 for "${value}"`,
          `Result 3 for "${value}"`,
        ]);
      } else {
        setResults([]);
      }
    };

    const handleClear = () => {
      setSearchValue('');
      setResults([]);
      console.log('Search cleared');
    };

    return (
      <div className="w-80">
        <SearchBox
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          onClear={handleClear}
          placeholder="Controlled search..."
        />
        {results.length > 0 && (
          <div className="mt-gr-4 p-gr-3 border border-gray-200 rounded-gr-md">
            <div className="text-sm font-medium text-gray-700 mb-gr-2">
              Search Results:
            </div>
            <ul className="space-y-gr-1">
              {results.map((result, index) => (
                <li key={index} className="text-sm text-gray-600 py-gr-1">
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

// With Labels and Helper Text
export const WithLabel: Story = {
  args: {
    label: 'Search Products',
    placeholder: 'Enter product name or SKU...',
    helperText: 'Search across all product categories',
    onSearch: (value) => console.log('Product search:', value),
  },
};

// Disabled State
export const Disabled: Story = {
  args: {
    placeholder: 'Search is disabled...',
    isDisabled: true,
    onSearch: (value) => console.log('Search:', value),
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    placeholder: 'Full width search...',
    fullWidth: true,
    onSearch: (value) => console.log('Search:', value),
  },
  parameters: {
    layout: 'padded',
  },
};

// Real-world Examples
export const UserSearch: Story = {
  render: () => {
    const [users] = useState([
      'John Doe',
      'Jane Smith',
      'Bob Johnson',
      'Alice Brown',
      'Charlie Wilson',
      'Diana Ross',
      'Eddie Murphy',
      'Fiona Apple',
    ]);
    
    const [filteredUsers, setFilteredUsers] = useState(users);

    const handleSearch = (value: string) => {
      if (value.trim()) {
        const filtered = users.filter(user =>
          user.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers(users);
      }
    };

    return (
      <div className="w-80">
        <SearchBox
          placeholder="Search users..."
          onSearch={handleSearch}
          label="Find Users"
          helperText={`Showing ${filteredUsers.length} of ${users.length} users`}
        />
        <div className="mt-gr-4 max-h-48 overflow-y-auto border border-gray-200 rounded-gr-md">
          {filteredUsers.map((user, index) => (
            <div 
              key={index} 
              className="px-gr-3 py-gr-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <div className="text-sm font-medium">{user}</div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="px-gr-3 py-gr-8 text-center text-gray-500">
              <div className="text-sm">No users found</div>
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const ProductSearch: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (value: string) => {
      setSearchTerm(value);
      if (value.trim()) {
        setIsSearching(true);
        // Simulate API call
        setTimeout(() => {
          setIsSearching(false);
          console.log('Search completed for:', value);
        }, 1000);
      } else {
        setIsSearching(false);
      }
    };

    return (
      <div className="w-96">
        <SearchBox
          placeholder="Search products..."
          onSearch={handleSearch}
          searchDelay={500}
          label="Product Search"
          size="gr-lg"
        />
        {isSearching && (
          <div className="mt-gr-4 p-gr-4 border border-gray-200 rounded-gr-md">
            <div className="flex items-center gap-gr-2">
              <div className="animate-sacred-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm text-gray-600">Searching for "{searchTerm}"...</span>
            </div>
          </div>
        )}
      </div>
    );
  },
};

// Keyboard Navigation Demo
export const KeyboardNavigation: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState<string>('');

    return (
      <div className="w-80">
        <SearchBox
          placeholder="Try typing or pressing Enter/Escape..."
          onSearch={(value) => {
            setLastAction(`Searched: "${value}"`);
          }}
          onClear={() => {
            setLastAction('Cleared search');
          }}
          label="Keyboard Navigation Demo"
          helperText="Press Enter to search immediately, Escape to clear"
        />
        {lastAction && (
          <div className="mt-gr-2 px-gr-3 py-gr-2 bg-blue-50 border border-blue-200 rounded-gr-md">
            <span className="text-sm text-blue-800">{lastAction}</span>
          </div>
        )}
      </div>
    );
  },
};