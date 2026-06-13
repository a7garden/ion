import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

const variants = {
  primary:   'bg-[var(--interactive-primary)] text-[var(--text-inverse)] hover:bg-[var(--interactive-primary-hover)] active:bg-[var(--interactive-primary-active)] shadow-sm',
  secondary: 'bg-[var(--interactive-bg)] text-[var(--interactive-text)] hover:bg-[var(--surface-muted)]',
  ghost:     'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-muted)]',
  outline:   'bg-transparent text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-default)] hover:shadow-[inset_0_0_0_1px_var(--border-strong)]',
  destructive: 'bg-[var(--state-error)] text-white hover:bg-[var(--state-error-hover)]',
} as const;

const sizes = {
  'x-small': 'h-7 px-[10px] text-xs',
  'small':   'h-8 px-3 text-[13px]',
  'medium':  'h-9 px-[14px] text-sm',
  'large':   'h-10 px-4 text-[15px]',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', size = 'medium', loading, disabled, className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:pointer-events-none',
          'touch-target',
          variants[variant],
          sizes[size],
          loading && 'cursor-wait',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
