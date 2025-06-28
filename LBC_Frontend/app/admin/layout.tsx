// app/admin/layout.tsx
'use client'
import { ReactNode } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthGuard } from '@/components/admin/AuthGuard'

interface AdminLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  )
}