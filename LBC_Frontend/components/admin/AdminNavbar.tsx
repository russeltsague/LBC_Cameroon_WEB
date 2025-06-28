'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  FiArrowLeft, 
  FiLogOut,
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiAward,
  FiSettings
} from 'react-icons/fi'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: FiHome },
  { name: 'Équipes', href: '/admin/teams', icon: FiUsers },
  { name: 'Calendrier', href: '/admin/calendar', icon: FiCalendar },
  { name: 'Actualités', href: '/admin/news', icon: FiFileText },
  { name: 'Sponsors', href: '/admin/sponsors', icon: FiAward },
  { name: 'Catégories', href: '/admin/categories', icon: FiSettings },
]

export const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800/50' : 'bg-gray-900 border-b border-gray-800'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo and Back to Site */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-orange-400 hover:text-orange-300 transition-colors">
              <FiArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:block font-medium">Retour au site</span>
            </Link>
            
            <div className="hidden md:block w-px h-6 bg-gray-700"></div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-white font-bold text-lg hidden sm:block">Admin Panel</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 relative overflow-hidden group flex items-center space-x-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="relative z-10">{item.name}</span>
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{ originX: 0 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Medium Screen Navigation */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {adminNavigation.slice(0, 3).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-2 rounded-md text-xs font-semibold tracking-wide text-gray-300 hover:text-white hover:bg-gray-800 transition-colors flex items-center space-x-1"
            >
              <FiSettings className="w-3 h-3" />
              <span>Plus</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white flex items-center px-3 py-2 rounded-md hover:bg-gray-800 transition-colors">
              <FiLogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:block text-sm font-medium">Déconnexion</span>
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-gray-900/95 backdrop-blur-md rounded-lg mt-2 overflow-hidden border border-gray-800/50"
            >
              <div className="px-2 py-2 space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-md text-sm font-semibold tracking-wide transition-all duration-200 flex items-center space-x-3 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medium Screen Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block lg:hidden bg-gray-900/95 backdrop-blur-md rounded-lg mt-2 overflow-hidden border border-gray-800/50"
            >
              <div className="px-2 py-2 space-y-1">
                {adminNavigation.slice(3).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-md text-sm font-semibold tracking-wide transition-all duration-200 flex items-center space-x-3 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
} 