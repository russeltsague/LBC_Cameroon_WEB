'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { TeamCard } from '../ui/TeamCard'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Team, getTeams, getCategories, Category } from '@/app/lib/api'

export const FeaturedSection = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedPoule, setSelectedPoule] = useState<string>('A')
  const [teams, setTeams] = useState<Team[]>([])
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleTeamsCount, setVisibleTeamsCount] = useState(6)
  const visibleTeams = teams.slice(0, visibleTeamsCount)
  const canShowMore = visibleTeamsCount < teams.length

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
    const savedCategory = typeof window !== 'undefined' ? localStorage.getItem('featuredCategory') : null;
    const validSaved = categories.find(cat => cat.name === savedCategory);
    if (savedCategory && validSaved) {
      setActiveCategory(savedCategory)
    } else if (categories.length > 0) {
      setActiveCategory(categories[0].name)
    }
  }, [categories])

  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem('featuredCategory', activeCategory)
      // fetch data here if needed
    }
  }, [activeCategory])

  // Get current category data
  const currentCategory = categories.find(cat => cat.name === activeCategory)
  const hasPoules = currentCategory?.hasPoules || false
  const poules = currentCategory?.poules || []

  useEffect(() => {
    const fetchTeamsByCategory = async () => {
      if (!activeCategory) return
      
      setLoading(true)
      setError(null)
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/teams?category=${encodeURIComponent(activeCategory)}`
        
        // Add poule filter if the category has poules
        if (hasPoules) {
          url += `&poule=${selectedPoule}`
        }
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch teams')
        }
        const data = await response.json()
        setTeams(data.data || [])
      } catch (error) {
        console.error('Error fetching teams:', error)
        setError('Failed to load teams. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchTeamsByCategory()
  }, [activeCategory, selectedPoule, hasPoules])

  // Reset poule selection when category changes
  useEffect(() => {
    setSelectedPoule('A')
  }, [activeCategory])

  return (
    <section className="py-4 sm:py-10 md:py-20 bg-gray-900 relative overflow-hidden">
      <div className="container px-2 sm:px-4 md:px-8 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">
            Équipes <span className="text-orange-400">Phares</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-300 max-w-xl md:max-w-2xl mx-auto">
            Découvrez les équipes par catégorie de compétition
          </p>
        </motion.div>

        {/* Category Selector: Dropdown for small/medium, buttons for large+ */}
        <div className="mb-6 sm:mb-8">
          <div className="md:hidden flex justify-center">
            <div className="relative w-full max-w-xs">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-full px-6 py-3 bg-gray-800 rounded-lg text-white"
              >
                <span className="truncate">{activeCategory}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
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
                      className={`w-full px-6 py-3 text-left truncate ${activeCategory === category.name ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
          <div className="hidden md:flex flex-wrap justify-center gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                  activeCategory === category.name 
                    ? 'bg-orange-500 text-white' 
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
          <div className="flex justify-center mb-6 md:mb-8">
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
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-lg sm:text-2xl font-bold text-white">
            {activeCategory}
            {hasPoules && (
              <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
            )}
          </h3>
        </div>

        {/* Team grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12 text-gray-400">Loading teams...</div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 text-red-400">{error}</div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8 mt-6">
          {visibleTeams.map((team) => (
            <TeamCard key={team._id} id={team._id} name={team.name} city={team.city} logo={team.logo} category={team.category} />
          ))}
        </div>
        )}

        {teams.length === 0 && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12 text-gray-400"
          >
            {hasPoules 
              ? `Aucune équipe trouvée dans ${activeCategory} - Poule ${selectedPoule}`
              : `Aucune équipe trouvée dans la catégorie ${activeCategory}`
            }
          </motion.div>
        )}

        {/* Show More / Hide Buttons */}
        <div className="text-center mt-10 md:mt-16 flex flex-col items-center gap-4">
          {canShowMore && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <button
                onClick={() => setVisibleTeamsCount(v => v + 6)}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
              >
                Voir Plus d'Équipes
              </button>
            </motion.div>
          )}
          {visibleTeamsCount > 6 && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <button
                onClick={() => setVisibleTeamsCount(6)}
                className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 text-base md:text-lg mt-2"
              >
                Masquer les Équipes
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
