// app/admin/layout.tsx
'use client'
import { ReactNode } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface AdminLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: AdminLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>
}