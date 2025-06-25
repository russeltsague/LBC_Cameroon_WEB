// components/ScheduleSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { MatchCard } from '../ui/MatchCard'
import { getCategories, Category } from '@/app/lib/api'

type Match = {
  _id: string
  date: string
  time: string
  homeTeam: {
    _id: string
    name: string
    category: string
  } | string
  awayTeam: {
    _id: string
    name: string
    category: string
  } | string
  homeScore?: number
  awayScore?: number
  category: string
  venue: string
  status: 'completed' | 'upcoming' | 'live'
}

export const ScheduleSection = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:5000/api/matches')
      if (!res.ok) {
        throw new Error('Failed to fetch matches')
      }
      const data = await res.json()
      setMatches(data.data || [])
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Failed to load matches')
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getTeamName = (team: Match['homeTeam']) => {
    if (!team) return 'Unknown Team';
    if (typeof team === 'string') return 'Unknown Team';
    return team.name;
  }

  const getWeekDates = (weekOffset: number) => {
    const now = new Date()
    const startOfWeek = new Date(now)
    // Adjust to start from Monday (1) instead of Sunday (0)
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday
    startOfWeek.setDate(diff + (weekOffset * 7))
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return { startOfWeek, endOfWeek }
  }

  const getMatchesForWeek = (weekOffset: number) => {
    const { startOfWeek, endOfWeek } = getWeekDates(weekOffset)
    return matches.filter(match => {
      const matchDate = new Date(match.date)
      return matchDate >= startOfWeek && matchDate <= endOfWeek
    })
  }

  const currentWeekMatches = getMatchesForWeek(currentWeek)
  const weekDates = getWeekDates(currentWeek)

  // Group matches by category for the current week
  const matchesByCategory = currentWeekMatches.reduce((acc, match) => {
    if (!acc[match.category]) {
      acc[match.category] = []
    }
    acc[match.category].push(match)
    return acc
  }, {} as Record<string, Match[]>)

  return (
    <section className="py-12 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Calendrier <span className="text-orange-400">Hebdomadaire</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Matchs à venir pour la semaine en cours
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading matches...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setCurrentWeek(prev => prev - 1)}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>
              
              <h3 className="text-xl font-bold text-white">
                Semaine du {formatDate(weekDates.startOfWeek.toISOString())} au {formatDate(weekDates.endOfWeek.toISOString())}
              </h3>
              
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(matchesByCategory).map(([category, categoryMatches]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50"
                >
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-4">{category}</h3>
                    <motion.div 
                      layout
                      className="grid grid-cols-1 gap-4"
                    >
                      {categoryMatches.map(match => (
                        <MatchCard 
                          key={match._id}
                          match={{
                            id: match._id,
                            date: match.date,
                            time: match.time,
                            homeTeam: getTeamName(match.homeTeam),
                            awayTeam: getTeamName(match.awayTeam),
                            homeScore: match.homeScore,
                            awayScore: match.awayScore,
                            venue: match.venue,
                            status: match.status
                          }}
                          isExpanded={expandedMatch === match._id}
                          onExpand={() => setExpandedMatch(expandedMatch === match._id ? null : match._id)}
                          formatDate={formatDate}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {Object.keys(matchesByCategory).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun match programmé pour cette semaine
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
