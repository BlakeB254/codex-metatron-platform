import React from 'react';
import { render, screen } from '@testing-library/react';
import { Search, Heart, Settings } from 'lucide-react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders correctly with default props', () => {
    render(<Icon icon={Search} data-testid="search-icon" />);
    const icon = screen.getByTestId('search-icon');
    
    expect(icon).toBeInTheDocument();
    expect(icon).toBeInstanceOf(SVGElement);
  });

  it('applies correct size classes for sacred geometry sizes', () => {
    const { rerender } = render(<Icon icon={Search} size="gr-sm" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('w-gr-3', 'h-gr-3');

    rerender(<Icon icon={Search} size="gr-md" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('w-gr-4', 'h-gr-4');

    rerender(<Icon icon={Search} size="gr-lg" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('w-gr-5', 'h-gr-5');

    rerender(<Icon icon={Search} size="gr-xl" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('w-gr-6', 'h-gr-6');
  });

  it('handles custom numeric size', () => {
    render(<Icon icon={Search} size={32} data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('w-[32px]', 'h-[32px]');
  });

  it('applies correct color classes for color variants', () => {
    const { rerender } = render(<Icon icon={Heart} color="primary" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-blue-600');

    rerender(<Icon icon={Heart} color="secondary" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-gray-600');

    rerender(<Icon icon={Heart} color="success" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-green-600');

    rerender(<Icon icon={Heart} color="warning" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-yellow-600');

    rerender(<Icon icon={Heart} color="danger" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-red-600');

    rerender(<Icon icon={Heart} color="info" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-blue-500');

    rerender(<Icon icon={Heart} color="neutral" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-gray-900');
  });

  it('handles custom color strings', () => {
    const { rerender } = render(<Icon icon={Search} color="#ff0000" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-[#ff0000]');

    rerender(<Icon icon={Search} color="red-500" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('text-red-500');
  });

  it('applies correct stroke width', () => {
    render(<Icon icon={Settings} strokeWidth={3} data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    
    expect(icon).toHaveAttribute('stroke-width', '3');
  });

  it('applies spin animation when spin prop is true', () => {
    render(<Icon icon={Settings} spin data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('animate-sacred-spin');
  });

  it('applies pulse animation when pulse prop is true', () => {
    render(<Icon icon={Heart} pulse data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('animate-golden-pulse');
  });

  it('can have both animations', () => {
    render(<Icon icon={Settings} spin pulse data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('animate-sacred-spin', 'animate-golden-pulse');
  });

  it('applies base flex-shrink-0 class', () => {
    render(<Icon icon={Search} data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('flex-shrink-0');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<Icon ref={ref} icon={Search} />);
    
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  it('applies custom className', () => {
    render(<Icon icon={Search} className="custom-class" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('custom-class');
  });

  it('passes through SVG attributes', () => {
    render(
      <Icon 
        icon={Search} 
        data-testid="icon" 
        aria-label="Search icon"
        role="img"
      />
    );
    const icon = screen.getByTestId('icon');
    
    expect(icon).toHaveAttribute('aria-label', 'Search icon');
    expect(icon).toHaveAttribute('role', 'img');
  });

  it('renders different icons correctly', () => {
    const { rerender } = render(<Icon icon={Search} data-testid="icon" />);
    let icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();

    rerender(<Icon icon={Heart} data-testid="icon" />);
    icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();

    rerender(<Icon icon={Settings} data-testid="icon" />);
    icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();
  });

  it('handles edge cases for size and color', () => {
    // Invalid size should fall back to default
    render(<Icon icon={Search} size={'invalid' as any} data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveClass('w-gr-4', 'h-gr-4');
  });

  it('combines all props correctly', () => {
    render(
      <Icon 
        icon={Heart}
        size="gr-lg"
        color="danger"
        strokeWidth={2.5}
        spin
        pulse
        className="custom-class"
        data-testid="icon"
      />
    );
    
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass(
      'w-gr-5',              // lg size
      'h-gr-5',              // lg size
      'text-red-600',        // danger color
      'animate-sacred-spin', // spin animation
      'animate-golden-pulse', // pulse animation
      'custom-class',        // custom class
      'flex-shrink-0'        // base class
    );
    expect(icon).toHaveAttribute('stroke-width', '2.5');
  });

  it('maintains accessibility when used as decorative', () => {
    render(<Icon icon={Search} aria-hidden="true" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports semantic usage with proper labels', () => {
    render(
      <Icon 
        icon={Search} 
        aria-label="Search for products"
        role="img"
        data-testid="icon"
      />
    );
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('aria-label', 'Search for products');
    expect(icon).toHaveAttribute('role', 'img');
  });
});