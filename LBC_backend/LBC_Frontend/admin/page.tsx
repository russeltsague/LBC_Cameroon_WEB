// components/admin/AdminDashboard.tsx
'use client'
import { motion } from 'framer-motion'
import { FiSettings } from 'react-icons/fi'
import { DashboardCards } from '@/components/admin/DashboardCards'

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 font-oswald tracking-wide uppercase">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-2 text-gray-400 font-outfit">
            <FiSettings className="w-4 h-4" />
            <span>Cameroon Basketball League Management System</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 font-outfit">
            Saison 2024-2025
          </div>
        </div>
      </motion.div>

      {/* Dashboard Content */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[60vh]"
      >
        <DashboardCards />
      </motion.div>
    </div>
  )
}
