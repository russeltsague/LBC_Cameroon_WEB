// components/ClassificationSection.tsx
'use client'
import { motion } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import { TrophyIcon, ChevronUpDownIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { FaTrophy } from 'react-icons/fa'
import axios from 'axios'
import { getCategories, Category } from '@/app/lib/api'

interface TeamStanding {
  _id: string;
  team: {
    _id: string;
    name: string;
    logo?: string;
  };
  position: number;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifference: number;
  points: number;
  recentResults: string[];
  category: string;
}

interface ClassificationProps {
  category?: string;
}

export default function Classification({ category: initialCategory }: ClassificationProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedPoule, setSelectedPoule] = useState<string>('A')
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        if (initialCategory) {
          setSelectedCategory(initialCategory)
        } else if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].name)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      }
    }

    fetchCategories()
  }, [initialCategory])

  // Restore last selected category from localStorage if available and valid
  useEffect(() => {
    const savedCategory = typeof window !== 'undefined' ? localStorage.getItem('classificationCategory') : null;
    const validSaved = categories.find(cat => cat.name === savedCategory);
    if (savedCategory && validSaved) {
      setSelectedCategory(savedCategory)
    } else if (categories.length > 0) {
      setSelectedCategory(categories[0].name)
    }
  }, [categories])

  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('classificationCategory', selectedCategory)
      // fetch data here if needed
    }
  }, [selectedCategory])

  // Get current category data
  const currentCategory = categories.find(cat => cat.name === selectedCategory)
  const hasPoules = currentCategory?.hasPoules || false
  const poules = currentCategory?.poules || []

  // Map new category names to old API names
  const getApiCategoryName = (categoryName: string): string => {
    const categoryMapping: { [key: string]: string } = {
      'DAMES': 'L1 DAME',
      'L1 MESSIEURS': 'L1 MESSIEUR',
      'L2A MESSIEURS': 'L2A MESSIEUR',
      'L2B MESSIEURS': 'L2B MESSIEUR'
    }
    return categoryMapping[categoryName] || categoryName
  }

  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedCategory) return
      
      try {
        setLoading(true)
        setError(null)
        
        const apiCategoryName = getApiCategoryName(selectedCategory)
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/classifications?category=${encodeURIComponent(apiCategoryName)}`
        
        // Add poule filter if the category has poules
        if (hasPoules) {
          url += `&poule=${selectedPoule}`
        }
        
        console.log('Fetching standings from:', url)
        
        const response = await axios.get(url)
        console.log('Standings response:', response.data)
        
        if (response.data.success && response.data.data) {
          setStandings(response.data.data)
        } else {
          setStandings([])
        }
      } catch (err) {
        console.error('Error fetching standings:', err)
        setError('Failed to load standings')
        setStandings([])
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [selectedCategory, selectedPoule, hasPoules])

  // Reset poule selection when category changes
  useEffect(() => {
    setSelectedPoule('A')
  }, [selectedCategory])

  const sortedStandings = useMemo(() => {
    return standings
      .sort((a, b) => {
        // Sort by points (descending)
        if (b.points !== a.points) return b.points - a.points
        // Then by points difference (descending)
        if (b.pointsDifference !== a.pointsDifference) return b.pointsDifference - a.pointsDifference
        // Then by points for (descending)
        return b.pointsFor - a.pointsFor
      })
      .map((team, index) => ({
        ...team,
        position: index + 1
      }));
  }, [standings]);

  if (loading) {
    return (
      <section id="classification" className="py-24 bg-gray-950">
        <div className="container px-6 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Classement de la <span className="text-orange-400">Ligue</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Classement actuel des équipes par catégorie
            </p>
          </motion.div>

          {/* Category Selection: Dropdown for small/medium, buttons for large+ */}
          <div className="mb-12">
            <div className="flex justify-center lg:hidden">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden lg:flex flex-wrap justify-center gap-2 mt-4">
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap text-sm ${
                    selectedCategory === cat.name
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
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
              {selectedCategory}
              {hasPoules && (
                <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
              )}
            </h3>
          </div>

          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading standings...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="classification" className="py-24 bg-gray-950">
        <div className="container px-6 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Classement de la <span className="text-orange-400">Ligue</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Classement actuel des équipes par catégorie
            </p>
          </motion.div>

          {/* Category Selection: Dropdown for small/medium, buttons for large+ */}
          <div className="mb-12">
            <div className="flex justify-center lg:hidden">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden lg:flex flex-wrap justify-center gap-2 mt-4">
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap text-sm ${
                    selectedCategory === cat.name
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
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
              {selectedCategory}
              {hasPoules && (
                <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
              )}
            </h3>
          </div>

          <div className="text-center py-12 text-red-400">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="classification" className="py-24 bg-gray-950">
      <div className="container px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Classement de la <span className="text-orange-400">Ligue</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Classement actuel des équipes par catégorie
          </p>
        </motion.div>

        {/* Category Selection: Dropdown for small/medium, buttons for large+ */}
        <div className="mb-12">
          <div className="flex justify-center lg:hidden">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="hidden lg:flex flex-wrap justify-center gap-2 mt-4">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap text-sm ${
                  selectedCategory === cat.name
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat.name}
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
            {selectedCategory}
            {hasPoules && (
              <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
            )}
          </h3>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto rounded-lg border border-gray-800 shadow-xl"
        >
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    #
                    <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    Équipe
                    <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    MJ
                    <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    V
                    <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    D
                    <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Points
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    PTS
                    <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    Diff
                    <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    PTS+
                    <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-gray-900/50 divide-y divide-gray-800">
              {sortedStandings.length > 0 ? (
                sortedStandings.map((team, index) => (
                  <motion.tr
                    key={`${team.team.name}-${team.team._id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-gray-800/50 transition-colors ${
                      team.position <= 4 ? 'bg-green-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {team.position === 1 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <FaTrophy className="text-yellow-500 w-5 h-5" />
                          </motion.div>
                        )}
                        <span className={`font-medium ${
                          team.position === 1 ? 'text-yellow-400' :
                          team.position <= 4 ? 'text-green-400' : 'text-white'
                        }`}>
                          {team.position}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-white">{team.team.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {team.played}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {team.wins}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {team.losses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {/* Empty cell - values hidden */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {team.pointsFor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {team.pointsAgainst}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-medium ${
                      team.pointsDifference > 0 ? 'text-green-400' : 
                      team.pointsDifference < 0 ? 'text-red-400' : 'text-gray-300'
                    }`}>
                      {team.pointsDifference > 0 ? '+' : ''}{team.pointsDifference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {team.points}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">
                    {hasPoules 
                      ? `Aucune équipe trouvée pour ${selectedCategory} - Poule ${selectedPoule}`
                      : `Aucune équipe trouvée pour ${selectedCategory}`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  )
}
