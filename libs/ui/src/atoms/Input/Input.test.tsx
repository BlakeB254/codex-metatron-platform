import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search, Mail } from 'lucide-react';
import { Input } from './Input';

describe('Input', () => {
  it('renders correctly with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByRole('textbox');
    
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('applies the correct variant classes', () => {
    const { rerender } = render(<Input variant="default" />);
    expect(screen.getByRole('textbox')).toHaveClass('border', 'border-gray-300', 'bg-white');

    rerender(<Input variant="filled" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-0', 'bg-gray-100');

    rerender(<Input variant="outline" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-2', 'border-gray-300', 'bg-transparent');

    rerender(<Input variant="underline" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-0', 'border-b-2', 'rounded-none');
  });

  it('applies the correct size classes', () => {
    const { rerender } = render(<Input size="gr-sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-gr-2', 'py-gr-1', 'text-gr-sm');

    rerender(<Input size="gr-md" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-gr-3', 'py-gr-2', 'text-gr-base');

    rerender(<Input size="gr-lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-gr-4', 'py-gr-3', 'text-gr-lg');

    rerender(<Input size="gr-xl" />);
    expect(screen.getByRole('textbox')).toHaveClass('px-gr-5', 'py-gr-4', 'text-gr-xl');
  });

  it('renders label when provided', () => {
    render(<Input label="Email Address" />);
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('shows required indicator when isRequired is true', () => {
    render(<Input label="Required Field" isRequired />);
    const label = screen.getByText('Required Field');
    
    expect(label).toHaveClass('after:content-["*"]', 'after:text-red-500');
  });

  it('displays helper text', () => {
    render(<Input helperText="This is helper text" />);
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input error="This field is required" />);
    const errorText = screen.getByText('This field is required');
    
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('text-red-600');
  });

  it('prioritizes error over helper text', () => {
    render(<Input helperText="Helper text" error="Error message" />);
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('applies validation state classes', () => {
    const { rerender } = render(<Input isValid />);
    expect(screen.getByRole('textbox')).toHaveClass('border-green-500', 'focus:border-green-500');

    rerender(<Input isInvalid />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500', 'focus:border-red-500');
  });

  it('is disabled when isDisabled prop is true', () => {
    render(<Input isDisabled />);
    const input = screen.getByRole('textbox');
    
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('renders as full width when fullWidth prop is true', () => {
    render(<Input fullWidth />);
    expect(screen.getByRole('textbox')).toHaveClass('w-full');
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'hello');
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('hello');
  });

  it('renders left icon correctly', () => {
    render(<Input leftIcon={<Search data-testid="search-icon" />} />);
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('pl-gr-10'); // Default md size with left icon
  });

  it('renders right icon correctly', () => {
    render(<Input rightIcon={<Mail data-testid="mail-icon" />} />);
    
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('pr-gr-10'); // Default md size with right icon
  });

  it('adjusts icon spacing based on size', () => {
    const { rerender } = render(<Input size="gr-sm" leftIcon={<Search />} />);
    expect(screen.getByRole('textbox')).toHaveClass('pl-gr-8');

    rerender(<Input size="gr-lg" leftIcon={<Search />} />);
    expect(screen.getByRole('textbox')).toHaveClass('pl-gr-12');

    rerender(<Input size="gr-xl" leftIcon={<Search />} />);
    expect(screen.getByRole('textbox')).toHaveClass('pl-gr-14');
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByLabelText('')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalled();
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('maintains focus styles', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-1');
  });

  it('has correct accessibility attributes', () => {
    render(<Input label="Email" isRequired error="Invalid email" />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveAccessibleName('Email');
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
  });

  it('associates label with input correctly', () => {
    render(<Input label="Username" id="username-input" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Username');
    
    expect(input).toHaveAttribute('id', 'username-input');
    expect(label).toHaveAttribute('for', 'username-input');
  });

  it('handles controlled vs uncontrolled state', async () => {
    const user = userEvent.setup();
    
    // Uncontrolled
    const { rerender } = render(<Input />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test');
    expect(input).toHaveValue('test');
    
    // Controlled
    const handleChange = jest.fn();
    rerender(<Input value="controlled" onChange={handleChange} />);
    expect(input).toHaveValue('controlled');
  });
});