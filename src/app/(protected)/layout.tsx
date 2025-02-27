'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import '@/lib/mui-license';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
} 