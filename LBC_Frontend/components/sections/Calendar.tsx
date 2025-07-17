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
  journee?: number
  exemptTeam?: string
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
  const [selectedJournee, setSelectedJournee] = useState<number | null>(null);

  // Show more/hide logic for matches
  const [visibleRows, setVisibleRows] = useState(2)
  const matchesPerRow = 2
  // Sort matches by date descending (latest first)
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const matchesToShow = visibleRows * matchesPerRow
  const visibleMatches = sortedMatches.slice(0, matchesToShow)
  const canShowMore = matchesToShow < sortedMatches.length

  // Compute available journees from matches
  const journees = Array.from(new Set(matches.map(m => m.journee).filter(j => j != null))).sort((a, b) => Number(a) - Number(b));
  // Filter matches by selected journee
  const filteredMatches = selectedJournee ? matches.filter(m => m.journee === selectedJournee) : matches;

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

  // Set selectedJournee to first available when matches change
  useEffect(() => {
    if (journees.length > 0) {
      setSelectedJournee(journees[0]);
    }
  }, [JSON.stringify(journees)]);

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
    <section id="calendar" className="py-6 sm:py-16 md:py-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container px-2 sm:px-4 md:px-8 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 md:mb-16"
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

        {/* Journee Selector Navigation */}
        {journees.length > 0 && selectedJournee !== null && (
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={() => {
                const idx = journees.indexOf(selectedJournee);
                if (idx > 0) setSelectedJournee(journees[idx - 1]);
              }}
              disabled={journees.length <= 1 || journees.indexOf(selectedJournee) === 0}
              className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 bg-gray-800 text-gray-300 border-gray-700 hover:bg-orange-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-lg font-bold text-orange-400 min-w-[120px] text-center">
              {selectedJournee}{selectedJournee === 1 ? 'ère' : 'ème'} journée
            </span>
            <button
              onClick={() => {
                const idx = journees.indexOf(selectedJournee);
                if (idx < journees.length - 1) setSelectedJournee(journees[idx + 1]);
              }}
              disabled={journees.length <= 1 || journees.indexOf(selectedJournee) === journees.length - 1}
              className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 bg-gray-800 text-gray-300 border-gray-700 hover:bg-orange-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}

        {/* Current Selection Display */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white">
            {activeCategory}
            {hasPoules && (
              <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
            )}
            {selectedJournee && (
              <span className="text-orange-400 ml-2">- {selectedJournee}{selectedJournee === 1 ? 'ère' : 'ème'} journée</span>
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
        ) : filteredMatches.length > 0 ? (
          <div className="space-y-12 w-full">
            {Object.entries(
              filteredMatches.reduce((acc, match) => {
                const journee = match.journee || 1;
                if (!acc[journee]) acc[journee] = [];
                acc[journee].push(match);
                return acc;
              }, {} as Record<number, typeof matches>)
            )
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([journee, journeeMatches]) => (
                <div key={journee} className="bg-gray-900 rounded-2xl border border-gray-800 shadow-lg w-full relative">
                  <div className="bg-gray-800/90 px-2 sm:px-4 py-3 text-base sm:text-xl font-bold text-orange-400 border-b border-gray-700 rounded-t-2xl sticky top-0 z-10">
                    {journee}{journee === '1' ? 'ère' : 'ème'} journée
                  </div>
                  <div className="w-full">
                    <table className="w-full divide-y divide-gray-700 text-xs sm:text-sm md:text-base">
                      <thead className="bg-gray-800/80 sticky top-0 z-10">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-bold text-gray-300 uppercase tracking-wider text-center rounded-tl-2xl">N°</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-bold text-gray-300 uppercase tracking-wider text-center">Rencontres</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-bold text-gray-300 uppercase tracking-wider text-center rounded-tr-2xl">Scores</th>
                        </tr>
                      </thead>
                      <tbody>
                        {journeeMatches
                          .sort((a, b) => a._id.localeCompare(b._id))
                          .map((match, idx) => (
                          <tr key={match._id} className={
                            `transition-colors ${idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/60'} hover:bg-orange-100/10`
                          }>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-200 text-center font-semibold text-xs sm:text-base">{idx + 1}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                              <span className="font-bold text-white bg-gray-700/40 px-1 sm:px-2 py-1 rounded-lg shadow-sm text-xs sm:text-base">
                                {getTeamName(match.homeTeam)}
                              </span>
                              <span className="mx-1 sm:mx-2 text-orange-400 font-extrabold text-sm sm:text-lg align-middle">vs</span>
                              <span className="font-bold text-white bg-gray-700/40 px-1 sm:px-2 py-1 rounded-lg shadow-sm text-xs sm:text-base">
                                {getTeamName(match.awayTeam)}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                              {match.status === 'completed' ? (
                                <span className="font-bold text-orange-400 text-sm sm:text-lg bg-gray-800/60 px-2 sm:px-3 py-1 rounded-lg shadow">
                                  {match.homeScore} <span className="text-gray-400">#</span> {match.awayScore}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs sm:text-base">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {/* Optional: EXEMPT row if you have that info, e.g. journeeMatches[0].exemptTeam */}
                        {journeeMatches[0] && journeeMatches[0].exemptTeam && (
                          <tr>
                            <td colSpan={3} className="px-2 sm:px-4 py-2 sm:py-3 text-center bg-gray-800 text-orange-300 font-semibold rounded-b-2xl text-xs sm:text-base">
                              EXEMPT : {journeeMatches[0].exemptTeam}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
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
