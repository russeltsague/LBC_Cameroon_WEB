'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiMapPin, FiSave, FiPlus, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi'
import { Match, Team, Category, getTeams, getCategories, createMatch, updateMatch, deleteMatch } from '@/app/lib/api';
import { useAppStore } from '@/lib/store';
import { toast } from 'react-hot-toast'

export const MatchResultsForm = () => {
  const triggerClassificationRefresh = useAppStore((state) => state.triggerClassificationRefresh);
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [formData, setFormData] = useState<Partial<Match>>({
    date: '',
    time: '',
    homeTeam: '',
    awayTeam: '',
    homeScore: 0,
    awayScore: 0,
    category: '',
    venue: '',
    status: 'upcoming',
    journee: 1,
    terrain: '',
    poule: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [teamsData, categoriesData] = await Promise.all([
        getTeams(),
        getCategories()
      ])
      setTeams(Array.isArray(teamsData) ? teamsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      // TODO: Fetch matches when API is ready
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (selectedMatch) {
        await updateMatch(selectedMatch._id, formData);
        triggerClassificationRefresh();
        toast.success('Match mis à jour')
      } else {
        await createMatch(formData as Match)
        toast.success('Match créé')
      }
      await fetchData()
      setShowForm(false)
      setSelectedMatch(null)
      resetForm()
    } catch (error) {
      console.error('Error saving match:', error)
      toast.error('Erreur lors de l\'enregistrement du match')
    }
  }

  const handleDelete = async (matchId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) return
    
    try {
      await deleteMatch(matchId)
      setMatches(matches.filter(m => m._id !== matchId))
      toast.success('Match supprimé')
    } catch (error) {
      console.error('Error deleting match:', error)
      toast.error('Erreur lors de la suppression du match')
    }
  }

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      homeTeam: '',
      awayTeam: '',
      homeScore: 0,
      awayScore: 0,
      category: '',
      venue: '',
      status: 'upcoming',
      journee: 1,
      terrain: '',
      poule: ''
    })
  }

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.homeTeam?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || match.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const activeTeams = teams.filter(team => team.isActive !== false)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
            Gestion des Matchs
          </h1>
          <p className="text-gray-400 font-outfit mt-1">
            {matches.length} matchs enregistrés
          </p>
        </div>

        <button
          onClick={() => {
            resetForm()
            setSelectedMatch(null)
            setShowForm(true)
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center space-x-2 font-outfit"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nouveau Match</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un match..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
          />
        </div>

        <div className="relative min-w-[200px]">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit appearance-none"
          >
            <option value="all" className="bg-gray-900">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name} className="bg-gray-900">{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[200px]">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit appearance-none"
          >
            <option value="all" className="bg-gray-900">Tous les statuts</option>
            <option value="upcoming" className="bg-gray-900">À venir</option>
            <option value="live" className="bg-gray-900">En direct</option>
            <option value="completed" className="bg-gray-900">Terminés</option>
          </select>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/10 animate-pulse h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(match => (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 border border-white/10 hover:border-orange-500/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-outfit font-medium ${
                      match.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      match.status === 'live' ? 'bg-red-500/10 text-red-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {match.status === 'completed' ? 'Terminé' :
                       match.status === 'live' ? 'En direct' : 'À venir'}
                    </span>
                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-outfit">
                      {match.category}
                    </span>
                  </div>
                  
                  <div className="text-white font-outfit mb-2">
                    {typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam.name} vs {typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam.name}
                  </div>
                  
                  {match.status === 'completed' && (
                    <div className="text-2xl font-bold text-white font-oswald">
                      {match.homeScore} - {match.awayScore}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedMatch(match)
                      setFormData(match)
                      setShowForm(true)
                    }}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    <FiSave className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(match._id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-400 font-outfit">
                <div className="flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2 text-orange-500" />
                  <span>{match.date}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="w-4 h-4 mr-2 text-blue-500" />
                  <span>{match.time}</span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="w-4 h-4 mr-2 text-purple-500" />
                  <span>{match.venue}</span>
                </div>
                {match.journee && (
                  <div className="flex items-center">
                    <span className="text-gray-500">Journée {match.journee}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Match Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-6 border border-white/10 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white font-oswald mb-6">
              {selectedMatch ? 'Modifier le Match' : 'Nouveau Match'}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Heure</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Équipe à domicile</label>
                  <select
                    value={formData.homeTeam?.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, homeTeam: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                  >
                    <option value="">Sélectionner une équipe</option>
                    {activeTeams.map(team => (
                      <option key={team._id} value={team._id} className="bg-gray-900">{team.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Équipe extérieure</label>
                  <select
                    value={formData.awayTeam?.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, awayTeam: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                  >
                    <option value="">Sélectionner une équipe</option>
                    {activeTeams.map(team => (
                      <option key={team._id} value={team._id} className="bg-gray-900">{team.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name} className="bg-gray-900">{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Lieu</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                    placeholder="Salle, terrain, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                  >
                    <option value="upcoming">À venir</option>
                    <option value="live">En direct</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Journée</label>
                  <input
                    type="number"
                    value={formData.journee}
                    onChange={(e) => setFormData(prev => ({ ...prev, journee: parseInt(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                    min="1"
                  />
                </div>

                {formData.status === 'completed' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Score domicile</label>
                      <input
                        type="number"
                        value={formData.homeScore}
                        onChange={(e) => setFormData(prev => ({ ...prev, homeScore: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                        min="0"
                        max="200"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">Score extérieur</label>
                      <input
                        type="number"
                        value={formData.awayScore}
                        onChange={(e) => setFormData(prev => ({ ...prev, awayScore: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                        min="0"
                        max="200"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-outfit font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                >
                  {selectedMatch ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-outfit font-medium hover:bg-white/10 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
