'use client'

import { motion } from 'framer-motion'
import { FiAward, FiUsers, FiActivity, FiPercent } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { getCategories, Category } from '@/app/lib/api'

type Match = {
  _id: string
  status: 'completed' | 'upcoming' | 'live'
  category: string
  homeTeam: string | { _id: string }
  awayTeam: string | { _id: string }
}

type Team = {
  _id: string
  category: string
}

type Stats = {
  totalTeams: number
  matchesPlayed: number
  matchesToPlay: number
  completionPercentage: number
}

export const StatsSection = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats>({
    totalTeams: 0,
    matchesPlayed: 0,
    matchesToPlay: 0,
    completionPercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('')
  const [selectedPoule, setSelectedPoule] = useState<string>('A')

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
        
        // Set initial category
        if (categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].name)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  // Get current category data
  const currentCategory = categories.find(cat => cat.name === activeCategory)
  const hasPoules = currentCategory?.hasPoules || false
  const poules = currentCategory?.poules || []

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeCategory) return
      
      try {
        setLoading(true)
        setError(null)

        // Build URL with poule filter if applicable
        let matchesUrl = `${process.env.NEXT_PUBLIC_API_URL}/matches?category=${encodeURIComponent(activeCategory)}`
        let teamsUrl = `${process.env.NEXT_PUBLIC_API_URL}/teams?category=${encodeURIComponent(activeCategory)}`
        
        if (hasPoules) {
          matchesUrl += `&poule=${selectedPoule}`
          teamsUrl += `&poule=${selectedPoule}`
        }

        // Fetch matches
        const matchesRes = await fetch(matchesUrl)
        if (!matchesRes.ok) throw new Error('Failed to fetch matches')
        const matchesData = await matchesRes.json()
        const matches: Match[] = matchesData.data || []

        // Fetch teams
        const teamsRes = await fetch(teamsUrl)
        if (!teamsRes.ok) throw new Error('Failed to fetch teams')
        const teamsData = await teamsRes.json()
        
        // Handle both old and new API response formats
        const teams: Team[] = (teamsData.data || teamsData) || []

        // Calculate stats
        const matchesPlayed = matches.filter(match => match.status === 'completed').length
        const matchesToPlay = matches.filter(match => match.status === 'upcoming').length
        const totalMatches = matchesPlayed + matchesToPlay
        const completionPercentage = totalMatches > 0 ? Math.round((matchesPlayed / totalMatches) * 100) : 0

        // Get unique teams that have played or are scheduled to play
        const teamsInMatches = new Set([
          ...matches.map(match => 
            typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam._id
          ),
          ...matches.map(match => 
            typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam._id
          )
        ])

        setStats({
          totalTeams: teamsInMatches.size,
          matchesPlayed,
          matchesToPlay,
          completionPercentage
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [activeCategory, selectedPoule, hasPoules])

  // Reset poule selection when category changes
  useEffect(() => {
    setSelectedPoule('A')
  }, [activeCategory])

  const statItems = [
    { 
      id: 1, 
      name: 'Active Teams', 
      value: stats.totalTeams.toString(), 
      icon: FiUsers 
    },
    { 
      id: 2, 
      name: 'Matches Played', 
      value: stats.matchesPlayed.toString(), 
      icon: FiActivity 
    },
    { 
      id: 3, 
      name: 'Matches to Play', 
      value: stats.matchesToPlay.toString(), 
      icon: FiAward 
    },
    { 
      id: 4, 
      name: 'Completion', 
      value: `${stats.completionPercentage}%`, 
      icon: FiPercent 
    }
  ]

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 animate-pulse">
                <div className="flex items-center">
                  <div className="p-4 rounded-lg bg-gray-700/50 mr-6 w-16 h-16" />
                  <div className="flex-1">
                    <div className="h-8 bg-gray-700/50 rounded w-24 mb-2" />
                    <div className="h-4 bg-gray-700/50 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container px-6 mx-auto">
          <div className="text-center text-red-500">
            {error}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container px-6 mx-auto">
        {/* Category Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Category Statistics</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeCategory === category.name
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Poule Selection Buttons */}
        {hasPoules && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              {poules.map((poule) => (
                <motion.button
                  key={poule}
                  onClick={() => setSelectedPoule(poule)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedPoule === poule
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Poule {poule}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Current Selection Display */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-white">
            {activeCategory}
            {hasPoules && (
              <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
            )}
          </h3>
        </div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-center">
                <div className="p-4 rounded-lg bg-orange-500/10 mr-6">
                  <stat.icon className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-gray-400">{stat.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}