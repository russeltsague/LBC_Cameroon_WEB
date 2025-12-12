'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface AuthGuardProps {
  children: React.ReactNode
}

// TESTING MODE: Set to true to bypass authentication
// WARNING: Set to false in production!
const TESTING_MODE = true

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      // TESTING MODE: Always authenticate
      if (TESTING_MODE) {
        setIsAuthenticated(true)
        // Auto-create a test token if it doesn't exist
        if (!localStorage.getItem('adminToken')) {
          localStorage.setItem('adminToken', 'test-token-' + Date.now())
          localStorage.setItem('adminUser', JSON.stringify({
            username: 'test-admin',
            role: 'admin'
          }))
        }
        // Redirect from login page to dashboard
        if (pathname === '/admin/login') {
          router.push('/admin')
        }
        return
      }

      // PRODUCTION MODE: Normal authentication
      const token = localStorage.getItem('adminToken')
      const isLoginPage = pathname === '/admin/login'

      if (token) {
        setIsAuthenticated(true)
        if (isLoginPage) {
          router.push('/admin')
        }
      } else {
        setIsAuthenticated(false)
        if (!isLoginPage) {
          router.push('/admin/login')
        }
      }
    }

    // Check auth immediately
    checkAuth()

    // Add event listener for storage changes (in case of logout in another tab)
    window.addEventListener('storage', checkAuth)

    return () => window.removeEventListener('storage', checkAuth)
  }, [router, pathname])

  // TESTING MODE: Skip loading state
  if (TESTING_MODE) {
    return <>{children}</>
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400 font-outfit">Vérification de l'accès...</p>
        </motion.div>
      </div>
    )
  }

  // If on login page and not authenticated, render children (login form)
  if (pathname === '/admin/login' && !isAuthenticated) {
    return <>{children}</>
  }

  // If on protected route and authenticated, render children (dashboard)
  if (pathname !== '/admin/login' && isAuthenticated) {
    return <>{children}</>
  }

  // Otherwise (e.g. redirecting), show loading or nothing
  return null
} 