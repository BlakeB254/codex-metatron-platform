import React from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders correctly with default props', () => {
    render(<Text>Hello World</Text>);
    const text = screen.getByText('Hello World');
    
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe('P'); // Default element for body variant
  });

  it('renders correct semantic HTML elements for heading variants', () => {
    const headingVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
    
    headingVariants.forEach((variant) => {
      const { unmount } = render(<Text variant={variant}>Heading</Text>);
      const heading = screen.getByText('Heading');
      expect(heading.tagName).toBe(variant.toUpperCase());
      unmount();
    });
  });

  it('renders correct elements for text variants', () => {
    const { rerender } = render(<Text variant="body">Body text</Text>);
    expect(screen.getByText('Body text').tagName).toBe('P');

    rerender(<Text variant="body-large">Large body text</Text>);
    expect(screen.getByText('Large body text').tagName).toBe('P');

    rerender(<Text variant="body-small">Small body text</Text>);
    expect(screen.getByText('Small body text').tagName).toBe('P');

    rerender(<Text variant="caption">Caption text</Text>);
    expect(screen.getByText('Caption text').tagName).toBe('SPAN');

    rerender(<Text variant="label">Label text</Text>);
    expect(screen.getByText('Label text').tagName).toBe('LABEL');
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Text variant="h1">Heading 1</Text>);
    expect(screen.getByText('Heading 1')).toHaveClass('text-gr-5xl', 'font-bold');

    rerender(<Text variant="h2">Heading 2</Text>);
    expect(screen.getByText('Heading 2')).toHaveClass('text-gr-4xl', 'font-bold');

    rerender(<Text variant="body">Body text</Text>);
    expect(screen.getByText('Body text')).toHaveClass('text-gr-base', 'leading-normal');

    rerender(<Text variant="caption">Caption</Text>);
    expect(screen.getByText('Caption')).toHaveClass('text-gr-xs', 'leading-tight');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<Text color="primary">Primary text</Text>);
    expect(screen.getByText('Primary text')).toHaveClass('text-blue-600');

    rerender(<Text color="secondary">Secondary text</Text>);
    expect(screen.getByText('Secondary text')).toHaveClass('text-gray-600');

    rerender(<Text color="success">Success text</Text>);
    expect(screen.getByText('Success text')).toHaveClass('text-green-600');

    rerender(<Text color="warning">Warning text</Text>);
    expect(screen.getByText('Warning text')).toHaveClass('text-yellow-600');

    rerender(<Text color="danger">Danger text</Text>);
    expect(screen.getByText('Danger text')).toHaveClass('text-red-600');

    rerender(<Text color="info">Info text</Text>);
    expect(screen.getByText('Info text')).toHaveClass('text-blue-500');

    rerender(<Text color="neutral">Neutral text</Text>);
    expect(screen.getByText('Neutral text')).toHaveClass('text-gray-900');
  });

  it('applies correct weight classes', () => {
    const { rerender } = render(<Text weight="normal">Normal weight</Text>);
    expect(screen.getByText('Normal weight')).toHaveClass('font-normal');

    rerender(<Text weight="medium">Medium weight</Text>);
    expect(screen.getByText('Medium weight')).toHaveClass('font-medium');

    rerender(<Text weight="semibold">Semibold weight</Text>);
    expect(screen.getByText('Semibold weight')).toHaveClass('font-semibold');

    rerender(<Text weight="bold">Bold weight</Text>);
    expect(screen.getByText('Bold weight')).toHaveClass('font-bold');
  });

  it('applies correct alignment classes', () => {
    const { rerender } = render(<Text align="left">Left aligned</Text>);
    expect(screen.getByText('Left aligned')).toHaveClass('text-left');

    rerender(<Text align="center">Center aligned</Text>);
    expect(screen.getByText('Center aligned')).toHaveClass('text-center');

    rerender(<Text align="right">Right aligned</Text>);
    expect(screen.getByText('Right aligned')).toHaveClass('text-right');

    rerender(<Text align="justify">Justified text</Text>);
    expect(screen.getByText('Justified text')).toHaveClass('text-justify');
  });

  it('applies text styling classes', () => {
    const { rerender } = render(<Text truncate>Truncated text</Text>);
    expect(screen.getByText('Truncated text')).toHaveClass('truncate');

    rerender(<Text italic>Italic text</Text>);
    expect(screen.getByText('Italic text')).toHaveClass('italic');

    rerender(<Text underline>Underlined text</Text>);
    expect(screen.getByText('Underlined text')).toHaveClass('underline');

    rerender(<Text italic underline>Combined styling</Text>);
    const combinedText = screen.getByText('Combined styling');
    expect(combinedText).toHaveClass('italic', 'underline');
  });

  it('can render as custom element', () => {
    render(<Text as="div" variant="body">Div text</Text>);
    const text = screen.getByText('Div text');
    expect(text.tagName).toBe('DIV');
  });

  it('overrides default element with as prop', () => {
    render(<Text as="span" variant="h1">Span heading</Text>);
    const text = screen.getByText('Span heading');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass('text-gr-5xl', 'font-bold'); // Still has h1 styling
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    render(<Text ref={ref}>Test text</Text>);
    
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it('applies custom className', () => {
    render(<Text className="custom-class">Test text</Text>);
    expect(screen.getByText('Test text')).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(<Text id="test-id" data-testid="text-element">Test text</Text>);
    const text = screen.getByText('Test text');
    
    expect(text).toHaveAttribute('id', 'test-id');
    expect(text).toHaveAttribute('data-testid', 'text-element');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Text onClick={handleClick}>Clickable text</Text>);
    
    const text = screen.getByText('Clickable text');
    text.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility for label variant', () => {
    render(<Text variant="label" htmlFor="input-id">Label text</Text>);
    const label = screen.getByText('Label text');
    
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('combines multiple props correctly', () => {
    render(
      <Text 
        variant="h2" 
        color="primary" 
        weight="semibold" 
        align="center" 
        italic 
        className="custom-class"
      >
        Complex text
      </Text>
    );
    
    const text = screen.getByText('Complex text');
    expect(text).toHaveClass(
      'text-gr-4xl',      // h2 variant
      'text-blue-600',    // primary color
      'font-semibold',    // semibold weight
      'text-center',      // center align
      'italic',           // italic styling
      'custom-class'      // custom class
    );
  });

  it('maintains semantic HTML structure', () => {
    const { container } = render(
      <article>
        <Text variant="h1">Article Title</Text>
        <Text variant="body">Article content goes here.</Text>
        <Text variant="caption" color="secondary">Published date</Text>
      </article>
    );
    
    expect(container.querySelector('h1')).toHaveTextContent('Article Title');
    expect(container.querySelector('p')).toHaveTextContent('Article content goes here.');
    expect(container.querySelector('span')).toHaveTextContent('Published date');
  });
});