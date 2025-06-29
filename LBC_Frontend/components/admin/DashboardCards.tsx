// components/admin/DashboardCards.tsx
'use client'
import { motion } from 'framer-motion'
import { FiEdit2, FiUsers, FiCalendar, FiAward, FiTrendingUp } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { getCategories, Category } from '@/app/lib/api'

interface DashboardStats {
  totalTeams: number
  totalMatches: number
  completedMatches: number
  upcomingMatches: number
  categories: number
}

export const DashboardCards = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalMatches: 0,
    completedMatches: 0,
    upcomingMatches: 0,
    categories: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedPoule, setSelectedPoule] = useState<string>('A')

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
        
        // Set initial category
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].name)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  // Get current category data
  const currentCategory = categories.find(cat => cat.name === selectedCategory)
  const hasPoules = currentCategory?.hasPoules || false
  const poules = currentCategory?.poules || []

  useEffect(() => {
    fetchStats()
  }, [selectedCategory, selectedPoule])

  // Reset poule selection when category changes
  useEffect(() => {
    setSelectedPoule('A')
  }, [selectedCategory])

  const fetchStats = async () => {
    if (!selectedCategory) return
    
    try {
      setLoading(true)
      setError(null)

      // Build URLs with poule filter if applicable
      let matchesUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/matches?category=${encodeURIComponent(selectedCategory)}`
      let teamsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/teams?category=${encodeURIComponent(selectedCategory)}`
      
      if (hasPoules) {
        matchesUrl += `&poule=${selectedPoule}`
        teamsUrl += `&poule=${selectedPoule}`
      }

      // Fetch matches
      const matchesRes = await fetch(matchesUrl)
      if (!matchesRes.ok) throw new Error('Failed to fetch matches')
      const matchesData = await matchesRes.json()
      const matches = matchesData.data || []

      // Fetch teams
      const teamsRes = await fetch(teamsUrl)
      if (!teamsRes.ok) throw new Error('Failed to fetch teams')
      const teamsData = await teamsRes.json()
      const teams = (teamsData.data || teamsData) || []

      // Calculate stats
      const completedMatches = matches.filter((match: any) => match.status === 'completed').length
      const upcomingMatches = matches.filter((match: any) => match.status === 'upcoming').length
      const totalMatches = completedMatches + upcomingMatches

      setStats({
        totalTeams: teams.length,
        totalMatches,
        completedMatches,
        upcomingMatches,
        categories: categories.length
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const statItems = [
    { 
      name: 'Équipes actives', 
      value: stats.totalTeams.toString(), 
      change: 'dans la catégorie',
      icon: FiUsers 
    },
    { 
      name: 'Matchs joués', 
      value: stats.completedMatches.toString(), 
      change: 'dans la catégorie',
      icon: FiCalendar 
    },
    { 
      name: 'Résultats en attente', 
      value: stats.upcomingMatches.toString(), 
      change: 'à mettre à jour',
      icon: FiEdit2 
    },
    { 
      name: 'Catégories actives', 
      value: stats.categories.toString(), 
      change: 'avec des matchs',
      icon: FiAward 
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-800 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-800 rounded w-16 mb-4" />
            <div className="h-4 bg-gray-800 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Selector: Dropdown for small/medium, buttons for large+ */}
      <div className="mb-4">
        <div className="lg:hidden flex justify-center">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            {categories.map(category => (
              <option key={category.name} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden lg:flex flex-wrap gap-2 sm:gap-4">
          {categories.map((category) => (
            <motion.button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.name
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
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {poules.map((poule) => (
            <motion.button
              key={poule}
              onClick={() => setSelectedPoule(poule)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
      )}

      {/* Current Selection Display */}
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-bold text-white">
          {selectedCategory}
          {hasPoules && (
            <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
          )}
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-orange-500/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">{stat.name}</h3>
              <stat.icon className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
          </motion.div>
        ))}

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="md:col-span-2 lg:col-span-4 bg-gray-900 rounded-lg p-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Activité Récente</h3>
          <div className="space-y-4">
            {/* Implementation of recent activity section */}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
