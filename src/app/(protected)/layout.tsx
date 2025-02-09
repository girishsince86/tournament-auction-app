'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/features/auth/context/auth-context'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  )
} 