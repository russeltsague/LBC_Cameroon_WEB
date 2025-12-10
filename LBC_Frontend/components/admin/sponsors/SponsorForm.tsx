'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiSave, FiImage, FiGlobe, FiMail, FiPhone } from 'react-icons/fi'
import { Sponsor } from '@/app/lib/api'

const SPONSORSHIP_LEVELS = [
    'Platinum',
    'Gold',
    'Silver',
    'Bronze',
    'Partner'
]

interface SponsorFormProps {
    sponsor?: Sponsor | null
    onSave: (data: any) => Promise<void>
    onCancel: () => void
}

export const SponsorForm = ({ sponsor, onSave, onCancel }: SponsorFormProps) => {
    const { startDate: sponsorStartDate, endDate: sponsorEndDate, ...sponsorWithoutDates } = sponsor || {}
    const [formData, setFormData] = useState({
        name: sponsor?.name || '',
        description: sponsor?.description || '',
        logoUrl: sponsor?.logoUrl || '',
        websiteUrl: sponsor?.websiteUrl || '',
        contactEmail: sponsor?.contactEmail || '',
        contactPhone: sponsor?.contactPhone || '',
        sponsorshipLevel: sponsor?.sponsorshipLevel || 'Partner',
        isActive: sponsor?.isActive !== undefined ? sponsor.isActive : true,
        startDate: sponsorStartDate ? new Date(sponsorStartDate).toISOString().split('T')[0] : '',
        endDate: sponsorEndDate ? new Date(sponsorEndDate).toISOString().split('T')[0] : '',
        ...sponsorWithoutDates
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isActive: e.target.checked }))
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
            <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                    <h2 className="text-xl font-bold text-white font-oswald tracking-wide">
                        {sponsor ? 'Modifier le Sponsor' : 'Nouveau Sponsor'}
                    </h2>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FiX className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Nom du Sponsor</label>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Niveau de Sponsoring</label>
                            <select
                                name="sponsorshipLevel"
                                value={formData.sponsorshipLevel}
                                onChange={handleChange}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            >
                                {SPONSORSHIP_LEVELS.map(level => (
                                    <option key={level} value={level} className="bg-gray-900">{level}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Logo URL</label>
                            <div className="relative">
                                <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="url"
                                    name="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-outfit">Site Web</label>
                        <div className="relative">
                            <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="url"
                                name="websiteUrl"
                                value={formData.websiteUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Email Contact</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Téléphone Contact</label>
                            <div className="relative">
                                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Date de début</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-outfit">Date de fin</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleCheckboxChange}
                            className="w-5 h-5 rounded border-gray-600 text-orange-500 focus:ring-orange-500 bg-gray-700"
                        />
                        <label htmlFor="isActive" className="text-white font-medium font-outfit cursor-pointer">
                            Sponsor Actif
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
