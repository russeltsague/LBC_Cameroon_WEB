'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Équipes', href: '/featured' },
  { name: 'Statistiques', href: '/stats' },
  { name: 'Calendrier', href: '/calendar' },
  { name: 'Classement', href: '/classification' },
  { name: 'Programme', href: '/schedule' },
  { name: 'Actualités', href: '/news' },
  { name: 'Sponsors', href: '/sponsors' },
  // Admin button at the end
  { name: 'Admin', href: '/admin' },
]

export const Navbar = () => {
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
      scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800/50' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
              <span className="text-white font-bold text-sm lg:text-base">LBC</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg lg:text-xl tracking-wide leading-tight">
                Ligue Basketball Centre
              </span>
              <div className="text-xs text-orange-400 font-medium tracking-wide">Cameroon</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {navigation.map((item) => {
              // Highlight Admin for any /admin route
              const isActive = item.href === '/admin' ? pathname.startsWith('/admin') : pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 relative overflow-hidden group min-w-[90px] text-center ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/80'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
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
          <div className="hidden md:flex lg:hidden items-center space-x-1 overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {navigation.map((item) => {
              const isActive = item.href === '/admin' ? pathname.startsWith('/admin') : pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 min-w-[80px] text-center ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {item.name}
                </Link>
              )
            })}
            {/* Remove Plus button, show all items */}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Ouvrir le menu"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            {isOpen ? (
              <XMarkIcon className="w-7 h-7" />
            ) : (
              <Bars3Icon className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-gray-900/95 backdrop-blur-md rounded-lg mt-2 overflow-x-auto border border-gray-800/50 max-w-full"
            >
              <div className="flex flex-col px-2 py-2 space-y-1 min-w-[220px]">
                {navigation.map((item) => {
                  const isActive = item.href === '/admin' ? pathname.startsWith('/admin') : pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-4 rounded-md text-base font-semibold tracking-wide transition-all duration-200 min-w-[120px] text-center ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {item.name}
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
                {navigation.slice(4).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-md text-sm font-semibold tracking-wide transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {item.name}
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

export const Footer = () => (
  <footer className="w-full bg-gray-900 border-t border-gray-800 py-6 mt-12 text-center text-gray-400 text-sm">
    <div className="container mx-auto px-4">
      © {new Date().getFullYear()} Ligue Basketball Centre Cameroon. Tous droits réservés.
    </div>
  </footer>
) 