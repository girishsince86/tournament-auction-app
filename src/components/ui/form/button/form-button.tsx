import { cn } from '@/lib/utils';
import { FormButtonProps } from '../types';

const variants = {
  primary: `
    bg-gradient-to-r
    from-primary-500
    to-primary-600
    text-white
    shadow-md
    shadow-primary-500/20
    hover:shadow-lg
    hover:shadow-primary-500/30
    hover:from-primary-600
    hover:to-primary-700
    focus:ring-2
    focus:ring-primary-500/50
    focus:ring-offset-2
    focus:ring-offset-background-primary
  `,
  secondary: `
    bg-gradient-to-r
    from-secondary-300
    to-secondary-400
    text-white
    shadow-md
    shadow-secondary-300/20
    hover:shadow-lg
    hover:shadow-secondary-300/30
    hover:from-secondary-400
    hover:to-secondary-500
    focus:ring-2
    focus:ring-secondary-300/50
    focus:ring-offset-2
    focus:ring-offset-background-primary
  `,
  tertiary: `
    bg-background-tertiary
    bg-opacity-50
    backdrop-blur-sm
    text-text-primary
    border
    border-text-tertiary/20
    hover:bg-background-tertiary
    hover:border-text-tertiary/30
    focus:ring-2
    focus:ring-text-tertiary/30
    focus:ring-offset-2
    focus:ring-offset-background-primary
  `,
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function FormButton({
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  onClick,
  className,
}: FormButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        'relative',
        'inline-flex',
        'items-center',
        'justify-center',
        'font-body',
        'font-semibold',
        'rounded-lg',
        'transition-all',
        'duration-200',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
        'disabled:shadow-none',
        'disabled:hover:shadow-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className={cn(
        'transform transition-transform duration-200',
        isLoading && 'invisible',
        !disabled && !isLoading && 'group-hover:scale-105'
      )}>
        {children}
      </span>
    </button>
  );
} 