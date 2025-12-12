'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCalendar, FiClock, FiList } from 'react-icons/fi'
import { WeeklyMatchForm } from '@/components/admin/matches/WeeklyMatchForm'
import { MatchScheduler } from '@/components/admin/calendar/MatchScheduler'

type WeeklyView = 'weekly' | 'scheduler'

export default function WeeklyPage() {
  const [activeView, setActiveView] = useState<WeeklyView>('weekly')

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
            Programmation
          </h1>
          <p className="text-gray-400 font-outfit mt-1">
            Gérez la programmation des matchs hebdomadaires et automatiques
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 max-w-md">
            <button
              onClick={() => setActiveView('weekly')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                activeView === 'weekly'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiCalendar className="w-4 h-4" />
              <span>Hebdomadaire</span>
            </button>
            <button
              onClick={() => setActiveView('scheduler')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                activeView === 'scheduler'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiClock className="w-4 h-4" />
              <span>Automatique</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeView === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <WeeklyMatchForm />
            </motion.div>
          )}

          {activeView === 'scheduler' && (
            <motion.div
              key="scheduler"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MatchScheduler />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
