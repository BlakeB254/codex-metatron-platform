import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBox } from './SearchBox';

// Mock timers for debounce testing
jest.useFakeTimers();

describe('SearchBox', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('renders correctly with default props', () => {
    render(<SearchBox />);
    const input = screen.getByRole('textbox');
    
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search...');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with custom placeholder', () => {
    render(<SearchBox placeholder="Search products..." />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Search products...');
  });

  it('shows search icon by default', () => {
    render(<SearchBox data-testid="search-box" />);
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('shows clear button when there is a value', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBox />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear button when showClearButton is false', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBox showClearButton={false} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });

  it('calls onSearch with debounced value', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleSearch = jest.fn();
    
    render(<SearchBox onSearch={handleSearch} searchDelay={300} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    
    // Should not call immediately
    expect(handleSearch).not.toHaveBeenCalled();
    
    // Advance timers by the delay amount
    jest.advanceTimersByTime(300);
    
    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('calls onSearch immediately when searchDelay is 0', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleSearch = jest.fn();
    
    render(<SearchBox onSearch={handleSearch} searchDelay={0} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 't');
    
    expect(handleSearch).toHaveBeenCalledWith('t');
  });

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleSearch = jest.fn();
    const handleClear = jest.fn();
    
    render(<SearchBox onSearch={handleSearch} onClear={handleClear} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    jest.advanceTimersByTime(300);
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(handleClear).toHaveBeenCalled();
    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('searches immediately when Enter is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleSearch = jest.fn();
    
    render(<SearchBox onSearch={handleSearch} searchDelay={1000} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    await user.keyboard('{Enter}');
    
    // Should call immediately, not wait for debounce
    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('clears search when Escape is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleSearch = jest.fn();
    const handleClear = jest.fn();
    
    render(<SearchBox onSearch={handleSearch} onClear={handleClear} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    await user.keyboard('{Escape}');
    
    expect(input).toHaveValue('');
    expect(handleClear).toHaveBeenCalled();
  });

  it('works as controlled component', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleChange = jest.fn();
    const handleSearch = jest.fn();
    
    const { rerender } = render(
      <SearchBox 
        value="controlled" 
        onChange={handleChange} 
        onSearch={handleSearch} 
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('controlled');
    
    await user.clear(input);
    await user.type(input, 'new value');
    
    expect(handleChange).toHaveBeenCalled();
    
    // Update the controlled value
    rerender(
      <SearchBox 
        value="new value" 
        onChange={handleChange} 
        onSearch={handleSearch} 
      />
    );
    
    expect(input).toHaveValue('new value');
  });

  it('shows loading animation when searching', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleSearch = jest.fn();
    
    render(<SearchBox onSearch={handleSearch} searchDelay={300} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    
    // Search icon should have spinning animation
    const searchIcon = document.querySelector('.animate-sacred-spin');
    expect(searchIcon).toBeInTheDocument();
    
    // After delay, animation should stop
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      const spinningIcon = document.querySelector('.animate-sacred-spin');
      expect(spinningIcon).not.toBeInTheDocument();
    });
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<SearchBox size="gr-sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-gr-2', 'py-gr-1');

    rerender(<SearchBox size="gr-lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-gr-4', 'py-gr-3');
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<SearchBox variant="filled" />);
    expect(screen.getByRole('textbox')).toHaveClass('bg-gray-100');

    rerender(<SearchBox variant="outline" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-2');
  });

  it('can be disabled', () => {
    render(<SearchBox isDisabled />);
    const input = screen.getByRole('textbox');
    
    expect(input).toBeDisabled();
  });

  it('supports full width', () => {
    render(<SearchBox fullWidth />);
    expect(screen.getByRole('textbox')).toHaveClass('w-full');
  });

  it('displays label and helper text', () => {
    render(
      <SearchBox 
        label="Search Products"
        helperText="Search across all categories"
      />
    );
    
    expect(screen.getByText('Search Products')).toBeInTheDocument();
    expect(screen.getByText('Search across all categories')).toBeInTheDocument();
  });

  it('focuses input when clear button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<SearchBox />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearButton);
    
    expect(input).toHaveFocus();
  });

  it('debounces multiple rapid changes', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleSearch = jest.fn();
    
    render(<SearchBox onSearch={handleSearch} searchDelay={300} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'a');
    jest.advanceTimersByTime(100);
    
    await user.type(input, 'b');
    jest.advanceTimersByTime(100);
    
    await user.type(input, 'c');
    jest.advanceTimersByTime(300);
    
    // Should only call once with the final value
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('abc');
  });

  it('cleans up timeout on unmount', () => {
    const { unmount } = render(<SearchBox searchDelay={1000} />);
    
    // This should not throw or cause memory leaks
    unmount();
    
    jest.advanceTimersByTime(1000);
    // Test passes if no errors are thrown
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<SearchBox ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('maintains accessibility', () => {
    render(
      <SearchBox 
        label="Product Search"
        aria-describedby="search-help"
        data-testid="search-input"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleName('Product Search');
    expect(input).toHaveAttribute('aria-describedby', 'search-help');
  });
});