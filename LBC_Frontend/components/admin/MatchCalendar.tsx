// components/admin/MatchCalendarAdmin.tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarIcon, ClockIcon, ChevronDownIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { getCategories, Category } from '@/app/lib/api'

type Team = {
  _id: string
  name: string
  category: string
}

type Match = {
  _id: string
  date: string
  time: string
  homeTeam: Team | string
  awayTeam: Team | string
  homeScore?: number
  awayScore?: number
  category: string
  venue: string
  status: 'completed' | 'upcoming' | 'live'
  forfeit?: 'home' | 'away' | null
  poule?: string
  journee?: number
}

const initialMatchState: Partial<Match> = {
  date: '',
  time: '',
  homeTeam: '',
  awayTeam: '',
  category: '',
  venue: '',
  status: 'upcoming',
}

export const MatchCalendarAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [selectedPoule, setSelectedPoule] = useState<string>('A')
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMatch, setCurrentMatch] = useState<Partial<Match>>(initialMatchState)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    fetchTeams()
    fetchMatches()
  }, [])

  // Add effect to refetch matches when category or poule changes
  useEffect(() => {
    fetchMatches()
  }, [activeCategory, selectedPoule])

  // Reset poule selection when category changes
  useEffect(() => {
    setSelectedPoule('A')
  }, [activeCategory])

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching matches for category:', activeCategory, 'poule:', selectedPoule)
      let url = `http://localhost:5000/api/matches?category=${encodeURIComponent(activeCategory)}`
      
      // Add poule filter if the category has poules
      if (hasPoules) {
        url += `&poule=${selectedPoule}`
      }
      
      const res = await fetch(url)
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        console.error('Matches API error:', {
          status: res.status,
          statusText: res.statusText,
          errorData
        })
        throw new Error(`Failed to fetch matches: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      console.log('Fetched matches data:', data)
      
      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid matches data format:', data)
        setMatches([])
        return
      }

      // Ensure teams are populated
      const matchesWithTeams = data.data.map((match: Match) => ({
        ...match,
        homeTeam: typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam,
        awayTeam: typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam
      }))

      console.log('Processed matches:', matchesWithTeams)
      setMatches(matchesWithTeams)
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Failed to load matches. Please try again later.')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      console.log('Fetching teams...')
      const res = await fetch('http://localhost:5000/api/teams')
      console.log('Teams response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        console.error('Teams API error:', {
          status: res.status,
          statusText: res.statusText,
          errorData
        })
        throw new Error(`Failed to fetch teams: ${res.status} ${res.statusText}`)
      }
      
      const data = await res.json()
      console.log('Teams data received:', data)
      
      // Handle both old and new API response formats
      const teamsData = data.data || data
      setTeams(Array.isArray(teamsData) ? teamsData : [])
    } catch (err) {
      console.error('Error fetching teams:', err)
      setError('Failed to load teams. Please try again later.')
      toast.error('Failed to load teams')
    }
  }

  const filteredTeams = (Array.isArray(teams) ? teams : []).filter(team => team.category === activeCategory)

  // Group matches by category
  const matchesByCategory = matches.reduce((acc, match) => {
    if (!acc[match.category]) {
      acc[match.category] = []
    }
    acc[match.category].push(match)
    return acc
  }, {} as Record<string, Match[]>)

  // Group matches by journee
  const matchesByJournee = matches.reduce((acc, match) => {
    const journee = match.journee || 1;
    if (!acc[journee]) acc[journee] = [];
    acc[journee].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  // List of available journees
  const journees = Object.keys(matchesByJournee).map(Number).sort((a, b) => a - b);
  const [selectedJournee, setSelectedJournee] = useState<number | null>(null);

  // Set selectedJournee to first available when matches change
  useEffect(() => {
    if (journees.length > 0) {
      setSelectedJournee(journees[0]);
    }
  }, [JSON.stringify(journees)]);

  const visibleJourneeMatches = selectedJournee !== null ? matchesByJournee[selectedJournee] || [] : [];

  const getTeamName = (team: Team | string) => {
    if (!team) return 'Unknown Team';
    if (typeof team === 'string') {
      const foundTeam = (Array.isArray(teams) ? teams : []).find(t => t._id === team)
      return foundTeam ? foundTeam.name : 'Unknown Team';
    }
    return team.name;
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    // Ensure time is in HH:mm format
    const [hours, minutes] = timeString.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!currentMatch.homeTeam || !currentMatch.awayTeam) {
        throw new Error('Please select both teams')
      }

      if (currentMatch.homeTeam === currentMatch.awayTeam) {
        throw new Error('Home and away teams cannot be the same')
      }

      if (!currentMatch.date) {
        throw new Error('Please select a date')
      }

      if (!currentMatch.time) {
        throw new Error('Please select a time')
      }

      if (!currentMatch.venue) {
        throw new Error('Please enter a venue')
      }

      if (!currentMatch.journee) {
        throw new Error('Please select a journee')
      }

      // If we're updating an existing match and only changing the status to completed
      if (currentMatch._id && currentMatch.status === 'completed') {
        const matchToSave = {
          status: 'completed',
          homeScore: currentMatch.homeScore || 0,
          awayScore: currentMatch.awayScore || 0,
          forfeit: currentMatch.forfeit || null
        }

        console.log('Updating match scores:', matchToSave)

        const res = await fetch(`http://localhost:5000/api/matches/${currentMatch._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(matchToSave),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || `Failed to update match: ${res.status}`)
        }

        await fetchMatches()
        setIsModalOpen(false)
        setCurrentMatch(initialMatchState)
        toast.success('Match scores updated successfully')
        return
      }

      // For new matches or other updates, use the full match data
      const matchToSave = {
        ...currentMatch,
        homeTeam: typeof currentMatch.homeTeam === 'string' ? currentMatch.homeTeam : currentMatch.homeTeam._id,
        awayTeam: typeof currentMatch.awayTeam === 'string' ? currentMatch.awayTeam : currentMatch.awayTeam._id,
        category: currentMatch.category || activeCategory,
        date: new Date(currentMatch.date).toISOString().split('T')[0],
        time: formatTime(currentMatch.time),
      }

      console.log('Saving match with data:', matchToSave)

      const url = currentMatch._id 
        ? `http://localhost:5000/api/matches/${currentMatch._id}` 
        : 'http://localhost:5000/api/matches'
      
      const method = currentMatch._id ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchToSave),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || `Failed to save match: ${res.status}`)
      }

      await fetchMatches()
      setIsModalOpen(false)
      setCurrentMatch(initialMatchState)
      toast.success('Match saved successfully')
    } catch (err) {
      console.error('Error saving match:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save match'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return

    try {
      const res = await fetch(`http://localhost:5000/api/matches/${id}`, { 
        method: 'DELETE' 
      })
      
      if (!res.ok) throw new Error('Failed to delete match')
      
      await fetchMatches()
      
      toast.success('Match deleted successfully')
    } catch (err) {
      console.error('Error deleting match:', err)
      setError('Failed to delete match')
      toast.error('Failed to delete match')
    }
  }

  const openEditModal = (match: Match) => {
    // Format the date for the HTML date input (YYYY-MM-DD)
    const formattedDate = match.date ? new Date(match.date).toISOString().split('T')[0] : ''
    
    setCurrentMatch({
      ...match,
      date: formattedDate
    })
    setIsModalOpen(true)
  }

  const openNewModal = () => {
    setCurrentMatch({
      ...initialMatchState,
      category: activeCategory,
      status: 'upcoming'
    })
    setIsModalOpen(true)
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
          Gestion du Calendrier des Matchs
        </h2>
        
        <button
          onClick={openNewModal}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Ajouter un Match
        </button>
      </div>

      {/* Category Selector */}
      <div className="mb-8">
        <div className="md:hidden mb-4 relative">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
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
                className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg overflow-hidden shadow-xl"
              >
                {categories.map(category => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setActiveCategory(category.name)
                      setIsCategoryOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left ${activeCategory === category.name ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex space-x-2">
          {categories.map(category => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`px-4 py-2 rounded-md transition-colors ${
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
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {poules.map(poule => (
              <button
                key={poule}
                onClick={() => setSelectedPoule(poule)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedPoule === poule
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Poule {poule}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-white">
          {activeCategory}
          {hasPoules && (
            <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
          )}
        </h3>
      </div>

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
            Précédent
          </button>
          <span className="text-lg font-bold text-orange-400 min-w-[120px] text-center">
            {selectedJournee}{selectedJournee === 1 ? 'ère' : 'ème'} Journée
          </span>
          <button
            onClick={() => {
              const idx = journees.indexOf(selectedJournee);
              if (idx < journees.length - 1) setSelectedJournee(journees[idx + 1]);
            }}
            disabled={journees.length <= 1 || journees.indexOf(selectedJournee) === journees.length - 1}
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 bg-gray-800 text-gray-300 border-gray-700 hover:bg-orange-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Matches List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading matches...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : (
        <div className="space-y-8">
          {selectedJournee !== null ? (
            <div key={selectedJournee} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="bg-gray-800/50 p-4 text-lg font-bold text-orange-400">
                {selectedJournee}{selectedJournee === 1 ? 'ère' : 'ème'} Journée
              </div>
              <div className="grid grid-cols-12 bg-gray-800/50 p-4 text-sm font-medium text-gray-400">
                <div className="col-span-3">Match</div>
                <div className="col-span-2">Date & Heure</div>
                <div className="col-span-2">Lieu</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-1">Statut</div>
                <div className="col-span-2">Actions</div>
              </div>
              {visibleJourneeMatches.length > 0 ? (
                visibleJourneeMatches.map((match, index) => (
                  <motion.div
                    key={match._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="grid grid-cols-12 p-4 items-center border-b border-gray-800 last:border-0 hover:bg-gray-800/20"
                  >
                    <div className="col-span-3 font-medium text-white">
                      {getTeamName(match.homeTeam)} vs {getTeamName(match.awayTeam)}
                    </div>
                    <div className="col-span-2 text-gray-400">
                      <div>{formatDate(match.date)}</div>
                      <div className="text-sm">{formatTime(match.time)}</div>
                    </div>
                    <div className="col-span-2 text-gray-400">
                      {match.venue}
                    </div>
                    <div className="col-span-2">
                      {match.status === 'completed' ? (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 text-center">
                          <span className="text-lg font-bold text-orange-400">
                            {match.homeScore} - {match.awayScore}
                          </span>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center text-sm">
                          -
                        </div>
                      )}
                    </div>
                    <div className="col-span-1">
                      {match.status === 'completed' ? (
                        <div className="bg-green-500/10 px-3 py-1 rounded-full text-sm text-green-400 flex items-center justify-center">
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Terminé
                        </div>
                      ) : match.status === 'live' ? (
                        <div className="bg-red-500/10 px-3 py-1 rounded-full text-sm text-red-400 flex items-center justify-center">
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          LIVE
                        </div>
                      ) : (
                        <div className="bg-gray-700/50 px-3 py-1 rounded-full text-sm text-gray-300 flex items-center justify-center">
                          À venir
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 flex space-x-2">
                      <button
                        onClick={() => openEditModal(match)}
                        className="text-gray-400 hover:text-orange-400 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        title="Modifier le match"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match._id)}
                        className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        title="Supprimer le match"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Aucun match programmé pour cette journée
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Match Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {currentMatch._id ? 'Modifier le Match' : 'Ajouter un Match'}
            </h3>
            
            <form onSubmit={handleSaveMatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                  <select
                    value={currentMatch.category || activeCategory}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, category: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Statut</label>
                  <select
                    value={currentMatch.status || 'upcoming'}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, status: e.target.value as Match['status'] })}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  >
                    <option value="upcoming">À venir</option>
                    <option value="live">En direct</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
              </div>

              {/* Poule field for categories that have poules */}
              {(() => {
                const selectedCategory = categories.find(cat => cat.name === currentMatch.category)
                const hasPoules = selectedCategory?.hasPoules || false
                const poules = selectedCategory?.poules || []
                
                return hasPoules && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Poule</label>
                    <select
                      value={currentMatch.poule || ''}
                      onChange={(e) => setCurrentMatch({ ...currentMatch, poule: e.target.value })}
                      className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      required
                    >
                      <option value="">Sélectionner la poule</option>
                      {poules.map(poule => (
                        <option key={poule} value={poule}>Poule {poule}</option>
                      ))}
                    </select>
                  </div>
                )
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Journée</label>
                  <input
                    type="number"
                    min="1"
                    value={currentMatch.journee || ''}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, journee: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={currentMatch.date || ''}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, date: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Heure</label>
                  <input
                    type="time"
                    value={currentMatch.time || ''}
                    onChange={(e) => setCurrentMatch({ ...currentMatch, time: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Équipe à domicile</label>
                <select
                  value={currentMatch.homeTeam ? (typeof currentMatch.homeTeam === 'string' ? currentMatch.homeTeam : currentMatch.homeTeam._id) : ''}
                  onChange={(e) => setCurrentMatch({ ...currentMatch, homeTeam: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                >
                  <option value="">Sélectionner l'équipe</option>
                  {filteredTeams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Équipe à l'extérieur</label>
                <select
                  value={currentMatch.awayTeam ? (typeof currentMatch.awayTeam === 'string' ? currentMatch.awayTeam : currentMatch.awayTeam._id) : ''}
                  onChange={(e) => setCurrentMatch({ ...currentMatch, awayTeam: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                >
                  <option value="">Sélectionner l'équipe</option>
                  {filteredTeams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Lieu</label>
                <input
                  type="text"
                  placeholder="Salle de sport, adresse..."
                  value={currentMatch.venue || ''}
                  onChange={(e) => setCurrentMatch({ ...currentMatch, venue: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
              
              {currentMatch.status === 'completed' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Home Score
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentMatch.homeScore || ''}
                        onChange={(e) => setCurrentMatch({
                          ...currentMatch,
                          homeScore: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={currentMatch.forfeit === 'home'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Away Score
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentMatch.awayScore || ''}
                        onChange={(e) => setCurrentMatch({
                          ...currentMatch,
                          awayScore: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border rounded-md"
                        disabled={currentMatch.forfeit === 'away'}
                      />
                    </div>
                  </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forfeit
                    </label>
                  <select
                      value={currentMatch.forfeit || ''}
                      onChange={(e) => {
                        const forfeit = e.target.value as 'home' | 'away' | null;
                        setCurrentMatch({
                          ...currentMatch,
                          forfeit,
                          homeScore: forfeit === 'home' ? 0 : currentMatch.homeScore,
                          awayScore: forfeit === 'away' ? 0 : currentMatch.awayScore
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">No Forfeit</option>
                      <option value="home">Home Team Forfeit</option>
                      <option value="away">Away Team Forfeit</option>
                  </select>
                </div>
                </>
              )}

              {error && (
                <div className="text-red-400 text-sm mt-2">{error}</div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setCurrentMatch(initialMatchState)
                    setError(null)
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

