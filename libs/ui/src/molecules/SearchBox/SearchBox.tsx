import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Input, InputProps } from '../../atoms/Input'
import { Icon } from '../../atoms/Icon'
import { BaseComponentProps, SizeVariant } from '../../types'

export interface SearchBoxProps 
  extends Omit<InputProps, 'leftIcon' | 'rightIcon' | 'type'>,
    BaseComponentProps {
  onSearch?: (value: string) => void
  onClear?: () => void
  showClearButton?: boolean
  searchDelay?: number
  placeholder?: string
  size?: SizeVariant
}

const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  (
    {
      onSearch,
      onClear,
      showClearButton = true,
      searchDelay = 300,
      placeholder = 'Search...',
      size = 'gr-md',
      className,
      value: controlledValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout>()
    const inputRef = useRef<HTMLInputElement>(null)

    // Use controlled value if provided, otherwise use internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue
    const hasValue = value && value.length > 0

    useEffect(() => {
      if (controlledValue !== undefined) {
        setInternalValue(String(controlledValue))
      }
    }, [controlledValue])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      
      if (controlledValue === undefined) {
        setInternalValue(newValue)
      }
      
      // Call external onChange if provided
      if (onChange) {
        onChange(e)
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set up debounced search
      if (onSearch && searchDelay > 0) {
        setIsSearching(true)
        timeoutRef.current = setTimeout(() => {
          onSearch(newValue)
          setIsSearching(false)
        }, searchDelay)
      } else if (onSearch) {
        onSearch(newValue)
      }
    }

    const handleClear = () => {
      const newValue = ''
      
      if (controlledValue === undefined) {
        setInternalValue(newValue)
      }
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Call callbacks
      if (onClear) {
        onClear()
      }
      
      if (onSearch) {
        onSearch(newValue)
      }
      
      // Focus the input
      if (inputRef.current) {
        inputRef.current.focus()
      }
      
      setIsSearching(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear()
      }
      
      if (e.key === 'Enter' && onSearch) {
        // Clear timeout and search immediately
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        onSearch(String(value))
        setIsSearching(false)
      }
    }

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <div className="relative">
        <Input
          ref={ref || inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          size={size}
          className={className}
          leftIcon={
            <Icon
              icon={Search}
              size={size}
              color="secondary"
              className={cn({
                'animate-sacred-spin': isSearching,
              })}
            />
          }
          rightIcon={
            showClearButton && hasValue ? (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'p-1 rounded-full hover:bg-gray-100 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                )}
                aria-label="Clear search"
              >
                <Icon
                  icon={X}
                  size={size}
                  color="secondary"
                />
              </button>
            ) : undefined
          }
          {...props}
        />
      </div>
    )
  }
)

SearchBox.displayName = 'SearchBox'

export { SearchBox }