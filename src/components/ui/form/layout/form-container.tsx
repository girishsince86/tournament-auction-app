import { cn } from '@/lib/utils';

interface FormContainerProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export function FormContainer({
  onSubmit,
  children,
  className,
}: FormContainerProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className={cn(
        'bg-background-secondary',
        'backdrop-blur-sm',
        'bg-opacity-80',
        'rounded-xl',
        'shadow-lg',
        'border',
        'border-text-tertiary/10',
        'p-6',
        'md:p-8',
        'space-y-8',
        'animate-fadeIn',
        'transition-all',
        'duration-300',
        'hover:shadow-xl',
        'hover:border-primary-500/20',
        className
      )}
    >
      {children}
    </form>
  );
} 