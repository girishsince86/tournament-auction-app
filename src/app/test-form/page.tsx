'use client';

import { RegistrationForm } from '@/features/tournaments/components/registration/registration-form';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function TestFormPage() {
  const handleSubmit = async (data: {
    playerName: string;
    email: string;
    phone: string;
    flatNumber: string;
  }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Simulate random success/failure
    if (Math.random() > 0.5) {
      toast.error('Registration failed. Please try again.');
      throw new Error('Random failure');
    }
    
    toast.success('Registration successful!');
    console.log('Form submitted:', data);
  };

  return (
    <div className={cn(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center',
      'bg-gradient-to-b',
      'from-primary-50',
      'to-background-primary',
      'py-12',
      'px-4',
      'sm:px-6',
      'lg:px-8'
    )}>
      <div className={cn(
        'w-full',
        'max-w-3xl',
        'space-y-8'
      )}>
        <div className={cn(
          'text-center',
          'space-y-4',
          'animate-fadeIn'
        )}>
          <h1 className={cn(
            'text-4xl',
            'font-bold',
            'text-primary-700',
            'font-heading',
            'tracking-tight',
            'sm:text-5xl'
          )}>
            Tournament Registration
          </h1>
          <p className={cn(
            'text-lg',
            'text-text-secondary',
            'font-body',
            'max-w-2xl',
            'mx-auto'
          )}>
            Please fill in your details to register for the tournament
          </p>
        </div>

        <div className={cn(
          'transform',
          'transition-all',
          'duration-500',
          'hover:translate-y-[-4px]',
          'animate-fadeIn',
          'delay-150'
        )}>
          <RegistrationForm
            onSubmit={handleSubmit}
            initialData={{
              playerName: 'John Doe',
              email: 'john@example.com',
            }}
          />
        </div>
      </div>
    </div>
  );
} 