'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiSave } from 'react-icons/fi'
import { Team, Category } from '@/app/lib/api'

interface MatchFormProps {
    match?: any
    categories: Category[]
    teams: Team[]
    activeCategory: string
    onSave: (data: any) => Promise<void>
    onCancel: () => void
}

export const MatchForm = ({ match, categories, teams, activeCategory, onSave, onCancel }: MatchFormProps) => {
    const { homeTeam: matchHomeTeam, awayTeam: matchAwayTeam, date: matchDate, ...matchWithoutConflicts } = match || {}
    const [formData, setFormData] = useState({
        category: match?.category || '',
        homeTeam: matchHomeTeam?._id || matchHomeTeam || '',
        awayTeam: matchAwayTeam?._id || matchAwayTeam || '',
        poule: match?.poule || '',
        journee: match?.journee || 1,
        status: match?.status || 'upcoming',
        homeScore: match?.homeScore || 0,
        awayScore: match?.awayScore || 0,
        forfeit: match?.forfeit || null as 'home' | 'away' | null,
        date: matchDate ? new Date(matchDate).toISOString().split('T')[0] : '',
        ...matchWithoutConflicts
    })
    const [loading, setLoading] = useState(false)

    // Filter teams based on selected category
    const filteredTeams = teams.filter(t => t.category === formData.category)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev: any) => ({
            ...prev,
            [name]: name === 'journee' || name === 'homeScore' || name === 'awayScore' ? parseInt(value) || 0 : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSave(formData)
        } finally {
            setLoading(false)
        }
    }

    const selectedCategoryData = categories.find(c => c.name === formData.category)
    const hasPoules = selectedCategoryData?.hasPoules || false

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                    <h2 className="text-xl font-bold text-white font-oswald tracking-wide">
                        {match ? 'Modifier le Match' : 'Nouveau Match'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FiX className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category & Status */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Catégorie</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            >
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.name} className="bg-gray-900">{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Statut</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            >
                                <option value="upcoming" className="bg-gray-900">À venir</option>
                                <option value="live" className="bg-gray-900">En direct</option>
                                <option value="completed" className="bg-gray-900">Terminé</option>
                            </select>
                        </div>

                        {/* Poule & Journee */}
                        {hasPoules && (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-outfit">Poule</label>
                                <select
                                    name="poule"
                                    value={formData.poule}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                >
                                    <option value="" className="bg-gray-900">Sélectionner</option>
                                    {selectedCategoryData?.poules?.map(p => (
                                        <option key={p} value={p} className="bg-gray-900">Poule {p}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Journée</label>
                            <input
                                type="number"
                                name="journee"
                                min="1"
                                value={formData.journee}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Heure</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>

                        {/* Teams */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Équipe Domicile</label>
                            <select
                                name="homeTeam"
                                value={formData.homeTeam}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            >
                                <option value="" className="bg-gray-900">Sélectionner</option>
                                {filteredTeams.map(t => (
                                    <option key={t._id} value={t._id} className="bg-gray-900">{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Équipe Extérieur</label>
                            <select
                                name="awayTeam"
                                value={formData.awayTeam}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            >
                                <option value="" className="bg-gray-900">Sélectionner</option>
                                {filteredTeams.map(t => (
                                    <option key={t._id} value={t._id} className="bg-gray-900">{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Venue */}
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Lieu</label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Palais des Sports"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>

                        {/* Scores (if completed) */}
                        {formData.status === 'completed' && (
                            <div className="col-span-1 md:col-span-2 p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                <h3 className="text-white font-medium font-oswald">Résultats</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-outfit">Score Domicile</label>
                                        <input
                                            type="number"
                                            name="homeScore"
                                            value={formData.homeScore}
                                            onChange={handleChange}
                                            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all font-outfit"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-outfit">Score Extérieur</label>
                                        <input
                                            type="number"
                                            name="awayScore"
                                            value={formData.awayScore}
                                            onChange={handleChange}
                                            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all font-outfit"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 font-outfit">Forfait</label>
                                    <select
                                        name="forfeit"
                                        value={formData.forfeit || ''}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, forfeit: e.target.value as any || null }))}
                                        className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 transition-all font-outfit"
                                    >
                                        <option value="">Aucun</option>
                                        <option value="home">Domicile</option>
                                        <option value="away">Extérieur</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-outfit"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center space-x-2 font-outfit disabled:opacity-50"
                        >
                            <FiSave className="w-4 h-4" />
                            <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}
