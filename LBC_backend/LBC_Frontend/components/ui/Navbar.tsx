'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Équipes', href: '/featured' },
  { name: 'Programmation', href: '/schedule' },
  { name: 'Calendrier', href: '/calendar' },
  { name: 'Classement', href: '/classification' },
  { name: 'Statistiques', href: '/stats' },
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-110">
              <img
                src="/LBC logo.png"
                alt="LBC Logo"
                className="object-contain w-full h-full drop-shadow-lg"
              />
            </div>
            <div className="hidden sm:block">
              <span className="block text-white font-display font-bold text-xl tracking-wide leading-none group-hover:text-[var(--color-primary)] transition-colors">
                Ligue Basketball
              </span>
              <span className="block text-sm text-[var(--color-primary)] font-medium tracking-widest uppercase">
                Centre
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = item.href === '/admin' ? pathname.startsWith('/admin') : pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 group overflow-hidden ${isActive
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                    }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg shadow-lg shadow-[var(--color-primary)]/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? (
              <XMarkIcon className="w-8 h-8" />
            ) : (
              <Bars3Icon className="w-8 h-8" />
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden glass rounded-b-2xl border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const isActive = item.href === '/admin' ? pathname.startsWith('/admin') : pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
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
  <footer className="w-full bg-[var(--color-surface)] border-t border-white/5 py-8 mt-auto">
    <div className="container mx-auto px-4 text-center">
      <p className="text-gray-400 text-sm">
        © {new Date().getFullYear()} Ligue Basketball Centre Cameroon. Tous droits réservés.
      </p>
    </div>
  </footer>
)