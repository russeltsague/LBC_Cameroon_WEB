'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCalendar, FiList } from 'react-icons/fi'
import { CalendarGenerator } from '@/components/admin/calendar/CalendarGenerator'
import { CalendarViewer } from '@/components/admin/calendar/CalendarViewer'

type CalendarView = 'calendars' | 'generator'

export default function AdminCalendarPage() {
  const [activeView, setActiveView] = useState<CalendarView>('generator')

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 max-w-md">
            <button
              onClick={() => setActiveView('calendars')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                activeView === 'calendars'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiCalendar className="w-4 h-4" />
              <span>Calendriers</span>
            </button>
            <button
              onClick={() => setActiveView('generator')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                activeView === 'generator'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiList className="w-4 h-4" />
              <span>Générateur</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeView === 'calendars' && (
            <motion.div
              key="calendars"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarViewer />
            </motion.div>
          )}
          
          {activeView === 'generator' && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}