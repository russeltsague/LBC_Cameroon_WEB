'use client'
import { ReactNode } from 'react'

interface LoginLayoutProps {
  children: ReactNode
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950">
      {children}
    </div>
  )
} 