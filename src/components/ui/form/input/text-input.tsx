import { cn } from '@/lib/utils';
import { FormFieldProps } from '../types';

interface TextInputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'tel';
  maxLength?: number;
  placeholder?: string;
}

export function TextInput({
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  disabled,
  required,
  maxLength,
  placeholder,
  className,
}: TextInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className={cn(
          'w-full',
          'font-body',
          'text-base',
          'text-text-primary',
          'bg-background-tertiary',
          'bg-opacity-50',
          'backdrop-blur-sm',
          'border',
          'border-text-tertiary/20',
          'rounded-lg',
          'px-4',
          'py-3',
          'placeholder:text-text-tertiary/50',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary-500/50',
          'focus:border-primary-500/50',
          'disabled:opacity-50',
          'disabled:cursor-not-allowed',
          'transition-all',
          'duration-200',
          'hover:border-text-tertiary/30',
          error && [
            'border-status-error',
            'focus:ring-status-error/50',
            'focus:border-status-error/50',
          ],
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
      />
      {error && (
        <p className="absolute -bottom-6 left-0 text-status-error text-sm mt-1 animate-slideIn">
          {error}
        </p>
      )}
    </div>
  );
} 