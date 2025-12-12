'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiAward, FiUsers, FiActivity, FiPercent } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { getCategories, Category, getCalendars, getCalendar } from '@/app/lib/api'

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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

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

  // Restore last selected category
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
    }
  }, [activeCategory])

  const currentCategory = categories.find(cat => cat.name === activeCategory)
  const hasPoules = currentCategory?.hasPoules || false
  const poules = currentCategory?.poules || []

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeCategory) return

      try {
        setLoading(true)
        setError(null)

        // Get calendar data for the selected category
        const calendar = await getCalendar(activeCategory)
        
        if (!calendar) {
          // If no calendar exists, set default stats
          setStats({
            totalTeams: 0,
            matchesPlayed: 0,
            matchesToPlay: 0,
            completionPercentage: 0
          })
          setLoading(false)
          return
        }

        // Debug: Log calendar structure
        console.log('Calendar data for', activeCategory, ':', calendar)
        console.log('Has poules:', calendar.hasPoules)
        console.log('Selected poule:', selectedPoule)
        console.log('Poules:', calendar.poules)

        // Calculate matches from calendar data
        let totalMatches = 0
        let completedMatches = 0
        const teamsInMatches = new Set<string>()

        // Process poules (group stages)
        if (calendar.poules && calendar.poules.length > 0) {
          for (const poule of calendar.poules) {
            console.log('Processing poule:', poule.name)
            
            // Skip if we're filtering by poule and this isn't the selected one
            if (hasPoules && poule.name !== selectedPoule) {
              console.log('Skipping poule', poule.name, 'not selected')
              continue
            }

            if (poule.journées && poule.journées.length > 0) {
              for (const journee of poule.journées) {
                if (journee.matches && journee.matches.length > 0) {
                  for (const match of journee.matches) {
                    totalMatches++
                    
                    console.log('Match:', match.homeTeam, 'vs', match.awayTeam, 'scores:', match.homeScore, '-', match.awayScore)
                    
                    // Add teams to the set
                    if (match.homeTeam) {
                      teamsInMatches.add(match.homeTeam)
                    }
                    if (match.awayTeam) {
                      teamsInMatches.add(match.awayTeam)
                    }

                    // Check if match is completed (has both scores)
                    if (match.homeScore !== undefined && match.homeScore !== null && 
                        match.awayScore !== undefined && match.awayScore !== null) {
                      completedMatches++
                      console.log('Match completed:', completedMatches)
                    }
                  }
                }
              }
            }
          }
        }

        // Process playoffs (if any)
        if (!hasPoules && calendar.playoffs && calendar.playoffs.length > 0) {
          for (const playoff of calendar.playoffs) {
            if (playoff.matches && playoff.matches.length > 0) {
              for (const match of playoff.matches) {
                totalMatches++
                
                // Add teams to the set
                if (match.homeTeam) {
                  teamsInMatches.add(match.homeTeam)
                }
                if (match.awayTeam) {
                  teamsInMatches.add(match.awayTeam)
                }

                // Check if match is completed (has both scores)
                if (match.homeScore !== undefined && match.homeScore !== null && 
                    match.awayScore !== undefined && match.awayScore !== null) {
                  completedMatches++
                }
              }
            }
          }
        }

        console.log('Final stats:', {
          totalMatches,
          completedMatches,
          teamsInMatches: teamsInMatches.size
        })

        const matchesToPlay = totalMatches - completedMatches
        const completionPercentage = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0

        setStats({
          totalTeams: teamsInMatches.size,
          matchesPlayed: completedMatches,
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

  useEffect(() => {
    setSelectedPoule('A')
  }, [activeCategory])

  const statItems = [
    {
      id: 1,
      name: 'Équipes actives',
      value: stats.totalTeams.toString(),
      icon: FiUsers,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      id: 2,
      name: 'Matchs joués',
      value: stats.matchesPlayed.toString(),
      icon: FiActivity,
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      id: 3,
      name: 'Matchs à jouer',
      value: stats.matchesToPlay.toString(),
      icon: FiAward,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10'
    },
    {
      id: 4,
      name: 'Achèvement',
      value: `${stats.completionPercentage}%`,
      icon: FiPercent,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    }
  ]

  return (
    <section className="py-12 sm:py-20 min-h-screen bg-[var(--color-background)]">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
            Statistiques de la <span className="text-[var(--color-primary)]">Ligue</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Aperçu global de la saison en cours
          </p>
        </motion.div>

        {/* Category Selection */}
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
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setActiveCategory(cat.name)
                        setIsCategoryOpen(false)
                      }}
                      className={`w-full px-6 py-3 text-left transition-colors ${activeCategory === cat.name
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-gray-300 hover:bg-white/10'
                        }`}
                    >
                      {cat.name}
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

        {/* Current Selection Display */}
        <div className="text-center mb-12">
          <h3 className="text-xl font-bold text-white">
            {activeCategory}
            {hasPoules && (
              <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
            )}
          </h3>
        </div>

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {statItems.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${stat.bg.replace('/10', '')} -mr-10 -mt-10 transition-all group-hover:opacity-20`} />

                <div className="relative z-10 flex flex-col items-center">
                  <div className={`p-4 rounded-full ${stat.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-display font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    {stat.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}