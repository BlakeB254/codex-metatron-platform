import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon' | 'type'> {
  /**
   * Callback when search is triggered
   */
  onSearch?: (value: string) => void;
  /**
   * Callback when clear is triggered
   */
  onClear?: () => void;
  /**
   * Whether to show the clear button when there's a value
   */
  showClear?: boolean;
  /**
   * Whether to show the search button
   */
  showSearchButton?: boolean;
}

/**
 * SearchInput molecule combining Input with search functionality
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   placeholder="Search products..."
 *   onSearch={(value) => console.log('Searching for:', value)}
 *   showClear
 * />
 * ```
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    onSearch,
    onClear,
    showClear = true,
    showSearchButton = false,
    value,
    onChange,
    onKeyDown,
    className,
    ...props 
  }, ref) => {
    const hasValue = Boolean(value);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(e.currentTarget.value);
      }
      onKeyDown?.(e);
    };

    const handleClear = () => {
      onClear?.();
      if (onChange) {
        onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleSearchClick = () => {
      if (onSearch && typeof value === 'string') {
        onSearch(value);
      }
    };

    return (
      <div className="flex items-center gap-gr-2">
        <div className="flex-1">
          <Input
            ref={ref}
            type="search"
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            leftIcon={
              <Icon size="sm" color="muted">
                <Search />
              </Icon>
            }
            rightIcon={
              showClear && hasValue ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full p-1 hover:bg-neutral-100"
                >
                  <Icon size="sm" color="muted">
                    <X />
                  </Icon>
                </button>
              ) : undefined
            }
            className={className}
            {...props}
          />
        </div>
        
        {showSearchButton && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSearchClick}
            leftIcon={
              <Icon size="sm">
                <Search />
              </Icon>
            }
          >
            Search
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';