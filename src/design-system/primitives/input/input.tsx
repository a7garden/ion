import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

const sizes = {
  'x-small': 'h-7 px-[10px] text-xs',
  'small':   'h-8 px-3 text-[13px]',
  'medium':  'h-9 px-[14px] text-sm',
  'large':   'h-10 px-4 text-[15px]',
} as const;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  inputSize?: keyof typeof sizes;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ inputSize = 'medium', error, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-[var(--radius-md)] bg-[var(--surface-default)] text-[var(--text-primary)]',
          'shadow-[0_0_0_1px_var(--border-default),var(--shadow-sm)]',
          'placeholder:text-[var(--text-tertiary)]',
          'transition-shadow duration-150',
          'focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--border-focus),var(--shadow-sm)]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          error && 'shadow-[0_0_0_1px_var(--state-error),var(--shadow-sm)]',
          sizes[inputSize],
          className,
        )}
        aria-invalid={error}
        {...props}
      />
    );
  },
);
