// components/CalendarSection.tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarIcon, ClockIcon, ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline'
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
    logo?: string
  } | string
  awayTeam: {
    _id: string
    name: string
    category: string
    logo?: string
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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJournee, setSelectedJournee] = useState<number | null>(null);

  // Compute available journees from matches
  const journees = Array.from(new Set(matches.map(m => m.journee).filter(j => j != null))).sort((a, b) => Number(a) - Number(b));
  // Filter matches by selected journee
  const filteredMatches = selectedJournee ? matches.filter(m => m.journee === selectedJournee) : matches;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        const sortedCategories = [...categoriesData].sort((a, b) => {
          if (a.name === 'CORPORATES') return 1;
          if (b.name === 'CORPORATES') return -1;
          return 0;
        })
        setCategories(sortedCategories)

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

  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem('calendarCategory', activeCategory)
    }
  }, [activeCategory])

  const currentCategory = categories.find(cat => cat.name === activeCategory)
  const hasPoules = currentCategory?.hasPoules || false
  const poules = currentCategory?.poules || []

  useEffect(() => {
    if (activeCategory) fetchMatches()
  }, [activeCategory, selectedPoule])

  useEffect(() => {
    setSelectedPoule('A')
  }, [activeCategory])

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

  const getTeamName = (team: Match['homeTeam']) => {
    if (!team) return 'Unknown Team';
    if (typeof team === 'string') return team;
    return team.name;
  }

  const getTeamLogo = (team: Match['homeTeam']) => {
    if (!team || typeof team === 'string') return null;
    return team.logo;
  }

  return (
    <section id="calendar" className="py-12 sm:py-20 min-h-screen bg-[var(--color-background)]">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
            Calendrier des <span className="text-[var(--color-primary)]">Matchs</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Suivez tous les matchs et résultats de la saison en cours
          </p>
        </motion.div>

        {/* Category Selector */}
        <div className="mb-8">
          <div className="md:hidden relative z-30">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center justify-between w-full px-6 py-3 glass rounded-xl text-white border border-white/10"
            >
              <span className="font-medium">{activeCategory}</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full mt-2 glass rounded-xl overflow-hidden shadow-xl border border-white/10"
                >
                  {categories.map(category => (
                    <button
                      key={category.name}
                      onClick={() => {
                        setActiveCategory(category.name)
                        setIsCategoryOpen(false)
                      }}
                      className={`w-full px-6 py-3 text-left transition-colors ${activeCategory === category.name
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-gray-300 hover:bg-white/10'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(category => (
              <motion.button
                key={category.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(category.name)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeCategory === category.name
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/10'
                  }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Poule Selection */}
        <AnimatePresence>
          {hasPoules && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center mb-12"
            >
              <div className="inline-flex bg-black/20 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                {poules.map(poule => (
                  <button
                    key={poule}
                    onClick={() => setSelectedPoule(poule)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${selectedPoule === poule
                        ? 'bg-white/10 text-white shadow-sm border border-white/10'
                        : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    Poule {poule}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journee Selector */}
        {journees.length > 0 && selectedJournee !== null && (
          <div className="flex justify-center items-center gap-6 mb-12">
            <button
              onClick={() => {
                const idx = journees.indexOf(selectedJournee);
                if (idx > 0) setSelectedJournee(journees[idx - 1]);
              }}
              disabled={journees.length <= 1 || journees.indexOf(selectedJournee) === 0}
              className="p-3 rounded-full glass text-white hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDownIcon className="w-6 h-6 rotate-90" />
            </button>

            <div className="text-center">
              <span className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Journée</span>
              <span className="text-3xl font-display font-bold text-[var(--color-primary)]">
                {selectedJournee}<span className="text-lg align-top">{selectedJournee === 1 ? 'ère' : 'ème'}</span>
              </span>
            </div>

            <button
              onClick={() => {
                const idx = journees.indexOf(selectedJournee);
                if (idx < journees.length - 1) setSelectedJournee(journees[idx + 1]);
              }}
              disabled={journees.length <= 1 || journees.indexOf(selectedJournee) === journees.length - 1}
              className="p-3 rounded-full glass text-white hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDownIcon className="w-6 h-6 -rotate-90" />
            </button>
          </div>
        )}

        {/* Matches List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              {error}
            </div>
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="space-y-12 max-w-5xl mx-auto">
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
                <motion.div
                  key={journee}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                >
                  <div className="bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent px-6 py-4 border-b border-white/10 flex items-center">
                    <CalendarIcon className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                    <span className="text-lg font-bold text-white">
                      {journee}{journee === '1' ? 'ère' : 'ème'} Journée
                    </span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {journeeMatches
                      .sort((a, b) => a._id.localeCompare(b._id))
                      .map((match) => (
                        <div key={match._id} className="p-6 hover:bg-white/5 transition-colors group">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                            {/* Home Team */}
                            <div className="flex-1 flex items-center justify-end w-full md:w-auto">
                              <span className="text-lg md:text-xl font-bold text-white text-right mr-4 group-hover:text-[var(--color-primary)] transition-colors">
                                {getTeamName(match.homeTeam)}
                              </span>
                              {getTeamLogo(match.homeTeam) ? (
                                <div className="h-12 w-12 relative flex-shrink-0 bg-white/5 rounded-full p-1 border border-white/10">
                                  <img src={`/teams/${getTeamLogo(match.homeTeam)}`} alt={getTeamName(match.homeTeam)} className="object-contain w-full h-full" />
                                </div>
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                                  LBC
                                </div>
                              )}
                            </div>

                            {/* Score / VS */}
                            <div className="flex flex-col items-center justify-center min-w-[120px]">
                              {match.status === 'completed' ? (
                                <div className="flex items-center justify-center bg-black/40 rounded-xl px-6 py-3 border border-white/10 shadow-inner">
                                  <span className="text-2xl md:text-3xl font-display font-bold text-[var(--color-primary)]">
                                    {match.homeScore}
                                  </span>
                                  <span className="mx-3 text-gray-500 text-xl">-</span>
                                  <span className="text-2xl md:text-3xl font-display font-bold text-[var(--color-primary)]">
                                    {match.awayScore}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-2xl font-display font-bold text-gray-600 mb-1">VS</span>
                                  <div className="flex items-center text-xs font-medium text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    {match.time}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 flex items-center justify-start w-full md:w-auto">
                              {getTeamLogo(match.awayTeam) ? (
                                <div className="h-12 w-12 relative flex-shrink-0 bg-white/5 rounded-full p-1 border border-white/10">
                                  <img src={`/teams/${getTeamLogo(match.awayTeam)}`} alt={getTeamName(match.awayTeam)} className="object-contain w-full h-full" />
                                </div>
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                                  LBC
                                </div>
                              )}
                              <span className="text-lg md:text-xl font-bold text-white text-left ml-4 group-hover:text-[var(--color-primary)] transition-colors">
                                {getTeamName(match.awayTeam)}
                              </span>
                            </div>
                          </div>

                          {/* Venue & Date */}
                          <div className="mt-4 pt-4 border-t border-white/5 flex justify-center text-sm text-gray-500">
                            <span className="flex items-center mr-6">
                              <CalendarIcon className="w-4 h-4 mr-2 text-gray-600" />
                              {new Date(match.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                            <span className="flex items-center">
                              <MapPinIcon className="w-4 h-4 mr-2 text-gray-600" />
                              {match.venue}
                            </span>
                          </div>
                        </div>
                      ))}

                    {/* Exempt Team */}
                    {journeeMatches[0] && journeeMatches[0].exemptTeam && (
                      <div className="px-6 py-3 bg-white/5 text-center text-sm font-medium text-gray-400">
                        <span className="text-[var(--color-primary)] font-bold">EXEMPT :</span> {journeeMatches[0].exemptTeam}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
              <CalendarIcon className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun match programmé</h3>
            <p className="text-gray-400">
              {hasPoules
                ? `Aucun match trouvé pour ${activeCategory} - Poule ${selectedPoule}`
                : `Aucun match trouvé pour ${activeCategory}`
              }
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CalendarSection;
