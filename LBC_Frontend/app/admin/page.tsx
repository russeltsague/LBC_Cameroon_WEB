// components/admin/AdminDashboard.tsx
'use client'
import { motion } from 'framer-motion'
import { FiSettings } from 'react-icons/fi'
import { DashboardCards } from '@/components/admin/DashboardCards'

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <div className="flex items-center space-x-4 text-gray-400">
            <FiSettings className="w-5 h-5" />
            <span>Cameroon Basketball League Management</span>
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
