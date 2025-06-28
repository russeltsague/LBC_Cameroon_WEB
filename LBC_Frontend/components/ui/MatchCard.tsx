'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'

interface MatchCardProps {
  match: {
    id: string
    date: string
    time: string
    homeTeam: string
    awayTeam: string
    homeScore?: number
    awayScore?: number
    venue: string
    status: 'completed' | 'upcoming' | 'live'
  }
  isExpanded: boolean
  onExpand: () => void
  formatDate: (dateString: string) => string
}

export const MatchCard = ({ match, isExpanded, onExpand, formatDate }: MatchCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-orange-500/30 transition-colors"
    >
      <button
        onClick={onExpand}
        className="w-full p-3 text-left flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${match.status === 'completed' ? 'bg-green-500/10 text-green-400' : match.status === 'live' ? 'bg-red-500/10 text-red-400' : 'bg-gray-700 text-gray-400'}`}>
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {match.homeTeam} vs {match.awayTeam}
            </h3>
            <div className="flex items-center space-x-2 text-gray-400 mt-1">
              <span className="flex items-center text-xs">
                <ClockIcon className="w-3 h-3 mr-1" /> 
                {formatDate(match.date)} • {match.time}
              </span>
              <span className="flex items-center text-xs">
                <MapPinIcon className="w-3 h-3 mr-1" /> 
                {match.venue}
              </span>
            </div>
          </div>
        </div>
        
        {match.status === 'completed' ? (
          <div className="flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded-full">
            <span className="font-bold text-white text-sm">{match.homeScore}</span>
            <span className="text-gray-300 text-sm">-</span>
            <span className="font-bold text-white text-sm">{match.awayScore}</span>
          </div>
        ) : match.status === 'live' ? (
          <div className="bg-red-500/10 px-2 py-1 rounded-full text-xs text-red-400 flex items-center">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE
          </div>
        ) : (
          <div className="bg-gray-700/50 px-4 py-2 rounded-full text-sm text-gray-300">
            Upcoming
          </div>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-6"
          >
            <div className="pt-4 border-t border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    TEAM STATS
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Field Goals</p>
                      <p className="text-white font-medium">45% - 38%</p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">3-Pointers</p>
                      <p className="text-white font-medium">32% - 28%</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    VENUE DETAILS
                  </h4>
                  <p className="text-white">{match.venue}</p>
                  <button className="mt-3 text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center">
                    View venue information
                    {/* <ChevronDownIcon className="ml-2 w-4 h-4 transform rotate-90" /> */}
                  </button>
                </div>
              </div>
              <button className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                View full match details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}