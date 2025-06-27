// components/CalendarSection.tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarIcon, ClockIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { MatchCard } from '../ui/MatchCard'
import { toast } from 'react-hot-toast'
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

export const CalendarSection = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedPoule, setSelectedPoule] = useState<string>('A')
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Show more/hide logic for matches
  const [visibleRows, setVisibleRows] = useState(2)
  const matchesPerRow = 2
  // Sort matches by date descending (latest first)
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const matchesToShow = visibleRows * matchesPerRow
  const visibleMatches = sortedMatches.slice(0, matchesToShow)
  const canShowMore = matchesToShow < sortedMatches.length

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

        // Restore last selected category from localStorage if available and valid
        const savedCategory = typeof window !== 'undefined' ? localStorage.getItem('calendarCategory') : null;
        const validSaved = sortedCategories.find(cat => cat.name === savedCategory);
        if (savedCategory && validSaved) {
          setActiveCategory(savedCategory)
        } else if (sortedCategories.length > 0) {
          setActiveCategory(sortedCategories[0].name)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  // Persist activeCategory to localStorage
  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem('calendarCategory', activeCategory)
    }
  }, [activeCategory])

  // Get current category data
  const currentCategory = categories.find(cat => cat.name === activeCategory)
  const hasPoules = currentCategory?.hasPoules || false
  const poules = currentCategory?.poules || []

  useEffect(() => {
    if (activeCategory) fetchMatches()
  }, [activeCategory, selectedPoule])

  // Reset poule selection when category changes
  useEffect(() => {
    setSelectedPoule('A')
  }, [activeCategory])

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/matches?category=${encodeURIComponent(activeCategory)}`
      
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

  return (
    <section id="calendar" className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container px-4 sm:px-6 md:px-8 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 md:mb-4">
            Calendrier des <span className="text-orange-400">Matchs</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-300 max-w-xl md:max-w-2xl mx-auto">
            Suivez tous les matchs et résultats de la saison en cours
          </p>
        </motion.div>

        {/* Category Selector: Dropdown for small/medium, buttons for large+ */}
        <div className="mb-8">
          <div className="md:hidden relative">
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

        {/* Matches List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading matches...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : matches.length > 0 ? (
          <>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {visibleMatches.map(match => (
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
            <div className="text-center mt-10 md:mt-16 flex flex-col items-center gap-4">
              {canShowMore && (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                  <button
                    onClick={() => setVisibleRows(v => v + 2)}
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                  >
                    Voir Plus de Matchs
                  </button>
                </motion.div>
              )}
              {visibleRows > 2 && (
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                  <button
                    onClick={() => setVisibleRows(2)}
                    className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 text-base md:text-lg mt-2"
                  >
                    Masquer les Matchs
                  </button>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400"
          >
            {hasPoules 
              ? `Aucun match programmé pour ${activeCategory} - Poule ${selectedPoule}`
              : `Aucun match programmé pour ${activeCategory}`
            }
          </motion.div>
        )}
      </div>
    </section>
  )
}
