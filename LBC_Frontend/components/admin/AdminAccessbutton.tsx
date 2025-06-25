// components/AdminAccessButton.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiLock, FiUnlock, FiSettings, FiLogOut, FiUser } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function AdminAccessButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const router = useRouter()

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')
    
    if (token && user) {
      setIsAuthenticated(true)
      setAdminUser(JSON.parse(user))
    } else {
      setIsAuthenticated(false)
      setAdminUser(null)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
    setAdminUser(null)
    setShowPanel(false)
    router.push('/')
  }

  const handleAdminButtonClick = () => {
    if (!isAuthenticated) {
      // Navigate to login page
      router.push('/admin/login')
    } else {
      // Toggle panel for authenticated users
      setShowPanel(!showPanel)
    }
  }

  return (
    <>
      {/* Admin Button - Always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <button
          onClick={handleAdminButtonClick}
          className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-full shadow-lg transition-all duration-300 group border border-gray-600"
        >
          <FiSettings className="mr-2 group-hover:rotate-180 transition-transform" />
          Admin
        </button>
      </motion.div>

      {/* Admin Dashboard Panel - Shows when authenticated */}
      {showPanel && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-20 left-6 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 min-w-[250px]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Admin Access</span>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-300 mb-2">
              Welcome, {adminUser?.username}
            </div>
            
            <Link
              href="/admin"
              onClick={() => setShowPanel(false)}
              className="w-full flex items-center justify-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
            >
              <FiUnlock className="mr-2 w-4 h-4" />
              Open Dashboard
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              <FiLogOut className="mr-2 w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}

      {/* Admin Dashboard Button - Only visible when authenticated */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Link
            href="/admin"
            className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-full shadow-lg transition-all duration-300 group"
          >
            <FiUnlock className="mr-2 group-hover:rotate-45 transition-transform" />
            Dashboard
          </Link>
        </motion.div>
      )}
    </>
  )
}