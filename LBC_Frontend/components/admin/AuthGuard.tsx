'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken')
      const user = localStorage.getItem('adminUser')

      if (!token || !user) {
        setIsAuthenticated(false)
        setIsLoading(false)
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
        return
      }

      try {
        // Verify token with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // Token is invalid, clear storage and redirect
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          setIsAuthenticated(false)
          if (pathname !== '/admin/login') {
            router.push('/admin/login')
          }
        }
      } catch (error) {
        console.error('Auth verification error:', error)
        // Network error, assume token is invalid
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        setIsAuthenticated(false)
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to allow localStorage to be updated after login
    const timer = setTimeout(checkAuth, 100)
    
    return () => clearTimeout(timer)
  }, [router, pathname])

  // Skip authentication for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying authentication...</p>
        </motion.div>
      </div>
    )
  }

  // If not authenticated, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to login...</p>
        </motion.div>
      </div>
    )
  }

  // If authenticated, render children
  return <>{children}</>
} 