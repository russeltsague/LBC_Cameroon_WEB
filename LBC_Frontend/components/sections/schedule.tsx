'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarIcon, ClockIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { getCategories, Category } from '@/app/lib/api'
import { MatchCard } from '../ui/MatchCard'

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
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedPoule, setSelectedPoule] = useState<string>('A')
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(0)

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
    fetchMatches()
  }, [activeCategory, selectedPoule])

  // Reset poule selection when category changes
  useEffect(() => {
    setSelectedPoule('A')
  }, [activeCategory])

  const fetchMatches = async () => {
    if (!activeCategory) return
    
    setLoading(true)
    setError(null)
    try {
      let url = `http://localhost:5000/api/matches?category=${encodeURIComponent(activeCategory)}`
      
      // Add poule filter if the category has poules
      if (hasPoules) {
        url += `&poule=${selectedPoule}`
      }
      
      const res = await fetch(url)
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

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Programme <span className="text-orange-400">Hebdomadaire</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Consultez le programme des matchs par semaine et par catégorie
          </p>
        </motion.div>

        {/* Category Selector */}
        <div className="md:hidden mb-8 relative">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between w-full px-6 py-3 bg-gray-800 rounded-lg text-white"
          >
            <span>{activeCategory}</span>
            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isCategoryOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 w-full mt-2 bg-gray-800 rounded-lg overflow-hidden shadow-xl"
              >
                {categories.map(category => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setActiveCategory(category.name)
                      setIsCategoryOpen(false)
                    }}
                    className={`w-full px-6 py-3 text-left ${activeCategory === category.name ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Category Selector */}
        <div className="hidden md:flex justify-center mb-12">
          <div className="inline-flex rounded-lg bg-gray-800 p-1">
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-6 py-2 rounded-md transition-colors ${activeCategory === category.name ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Poule Selection Buttons */}
        {hasPoules && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-gray-700 p-1">
              {poules.map(poule => (
                <button
                  key={poule}
                  onClick={() => setSelectedPoule(poule)}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    selectedPoule === poule
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Poule {poule}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Selection Display */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white">
            {activeCategory}
            {hasPoules && (
              <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
            )}
          </h3>
        </div>

        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
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

        {/* Matches List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading matches...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : currentWeekMatches.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 gap-4 max-w-4xl mx-auto"
          >
            {currentWeekMatches.map(match => (
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400"
          >
            {hasPoules 
              ? `Aucun match programmé pour ${activeCategory} - Poule ${selectedPoule} cette semaine`
              : `Aucun match programmé pour ${activeCategory} cette semaine`
            }
          </motion.div>
        )}
      </div>
    </section>
  )
} 