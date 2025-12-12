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
    FiChevronLeft,
    FiChevronRight,
    FiClock
} from 'react-icons/fi'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Équipes', href: '/admin/teams', icon: FiUsers },
    { name: 'Matches', href: '/admin/matches', icon: FiCalendar },
    { name: 'Calendar', href: '/admin/calendar', icon: FiCalendar },
    { name: 'Weekly', href: '/admin/weekly', icon: FiClock },
    { name: 'Actualités', href: '/admin/news', icon: FiFileText },
    { name: 'Sponsors', href: '/admin/sponsors', icon: FiAward },
    { name: 'Catégories', href: '/admin/categories', icon: FiSettings },
    { name: 'Statistiques', href: '/admin/stats', icon: FiBarChart },
]

export const Sidebar = () => {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        sessionStorage.removeItem('adminToken')
        sessionStorage.removeItem('adminUser')
        window.location.href = '/admin/login'
    }

    return (
        <motion.div
            className={`fixed left-0 top-0 h-full bg-gray-900/50 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
            initial={false}
            animate={{ width: collapsed ? 80 : 256 }}
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-center border-b border-white/10 relative">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <span className="text-white font-bold text-lg font-oswald">A</span>
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-white font-bold text-xl font-oswald tracking-wide whitespace-nowrap overflow-hidden"
                            >
                                ADMIN
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                    {collapsed ? <FiChevronRight className="w-3 h-3" /> : <FiChevronLeft className="w-3 h-3" />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-orange-500/10 to-red-600/10 text-white border border-orange-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-orange-500' : 'text-gray-500 group-hover:text-white'} transition-colors`} />

                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="ml-3 font-medium font-outfit whitespace-nowrap overflow-hidden"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute left-0 w-1 h-full bg-orange-500 rounded-r-full"
                                />
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* User & Logout */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-3 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group`}
                >
                    <FiLogOut className="w-5 h-5 min-w-[20px] group-hover:translate-x-1 transition-transform" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="ml-3 font-medium font-outfit whitespace-nowrap overflow-hidden"
                            >
                                Déconnexion
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    )
}
