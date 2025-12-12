'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiTrash2, 
  FiToggleLeft, 
  FiToggleRight, 
  FiGrid, 
  FiList,
  FiChevronDown
} from 'react-icons/fi'
import { 
  Team, 
  Category, 
  getTeams, 
  createTeam, 
  updateTeam, 
  deleteTeam, 
  getCategories, 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  toggleCategoryStatus 
} from '@/app/lib/api'
import { TeamCard } from './TeamCard'
import { TeamForm } from './TeamForm'
import { toast } from 'react-hot-toast'

type ViewMode = 'categories' | 'teams'

export const TeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')
  const [selectedPouleFilter, setSelectedPouleFilter] = useState('all')
  const [activeCategoryTab, setActiveCategoryTab] = useState('Toutes les catégories')
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [teamsData, categoriesData] = await Promise.all([
        getTeams(),
        getAllCategories()
      ])
      setTeams(Array.isArray(teamsData) ? teamsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTeam = async (data: any) => {
    try {
      if (selectedTeam) {
        await updateTeam(selectedTeam._id, data)
        toast.success('Équipe mise à jour')
      } else {
        await createTeam(data)
        toast.success('Équipe créée')
      }
      await fetchData()
      setShowTeamForm(false)
      setSelectedTeam(null)
    } catch (error: any) {
      console.error('Error saving team:', error)
      
      // Check for duplicate key error
      if (error.message && error.message.includes('E11000 duplicate key error')) {
        const errorMessage = error.message;
        // Extract the duplicate key values from the error message
        const match = errorMessage.match(/\{ name: "([^"]+)", category: "([^"]+)", poule: "([^"]+)" \}/);
        if (match) {
          const [, name, category, poule] = match;
          toast.error(`Une équipe "${name}" existe déjà dans la catégorie "${category}" et la poule "${poule}"`);
        } else {
          toast.error('Une équipe avec ces informations existe déjà');
        }
      } else {
        toast.error('Erreur lors de la sauvegarde de l\'équipe')
      }
      // Don't close the form on duplicate error so user can correct the data
      if (!error.message || !error.message.includes('E11000 duplicate key error')) {
        setShowTeamForm(false)
        setSelectedTeam(null)
      }
    }
  }

  const handleToggleTeamStatus = async (teamId: string) => {
    try {
      const team = teams.find(t => t._id === teamId)
      if (team) {
        await updateTeam(team._id, { ...team, isActive: !team.isActive })
        await fetchData()
        toast.success(team.isActive ? 'Équipe désactivée' : 'Équipe activée')
      }
    } catch (error) {
      console.error('Error toggling team status:', error)
      toast.error('Erreur lors du changement de statut')
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return
    
    try {
      await deleteTeam(teamId)
      setTeams(teams.filter(t => t._id !== teamId))
      toast.success('Équipe supprimée')
    } catch (error) {
      console.error('Error deleting team:', error)
      toast.error('Erreur lors de la suppression de l\'équipe')
    }
  }

  const handleSaveCategory = async (data: any) => {
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory._id, data)
        toast.success('Catégorie mise à jour')
      } else {
        await createCategory(data)
        toast.success('Catégorie créée')
      }
      await fetchData()
      setShowCategoryForm(false)
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Erreur lors de l\'enregistrement de la catégorie')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return
    
    try {
      await deleteCategory(categoryId)
      setCategories(categories.filter(c => c._id !== categoryId))
      toast.success('Catégorie supprimée')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Erreur lors de la suppression de la catégorie')
    }
  }

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      const updated = await toggleCategoryStatus(categoryId)
      setCategories(categories.map(c => c._id === categoryId ? updated : c))
      toast.success(updated.isActive ? 'Catégorie activée' : 'Catégorie désactivée')
    } catch (error) {
      console.error('Error toggling category status:', error)
      toast.error('Erreur lors du changement de statut')
    }
  }

  const filteredTeams = teams.filter(team => {
    if (!team) return false;
    
    // Check search term match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      team.name.toLowerCase().includes(searchLower) ||
      (team.city && team.city.toLowerCase().includes(searchLower)) ||
      (team.coach && team.coach.toLowerCase().includes(searchLower));
      
    // Check category match
    const matchesCategory = 
      activeCategoryTab === 'Toutes les catégories' || 
      (team.category && team.category.trim() === activeCategoryTab.trim());
      
    // Check status match
    const matchesStatus = 
      selectedStatusFilter === 'all' || 
      (selectedStatusFilter === 'active' && team.isActive !== false) ||
      (selectedStatusFilter === 'inactive' && team.isActive === false);
      
    // Check poule match
    const matchesPoule = 
      selectedPouleFilter === 'all' || 
      !team.poule || 
      team.poule.toString().toUpperCase() === selectedPouleFilter.toUpperCase();
      
    return matchesSearch && matchesCategory && matchesStatus && matchesPoule;
  })

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header with View Toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
            Gestion des Compétitions
          </h1>
          <p className="text-gray-400 font-outfit mt-1">
            {viewMode === 'categories' 
              ? `${categories.length} catégories enregistrées`
              : `${teams.length} équipes enregistrées`
            }
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setViewMode('categories')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'categories'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiGrid className="w-4 h-4" />
              <span className="font-outfit text-sm">Catégories</span>
            </button>
            <button
              onClick={() => setViewMode('teams')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'teams'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiList className="w-4 h-4" />
              <span className="font-outfit text-sm">Équipes</span>
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              if (viewMode === 'categories') {
                setSelectedCategory(null)
                setShowCategoryForm(true)
              } else {
                setSelectedTeam(null)
                setShowTeamForm(true)
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
          >
            <FiPlus className="w-4 h-4" />
            <span>Ajouter {viewMode === 'categories' ? 'une catégorie' : 'une équipe'}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Rechercher une ${viewMode === 'categories' ? 'catégorie' : 'équipe'}...`}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-outfit focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories View */}
      {viewMode === 'categories' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-lg p-4 border border-white/10 animate-pulse h-36" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCategories.map(category => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 border border-white/10 hover:border-orange-500/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white font-outfit mb-2">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-400 text-sm font-outfit line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleCategoryStatus(category._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          category.isActive
                            ? 'text-green-500 hover:bg-green-500/10'
                            : 'text-gray-500 hover:bg-gray-500/10'
                        }`}
                      >
                        {category.isActive ? (
                          <FiToggleRight className="w-5 h-5" />
                        ) : (
                          <FiToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory(category)
                          setShowCategoryForm(true)
                        }}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-outfit">Statut:</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-outfit font-medium ${
                        category.isActive
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {category.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-outfit">Poules:</span>
                      <span className="text-white font-outfit">
                        {category.hasPoules ? `${category.poules.length} poules` : 'Aucune'}
                      </span>
                    </div>

                    {category.hasPoules && category.poules.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {category.poules.map((poule, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-outfit"
                          >
                            Poule {poule}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teams View */}
      {viewMode === 'teams' && (
        <div className="space-y-6">
          {/* Search and Category Tabs - Desktop */}
          <div className="hidden md:block">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-6xl">
                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCategoryTab('Toutes les catégories')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activeCategoryTab === 'Toutes les catégories'
                        ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    Toutes les catégories
                  </motion.button>
                  
                  {categories.map(category => (
                    <motion.button
                      key={category._id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveCategoryTab(category.name)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                        activeCategoryTab === category.name
                          ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>

                {/* Poule Selection - Animated */}
                <AnimatePresence mode="wait">
                  {activeCategoryTab !== 'Toutes les catégories' && categories.find(c => c.name === activeCategoryTab)?.hasPoules && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-center mb-8"
                    >
                      <div className="inline-flex bg-black/20 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                        <button
                          onClick={() => setSelectedPouleFilter('all')}
                          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                            selectedPouleFilter === 'all'
                              ? 'bg-white/10 text-white shadow-sm border border-white/10'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          Toutes
                        </button>
                        {categories
                          .find(c => c.name === activeCategoryTab)?.poules
                          .map(poule => (
                            <button
                              key={poule}
                              onClick={() => setSelectedPouleFilter(poule)}
                              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                                selectedPouleFilter === poule
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
              </div>
            </div>
          </div>

          {/* Mobile Category and Poule Selector */}
          <div className="md:hidden space-y-4 mb-6">
            <div className="relative">
              <select
                value={activeCategoryTab}
                onChange={(e) => setActiveCategoryTab(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent appearance-none"
              >
                <option value="Toutes les catégories">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <FiChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {activeCategoryTab !== 'Toutes les catégories' && categories.find(c => c.name === activeCategoryTab)?.hasPoules && (
              <div className="relative">
                <select
                  value={selectedPouleFilter}
                  onChange={(e) => setSelectedPouleFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent appearance-none"
                >
                  <option value="all">Toutes les poules</option>
                  {categories
                    .find(c => c.name === activeCategoryTab)?.poules
                    .map(poule => (
                      <option key={poule} value={poule}>
                        Poule {poule}
                      </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FiChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative max-w-xs">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-transparent appearance-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <FiChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Teams Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass rounded-lg p-4 border border-white/10 animate-pulse h-40" />
              ))}
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredTeams.map(team => (
                <TeamCard
                  key={team._id}
                  team={team}
                  onEdit={() => {
                    setSelectedTeam(team)
                    setShowTeamForm(true)
                  }}
                  onDelete={() => handleDeleteTeam(team._id)}
                  onToggleStatus={() => handleToggleTeamStatus(team._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 font-outfit">
                Aucune équipe trouvée. Essayez de modifier vos filtres de recherche.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      <AnimatePresence>
        {showCategoryForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCategoryForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white font-oswald mb-6">
                {selectedCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  isActive: formData.get('isActive') === 'on',
                  hasPoules: formData.get('hasPoules') === 'on',
                  poules: (formData.get('poules') as string || '').split(',').map(p => p.trim()).filter(Boolean)
                }
                handleSaveCategory(data)
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedCategory?.name || ''}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-outfit focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedCategory?.description || ''}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-outfit focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={selectedCategory ? selectedCategory.isActive : true}
                      className="form-checkbox h-5 w-5 text-orange-500 rounded bg-white/5 border-white/10 focus:ring-orange-500 focus:ring-offset-0"
                    />
                    <span className="text-sm font-outfit text-gray-300">Catégorie active</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasPoules"
                      defaultChecked={selectedCategory?.hasPoules || false}
                      className="form-checkbox h-5 w-5 text-orange-500 rounded bg-white/5 border-white/10 focus:ring-orange-500 focus:ring-offset-0"
                    />
                    <span className="text-sm font-outfit text-gray-300">Utiliser des poules</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-outfit">
                    Poules (séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    name="poules"
                    defaultValue={selectedCategory?.poules?.join(', ') || ''}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-outfit focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                    placeholder="Ex: A, B, C, D"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-outfit font-medium hover:bg-white/10 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-outfit font-medium hover:opacity-90 transition-opacity"
                  >
                    {selectedCategory ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Form Modal */}
      <AnimatePresence>
        {showTeamForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowTeamForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <TeamForm
                team={selectedTeam}
                categories={categories}
                onSave={handleSaveTeam}
                onCancel={() => {
                  setShowTeamForm(false)
                  setSelectedTeam(null)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
