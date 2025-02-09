'use client';

import { useAuth } from '@/features/auth/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user?.email?.endsWith('@pbel.in')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user?.email?.endsWith('@pbel.in')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 