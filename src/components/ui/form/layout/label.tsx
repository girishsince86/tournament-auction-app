import { cn } from '@/lib/utils';

interface LabelProps {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Label({
  htmlFor,
  required = false,
  children,
  className,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block font-body text-sm font-medium text-text-secondary mb-2',
        className
      )}
    >
      {children}
      {required && <span className="text-status-error ml-1">*</span>}
    </label>
  );
} 