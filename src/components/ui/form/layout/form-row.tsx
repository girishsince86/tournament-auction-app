import { cn } from '@/lib/utils';

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormRow({ children, className }: FormRowProps) {
  return (
    <div
      className={cn(
        'space-y-2',
        'w-full',
        className
      )}
    >
      {children}
    </div>
  );
} 