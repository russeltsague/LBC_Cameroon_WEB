'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiCalendar } from 'react-icons/fi'
import { getCategories, Category, Team, getTeams } from '@/app/lib/api'
import { MatchFilters } from './MatchFilters'
import { MatchList } from './MatchList'
import { MatchForm } from './MatchForm'
import { WeeklyMatchForm } from './WeeklyMatchForm'
import { toast } from 'react-hot-toast'

export const MatchManagement = () => {
    const [matches, setMatches] = useState<any[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedPoule, setSelectedPoule] = useState('A')
    const [searchTerm, setSearchTerm] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMatch, setSelectedMatch] = useState<any>(null)
    const [activeView, setActiveView] = useState<'list' | 'weekly'>('list')

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        if (selectedCategory) {
            fetchMatches()
        }
    }, [selectedCategory, selectedPoule])

    const fetchInitialData = async () => {
        try {
            const [catsData, teamsData] = await Promise.all([
                getCategories(),
                getTeams()
            ])
            setCategories(catsData)
            setTeams(Array.isArray(teamsData) ? teamsData : [])

            if (catsData.length > 0) {
                setSelectedCategory(catsData[0].name)
            }
        } catch (error) {
            console.error('Error fetching initial data:', error)
            toast.error('Erreur lors du chargement des données')
        } finally {
            setLoading(false)
        }
    }

    const fetchMatches = async () => {
        setLoading(true)
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/api/matches?category=${encodeURIComponent(selectedCategory)}`

            const category = categories.find(c => c.name === selectedCategory)
            if (category?.hasPoules) {
                url += `&poule=${selectedPoule}`
            }

            const res = await fetch(url)
            const data = await res.json()
            setMatches(data.data || [])
        } catch (error) {
            console.error('Error fetching matches:', error)
            toast.error('Erreur lors du chargement des matchs')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateMatch = () => {
        setSelectedMatch(null)
        setIsModalOpen(true)
    }

    const handleEditMatch = (match: any) => {
        setSelectedMatch(match)
        setIsModalOpen(true)
    }

    const handleSaveMatch = async (data: any) => {
        try {
            const url = selectedMatch
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/matches/${selectedMatch._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/matches`

            const method = selectedMatch ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('Failed to save match')

            await fetchMatches()
            setIsModalOpen(false)
            setSelectedMatch(null)
            toast.success(selectedMatch ? 'Match modifié' : 'Match créé')
        } catch (error) {
            console.error('Error saving match:', error)
            toast.error('Erreur lors de la sauvegarde du match')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${id}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Failed to delete match')

            await fetchMatches()
            toast.success('Match supprimé')
        } catch (error) {
            console.error('Error deleting match:', error)
            toast.error('Erreur lors de la suppression')
        }
    }

    const filteredMatches = matches.filter(match => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        const homeName = typeof match.homeTeam === 'object' ? match.homeTeam.name : 'Unknown'
        const awayName = typeof match.awayTeam === 'object' ? match.awayTeam.name : 'Unknown'
        return homeName.toLowerCase().includes(term) || awayName.toLowerCase().includes(term)
    })

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
                        Gestion des Matchs
                    </h1>
                    <p className="text-gray-400 font-outfit mt-1">
                        Gérez les matchs de la saison
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setActiveView('list')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeView === 'list'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Liste
                        </button>
                        <button
                            onClick={() => setActiveView('weekly')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeView === 'weekly'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Hebdomadaire
                        </button>
                    </div>

                    {activeView === 'list' && (
                        <button
                            onClick={handleCreateMatch}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
                        >
                            <FiPlus className="w-4 h-4" />
                            <span>Ajouter un match</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeView === 'list' && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Filters */}
                        <MatchFilters
                            categories={categories}
                            selectedCategory={selectedCategory}
                            selectedPoule={selectedPoule}
                            searchTerm={searchTerm}
                            onCategoryChange={setSelectedCategory}
                            onPouleChange={setSelectedPoule}
                            onSearchChange={setSearchTerm}
                        />

                        {/* Match List */}
                        <MatchList
                            matches={filteredMatches}
                            teams={teams}
                            onEdit={handleEditMatch}
                            onDelete={handleDelete}
                        />
                    </motion.div>
                )}

                {activeView === 'weekly' && (
                    <motion.div
                        key="weekly"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <WeeklyMatchForm />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Match Form Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-hidden"
                        >
                            <MatchForm
                                match={selectedMatch}
                                categories={categories}
                                teams={teams}
                                activeCategory={selectedCategory}
                                onSave={handleSaveMatch}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
