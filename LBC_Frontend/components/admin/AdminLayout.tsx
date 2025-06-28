// components/admin/AdminLayout.tsx
'use client'
import { motion } from 'framer-motion'
import { AdminNavbar } from './AdminNavbar'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin Navigation */}
      <AdminNavbar />

      <main className="container mx-auto px-6 py-8 pt-24">
        {children}
      </main>
    </div>
  )
}
