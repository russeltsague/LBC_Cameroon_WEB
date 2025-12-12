'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { News, getAllNews, createNews, updateNews, deleteNews, toggleNewsStatus } from '@/app/lib/api'
import { NewsList } from './NewsList'
import { NewsForm } from './NewsForm'
import { toast } from 'react-hot-toast'

export const NewsManagement = () => {
    const [news, setNews] = useState<News[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedNews, setSelectedNews] = useState<News | null>(null)

    useEffect(() => {
        fetchNews()
    }, [])

    const fetchNews = async () => {
        try {
            setLoading(true)
            const data = await getAllNews()
            setNews(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching news:', error)
            toast.error('Erreur lors du chargement des actualités')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (data: any) => {
        try {
            if (selectedNews) {
                await updateNews(selectedNews._id, data)
                toast.success('Article mis à jour')
            } else {
                await createNews(data)
                toast.success('Article créé')
            }
            await fetchNews()
            setIsModalOpen(false)
            setSelectedNews(null)
        } catch (error) {
            console.error('Error saving news:', error)
            toast.error('Erreur lors de l\'enregistrement')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

        try {
            await deleteNews(id)
            setNews(news.filter(n => n._id !== id))
            toast.success('Article supprimé')
        } catch (error) {
            console.error('Error deleting news:', error)
            toast.error('Erreur lors de la suppression')
        }
    }

    const handleToggleStatus = async (id: string) => {
        try {
            const updated = await toggleNewsStatus(id)
            setNews(news.map(n => n._id === id ? updated : n))
            toast.success(updated.isPublished ? 'Article publié' : 'Article dépublié')
        } catch (error) {
            console.error('Error toggling status:', error)
            toast.error('Erreur lors du changement de statut')
        }
    }

    const filteredNews = news.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
                        Actualités
                    </h1>
                    <p className="text-gray-400 font-outfit mt-1">
                        Gérez les articles et publications
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedNews(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center space-x-2 font-outfit"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Nouvel Article</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Rechercher un article..."
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
                <NewsList
                    news={filteredNews}
                    onEdit={(article) => {
                        setSelectedNews(article)
                        setIsModalOpen(true)
                    }}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                />
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <NewsForm
                        news={selectedNews}
                        onSave={handleSave}
                        onCancel={() => {
                            setIsModalOpen(false)
                            setSelectedNews(null)
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
