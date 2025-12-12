'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { Sponsor, getAllSponsors, createSponsor, updateSponsor, deleteSponsor, toggleSponsorStatus } from '@/app/lib/api'
import { SponsorList } from './SponsorList'
import { SponsorForm } from './SponsorForm'
import { toast } from 'react-hot-toast'

export const SponsorManagement = () => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null)

    useEffect(() => {
        fetchSponsors()
    }, [])

    const fetchSponsors = async () => {
        try {
            setLoading(true)
            const data = await getAllSponsors()
            setSponsors(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching sponsors:', error)
            toast.error('Erreur lors du chargement des sponsors')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (data: any) => {
        try {
            if (selectedSponsor) {
                await updateSponsor(selectedSponsor._id, data)
                toast.success('Sponsor mis à jour')
            } else {
                await createSponsor(data)
                toast.success('Sponsor créé')
            }
            await fetchSponsors()
            setIsModalOpen(false)
            setSelectedSponsor(null)
        } catch (error) {
            console.error('Error saving sponsor:', error)
            toast.error('Erreur lors de l\'enregistrement')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce sponsor ?')) return

        try {
            await deleteSponsor(id)
            setSponsors(sponsors.filter(s => s._id !== id))
            toast.success('Sponsor supprimé')
        } catch (error) {
            console.error('Error deleting sponsor:', error)
            toast.error('Erreur lors de la suppression')
        }
    }

    const handleToggleStatus = async (id: string) => {
        try {
            const updated = await toggleSponsorStatus(id)
            setSponsors(sponsors.map(s => s._id === id ? updated : s))
            toast.success(updated.isActive ? 'Sponsor activé' : 'Sponsor désactivé')
        } catch (error) {
            console.error('Error toggling status:', error)
            toast.error('Erreur lors du changement de statut')
        }
    }

    const filteredSponsors = sponsors.filter(sponsor =>
        sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sponsor.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
                        Partenaires & Sponsors
                    </h1>
                    <p className="text-gray-400 font-outfit mt-1">
                        Gérez les partenariats de la ligue
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedSponsor(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center space-x-2 font-outfit"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Nouveau Sponsor</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Rechercher un sponsor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            ) : (
                <SponsorList
                    sponsors={filteredSponsors}
                    onEdit={(sponsor) => {
                        setSelectedSponsor(sponsor)
                        setIsModalOpen(true)
                    }}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                />
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <SponsorForm
                        sponsor={selectedSponsor}
                        onSave={handleSave}
                        onCancel={() => {
                            setIsModalOpen(false)
                            setSelectedSponsor(null)
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
