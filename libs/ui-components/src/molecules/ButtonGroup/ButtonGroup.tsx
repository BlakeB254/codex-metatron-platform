import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Button, type ButtonProps } from '../../atoms/Button';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The button elements to group
   */
  children: React.ReactNode;
  /**
   * Orientation of the button group
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Whether buttons should be attached (no gap)
   */
  attached?: boolean;
}

export interface ButtonGroupItemProps extends ButtonProps {
  /**
   * Whether this is the first button in the group (for styling)
   */
  isFirst?: boolean;
  /**
   * Whether this is the last button in the group (for styling)
   */
  isLast?: boolean;
  /**
   * Whether buttons are attached in the group
   */
  attached?: boolean;
}

/**
 * ButtonGroupItem for use within ButtonGroup
 */
export const ButtonGroupItem = forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, isFirst, isLast, attached, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          attached && [
            'border-r-0 last:border-r',
            isFirst && 'rounded-r-none',
            isLast && 'rounded-l-none',
            !isFirst && !isLast && 'rounded-none',
          ],
          className
        )}
        {...props}
      />
    );
  }
);

ButtonGroupItem.displayName = 'ButtonGroupItem';

/**
 * ButtonGroup molecule for grouping related buttons
 * 
 * @example
 * ```tsx
 * <ButtonGroup attached>
 *   <ButtonGroupItem variant="outline">Previous</ButtonGroupItem>
 *   <ButtonGroupItem variant="outline">Next</ButtonGroupItem>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ 
    className, 
    orientation = 'horizontal', 
    attached = false,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          attached ? 'shadow-sm' : 'gap-gr-2',
          className
        )}
        role="group"
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === ButtonGroupItem) {
            const isFirst = index === 0;
            const isLast = index === React.Children.count(children) - 1;
            
            return React.cloneElement(child, {
              isFirst,
              isLast,
              attached,
              ...child.props,
            });
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';