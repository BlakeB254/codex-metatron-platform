import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renders correctly with default props', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content').closest('div');
    
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('relative', 'overflow-hidden', 'transition-all');
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Card variant="default">Default card</Card>);
    let card = screen.getByText('Default card').closest('div');
    expect(card).toHaveClass('bg-white', 'border', 'border-gray-200', 'shadow-gr-sm');

    rerender(<Card variant="outlined">Outlined card</Card>);
    card = screen.getByText('Outlined card').closest('div');
    expect(card).toHaveClass('bg-white', 'border-2', 'border-gray-300');

    rerender(<Card variant="elevated">Elevated card</Card>);
    card = screen.getByText('Elevated card').closest('div');
    expect(card).toHaveClass('bg-white', 'border-0', 'shadow-gr-lg');

    rerender(<Card variant="filled">Filled card</Card>);
    card = screen.getByText('Filled card').closest('div');
    expect(card).toHaveClass('bg-gray-50', 'border-0');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Card size="gr-sm">Small card</Card>);
    let card = screen.getByText('Small card').closest('div');
    expect(card).toHaveClass('rounded-gr-sm');

    rerender(<Card size="gr-md">Medium card</Card>);
    card = screen.getByText('Medium card').closest('div');
    expect(card).toHaveClass('rounded-gr-md');

    rerender(<Card size="gr-lg">Large card</Card>);
    card = screen.getByText('Large card').closest('div');
    expect(card).toHaveClass('rounded-gr-lg');

    rerender(<Card size="gr-xl">Extra large card</Card>);
    card = screen.getByText('Extra large card').closest('div');
    expect(card).toHaveClass('rounded-gr-xl');
  });

  it('renders header when provided', () => {
    render(
      <Card header={<h2>Card Header</h2>}>
        Card content
      </Card>
    );
    
    expect(screen.getByText('Card Header')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Card footer={<button>Footer Button</button>}>
        Card content
      </Card>
    );
    
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders header, content, and footer together', () => {
    render(
      <Card 
        header={<h2>Header</h2>}
        footer={<button>Footer</button>}
      >
        Content
      </Card>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies hoverable styles when hoverable prop is true', () => {
    render(<Card hoverable>Hoverable card</Card>);
    const card = screen.getByText('Hoverable card').closest('div');
    
    expect(card).toHaveClass('hover:shadow-gr-md', 'hover:scale-[1.02]', 'cursor-pointer');
  });

  it('renders as button when clickable prop is true', () => {
    const handleClick = jest.fn();
    render(
      <Card clickable onClick={handleClick}>
        Clickable card
      </Card>
    );
    
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
  });

  it('handles click events when clickable', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(
      <Card clickable onClick={handleClick}>
        Clickable card
      </Card>
    );
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Card loading>Loading card</Card>);
    
    expect(screen.getByText('Loading card').closest('div')).toHaveClass('animate-golden-pulse');
    
    // Check for loading overlay
    const loadingOverlay = document.querySelector('.absolute.inset-0.bg-white\\/50');
    expect(loadingOverlay).toBeInTheDocument();
    
    // Check for spinner
    const spinner = document.querySelector('.animate-sacred-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('applies correct padding based on size', () => {
    const { rerender } = render(<Card size="gr-sm">Content</Card>);
    let content = screen.getByText('Content');
    expect(content).toHaveClass('p-gr-2');

    rerender(<Card size="gr-md">Content</Card>);
    content = screen.getByText('Content');
    expect(content).toHaveClass('p-gr-3');

    rerender(<Card size="gr-lg">Content</Card>);
    content = screen.getByText('Content');
    expect(content).toHaveClass('p-gr-4');

    rerender(<Card size="gr-xl">Content</Card>);
    content = screen.getByText('Content');
    expect(content).toHaveClass('p-gr-5');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Test card</Card>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref correctly for clickable card', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Card ref={ref} clickable>Clickable card</Card>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Test card</Card>);
    const card = screen.getByText('Test card').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Card data-testid="test-card" id="card-id">Test card</Card>);
    const card = screen.getByTestId('test-card');
    
    expect(card).toHaveAttribute('id', 'card-id');
  });

  it('handles keyboard events for clickable cards', () => {
    const handleClick = jest.fn();
    render(<Card clickable onClick={handleClick}>Clickable card</Card>);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    
    expect(card).toHaveFocus();
  });

  it('does not render content wrapper when no children', () => {
    const { container } = render(<Card header="Header only" />);
    
    expect(screen.getByText('Header only')).toBeInTheDocument();
    
    // Content wrapper should not exist when no children
    const contentWrappers = container.querySelectorAll('.p-gr-3');
    expect(contentWrappers).toHaveLength(0);
  });

  it('applies header and footer padding based on size', () => {
    render(
      <Card 
        size="gr-lg"
        header={<div data-testid="header">Header</div>}
        footer={<div data-testid="footer">Footer</div>}
      >
        Content
      </Card>
    );
    
    const header = screen.getByTestId('header').parentElement;
    const footer = screen.getByTestId('footer').parentElement;
    
    expect(header).toHaveClass('px-gr-4', 'py-gr-3');
    expect(footer).toHaveClass('px-gr-4', 'py-gr-3');
  });

  it('shows border between sections', () => {
    const { container } = render(
      <Card 
        header="Header"
        footer="Footer"
      >
        Content
      </Card>
    );
    
    const headerDiv = container.querySelector('.border-b.border-gray-200');
    const footerDiv = container.querySelector('.border-t.border-gray-200');
    
    expect(headerDiv).toBeInTheDocument();
    expect(footerDiv).toBeInTheDocument();
  });

  it('combines interactive props correctly', () => {
    render(<Card hoverable clickable>Interactive card</Card>);
    const card = screen.getByRole('button');
    
    expect(card).toHaveClass(
      'hover:shadow-gr-md',
      'hover:scale-[1.02]',
      'cursor-pointer',
      'focus:outline-none',
      'focus:ring-2'
    );
  });

  it('maintains accessibility for clickable cards', () => {
    render(
      <Card clickable aria-label="Product card" role="button">
        Product information
      </Card>
    );
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Product card');
    expect(card).toHaveAttribute('type', 'button');
  });
});