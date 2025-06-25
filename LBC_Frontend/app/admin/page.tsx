// components/admin/AdminDashboard.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiSettings, 
  FiUsers, 
  FiCalendar, 
  FiBarChart, 
  FiPlus, 
  FiEdit2,
  FiGrid,
  FiTag,
  FiFileText,
  FiAward
} from 'react-icons/fi'
import { MatchResultsForm } from '@/components/admin/MatchResultForm'
import { TeamManagement } from '@/components/admin/TeamManagement'
import { DashboardCards } from '@/components/admin/DashboardCards'
import { MatchCalendarAdmin } from '@/components/admin/MatchCalendar'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
import { NewsManagement } from '@/components/admin/NewsManagement'
import { SponsorManagement } from '@/components/admin/SponsorManagement'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

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

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: <FiBarChart className="mr-2" />, label: 'Overview' },
            { id: 'calendar', icon: <FiGrid className="mr-2" />, label: 'Match Calendar' },
            { id: 'matches', icon: <FiCalendar className="mr-2" />, label: 'Match Results' },
            { id: 'teams', icon: <FiUsers className="mr-2" />, label: 'Team Management' },
            { id: 'categories', icon: <FiTag className="mr-2" />, label: 'Category Management' },
            { id: 'news', icon: <FiFileText className="mr-2" />, label: 'News Management' },
            { id: 'sponsors', icon: <FiAward className="mr-2" />, label: 'Sponsor Management' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 font-medium flex items-center border-b-2 transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[60vh]"
      >
        {activeTab === 'dashboard' && <DashboardCards />}
        {activeTab === 'calendar' && <MatchCalendarAdmin />}
        {activeTab === 'matches' && <MatchResultsForm />}
        {activeTab === 'teams' && <TeamManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'news' && <NewsManagement />}
        {activeTab === 'sponsors' && <SponsorManagement />}
      </motion.div>
    </div>
  )
}
