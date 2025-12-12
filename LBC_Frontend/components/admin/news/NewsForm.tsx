'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiSave, FiImage, FiTag } from 'react-icons/fi'
import { News } from '@/app/lib/api'

const NEWS_CATEGORIES = [
    'Match Report',
    'Team News',
    'League News',
    'Player Spotlight',
    'General'
]

interface NewsFormProps {
    news?: News | null
    onSave: (data: any) => Promise<void>
    onCancel: () => void
}

export const NewsForm = ({ news, onSave, onCancel }: NewsFormProps) => {
    const [formData, setFormData] = useState<Partial<News>>({
        title: '',
        summary: '',
        content: '',
        author: '',
        category: NEWS_CATEGORIES[0],
        imageUrl: '',
        tags: [],
        isPublished: false,
        ...news
    })
    const [tagInput, setTagInput] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isPublished: e.target.checked }))
    }

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()]
            }))
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
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
            <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                    <h2 className="text-xl font-bold text-white font-oswald tracking-wide">
                        {news ? 'Modifier l\'Article' : 'Nouvel Article'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FiX className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Titre</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Auteur</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Catégorie</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            >
                                {NEWS_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Image URL</label>
                        <div className="relative">
                            <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Résumé</label>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Contenu</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows={8}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Tags</label>
                        <div className="flex gap-2 mb-2">
                            <div className="relative flex-1">
                                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    placeholder="Ajouter un tag..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                            >
                                Ajouter
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags?.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm flex items-center gap-2 border border-orange-500/20">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={formData.isPublished}
                            onChange={handleCheckboxChange}
                            className="w-5 h-5 rounded border-gray-600 text-orange-500 focus:ring-orange-500 bg-gray-700"
                        />
                        <label htmlFor="isPublished" className="text-white font-medium font-outfit cursor-pointer">
                            Publier immédiatement
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
