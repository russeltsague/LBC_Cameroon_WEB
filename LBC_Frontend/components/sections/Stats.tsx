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
        // Move 'CORPORATES' to the end
        const sortedCategories = [...categoriesData].sort((a, b) => {
          if (a.name === 'CORPORATES') return 1;
          if (b.name === 'CORPORATES') return -1;
          return 0;
        })
        setCategories(sortedCategories)
        
        // Set initial category
        if (sortedCategories.length > 0) {
          setActiveCategory(sortedCategories[0].name)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  // Restore last selected category from localStorage if available and valid
  useEffect(() => {
    const savedCategory = typeof window !== 'undefined' ? localStorage.getItem('statsCategory') : null;
    const validSaved = categories.find(cat => cat.name === savedCategory);
    if (savedCategory && validSaved) {
      setActiveCategory(savedCategory)
    } else if (categories.length > 0) {
      setActiveCategory(categories[0].name)
    }
  }, [categories])

  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem('statsCategory', activeCategory)
      // fetch stats or data here if needed
    }
  }, [activeCategory])

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
        let matchesUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/matches?category=${encodeURIComponent(activeCategory)}`
        let teamsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/teams?category=${encodeURIComponent(activeCategory)}`
        
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

  // Update statItems to use French names:
  const statItems = [
    { 
      id: 1, 
      name: 'Équipes actives', 
      value: stats.totalTeams.toString(), 
      icon: FiUsers 
    },
    { 
      id: 2, 
      name: 'Matchs joués', 
      value: stats.matchesPlayed.toString(), 
      icon: FiActivity 
    },
    { 
      id: 3, 
      name: 'Matchs à jouer', 
      value: stats.matchesToPlay.toString(), 
      icon: FiAward 
    },
    { 
      id: 4, 
      name: 'Achèvement', 
      value: `${stats.completionPercentage}%`, 
      icon: FiPercent 
    }
  ]

  if (loading) {
    return (
      <section className="py-6 sm:py-16 md:py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container px-4 sm:px-6 md:px-8 mx-auto">
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
      <section className="py-6 sm:py-16 md:py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container px-4 sm:px-6 md:px-8 mx-auto">
          <div className="text-center text-red-500">
            {error}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-6 sm:py-16 md:py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container px-4 sm:px-6 md:px-8 mx-auto">
        {/* Category Selection: Dropdown for small/medium, buttons for large+ */}
        <div className="mb-6 md:mb-12">
          <div className="flex justify-center lg:hidden">
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="hidden lg:flex flex-wrap justify-center gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeCategory === category.name
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
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

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-orange-400 mb-8 text-center drop-shadow-lg tracking-wide uppercase">Statistics</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6 max-w-7xl mx-auto">
          {statItems.map((stat, index) => (
            <div key={stat.id} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex flex-col items-center justify-center shadow-lg w-full h-full min-h-[100px]">
              <stat.icon className="w-8 h-8 text-orange-400 mb-2" />
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-2xl font-extrabold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 font-semibold text-center">{stat.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}