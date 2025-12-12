'use client'

import { motion } from 'framer-motion'
import { StatsCards } from '@/components/admin/dashboard/StatsCards'
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity'
import { FiPlus, FiCalendar, FiFileText } from 'react-icons/fi'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
            Tableau de Bord
          </h1>
          <p className="text-gray-400 font-outfit mt-1">
            Bienvenue sur l'interface d'administration LBC
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/calendar"
            className="px-4 py-2 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors flex items-center space-x-2 font-outfit"
          >
            <FiCalendar className="w-4 h-4" />
            <span>Programmer</span>
          </Link>
          <Link
            href="/admin/news"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center space-x-2 font-outfit"
          >
            <FiPlus className="w-4 h-4" />
            <span>Nouvelle Actu</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Links / Status */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-4 font-oswald tracking-wide">État du Système</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-outfit">Serveur API</span>
                <span className="flex items-center text-green-400 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-outfit">Base de données</span>
                <span className="flex items-center text-green-400 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Connecté
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-outfit">Version</span>
                <span className="text-white font-mono text-sm">v2.0.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
