import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search, Download } from 'lucide-react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('applies the correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600', 'text-white');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200', 'text-gray-900');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-2', 'border-blue-600', 'text-blue-600');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-gray-700');

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-blue-600', 'underline-offset-4');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600', 'text-white');
  });

  it('applies the correct size classes', () => {
    const { rerender } = render(<Button size="gr-sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-gr-2', 'py-gr-1', 'text-gr-sm');

    rerender(<Button size="gr-md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-gr-3', 'py-gr-2', 'text-gr-base');

    rerender(<Button size="gr-lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-gr-4', 'py-gr-3', 'text-gr-lg');

    rerender(<Button size="gr-xl">Extra Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-gr-5', 'py-gr-4', 'text-gr-xl');
  });

  it('renders as full width when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('shows loading state correctly', () => {
    render(<Button isLoading loadingText="Loading...">Submit</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument(); // Loading spinner
  });

  it('shows loading state without custom text', () => {
    render(<Button isLoading>Submit</Button>);
    
    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('renders left icon correctly', () => {
    render(
      <Button leftIcon={<Search data-testid="search-icon" />}>
        Search
      </Button>
    );
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders right icon correctly', () => {
    render(
      <Button rightIcon={<Download data-testid="download-icon" />}>
        Download
      </Button>
    );
    
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('renders both left and right icons', () => {
    render(
      <Button 
        leftIcon={<Search data-testid="search-icon" />}
        rightIcon={<Download data-testid="download-icon" />}
      >
        Search & Download
      </Button>
    );
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('hides icons when loading', () => {
    render(
      <Button 
        isLoading
        leftIcon={<Search data-testid="search-icon" />}
        rightIcon={<Download data-testid="download-icon" />}
      >
        Submit
      </Button>
    );
    
    expect(screen.queryByTestId('search-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('download-icon')).not.toBeInTheDocument();
  });

  it('can render as different element types', () => {
    render(<Button as="a" href="/test">Link Button</Button>);
    const link = screen.getByRole('link');
    
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Test</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('handles keyboard events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
    
    // Button should still be accessible via keyboard
    expect(button).toHaveFocus();
  });

  it('has correct accessibility attributes', () => {
    render(<Button aria-label="Custom label">Test</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label');
  });

  it('maintains focus styles', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
  });
});