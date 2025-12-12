'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiSave, FiCheck } from 'react-icons/fi'
import { Category } from '@/app/lib/api'

interface CategoryFormProps {
    category?: Category | null
    onSave: (data: any) => Promise<void>
    onCancel: () => void
}

export const CategoryForm = ({ category, onSave, onCancel }: CategoryFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        hasPoules: false,
        poules: [] as string[],
        isActive: true,
        ...category
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: checked,
            poules: name === 'hasPoules' && !checked ? [] : prev.poules
        }))
    }

    const handlePouleToggle = (poule: string) => {
        setFormData(prev => ({
            ...prev,
            poules: prev.poules.includes(poule)
                ? prev.poules.filter(p => p !== poule)
                : [...prev.poules, poule].sort()
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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                    <h2 className="text-xl font-bold text-white font-oswald tracking-wide">
                        {category ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FiX className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Nom</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                            <input
                                type="checkbox"
                                name="hasPoules"
                                id="hasPoules"
                                checked={formData.hasPoules}
                                onChange={handleCheckboxChange}
                                className="w-5 h-5 rounded border-gray-600 text-orange-500 focus:ring-orange-500 bg-gray-700"
                            />
                            <label htmlFor="hasPoules" className="text-white font-medium font-outfit cursor-pointer">
                                Activer les Poules
                            </label>
                        </div>

                        {formData.hasPoules && (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-outfit">Sélectionner les Poules</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['A', 'B', 'C', 'D'].map(poule => (
                                        <button
                                            key={poule}
                                            type="button"
                                            onClick={() => handlePouleToggle(poule)}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-outfit ${formData.poules.includes(poule)
                                                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                                                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            {formData.poules.includes(poule) && <FiCheck />}
                                            Poule {poule}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleCheckboxChange}
                            className="w-5 h-5 rounded border-gray-600 text-orange-500 focus:ring-orange-500 bg-gray-700"
                        />
                        <label htmlFor="isActive" className="text-white font-medium font-outfit cursor-pointer">
                            Catégorie Active
                        </label>
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
