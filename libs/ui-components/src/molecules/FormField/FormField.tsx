import { forwardRef } from 'react';
import { Input, type InputProps } from '../../atoms/Input';
import { Text } from '../../atoms/Text';

export interface FormFieldProps extends Omit<InputProps, 'label' | 'helperText' | 'error'> {
  /**
   * The field label
   */
  label: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Helper text to display below the field
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Description text to display below the label
   */
  description?: string;
}

/**
 * FormField molecule combining Input with enhanced labeling and validation display
 * 
 * @example
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   required
 *   type="email"
 *   placeholder="Enter your email"
 *   description="We'll never share your email with anyone else"
 * />
 * ```
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label,
    required,
    helperText,
    error,
    description,
    id,
    ...inputProps 
  }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full space-y-gr-1">
        <div>
          <label 
            htmlFor={fieldId}
            className="block text-gr-sm font-medium text-neutral-700"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
          
          {description && (
            <Text variant="caption" color="muted" className="mt-gr-1">
              {description}
            </Text>
          )}
        </div>
        
        <Input
          ref={ref}
          id={fieldId}
          error={error}
          helperText={helperText}
          {...inputProps}
        />
      </div>
    );
  }
);

FormField.displayName = 'FormField';