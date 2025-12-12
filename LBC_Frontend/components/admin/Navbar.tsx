'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FiHome,
    FiUsers,
    FiCalendar,
    FiFileText,
    FiAward,
    FiSettings,
    FiBarChart,
    FiLogOut,
    FiMenu,
    FiX,
    FiClock,
    FiClipboard
} from 'react-icons/fi'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Équipes', href: '/admin/teams', icon: FiUsers },
    { name: 'Matches', href: '/admin/matches', icon: FiCalendar },
    { name: 'Calendar', href: '/admin/calendar', icon: FiCalendar },
    { name: 'Weekly', href: '/admin/weekly', icon: FiClock },
    { name: 'Rapports', href: '/admin/reports', icon: FiClipboard },
    { name: 'Actualités', href: '/admin/news', icon: FiFileText },
    { name: 'Sponsors', href: '/admin/sponsors', icon: FiAward },
    { name: 'Catégories', href: '/admin/categories', icon: FiSettings },
    { name: 'Statistiques', href: '/admin/stats', icon: FiBarChart },
]

export const Navbar = () => {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        sessionStorage.removeItem('adminToken')
        sessionStorage.removeItem('adminUser')
        window.location.href = '/admin/login'
    }

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-xl border-b border-white/10 z-50 items-center px-6">
                {/* Logo */}
                <div className="flex items-center space-x-3 mr-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <span className="text-white font-bold text-lg font-oswald">A</span>
                    </div>
                    <span className="text-white font-bold text-xl font-oswald tracking-wide uppercase">ADMIN</span>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 flex items-center space-x-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                                    isActive
                                        ? 'bg-gradient-to-r from-orange-500/10 to-red-600/10 text-white border border-orange-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <item.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-orange-500' : 'text-gray-500 group-hover:text-white'} transition-colors`} />
                                <span className="font-medium font-outfit text-sm">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                >
                    <FiLogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    <span className="font-medium font-outfit text-sm">Déconnexion</span>
                </button>
            </nav>

            {/* Mobile Navbar */}
            <nav className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <span className="text-white font-bold text-sm font-oswald">A</span>
                    </div>
                    <span className="text-white font-bold text-lg font-oswald tracking-wide uppercase">ADMIN</span>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 pt-16"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="absolute right-0 top-16 bottom-0 w-64 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="space-y-2">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-orange-500/10 to-red-600/10 text-white border border-orange-500/20'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-orange-500' : 'text-gray-500 group-hover:text-white'} transition-colors`} />
                                            <span className="font-medium font-outfit">{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </div>

                            {/* Mobile Logout */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-3 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                                >
                                    <FiLogOut className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                                    <span className="font-medium font-outfit">Déconnexion</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer for fixed navbar */}
            <div className="h-16" />
        </>
    )
}
