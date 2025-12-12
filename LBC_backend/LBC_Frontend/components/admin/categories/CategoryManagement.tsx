'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { Category, getAllCategories, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '@/app/lib/api'
import { CategoryList } from './CategoryList'
import { CategoryForm } from './CategoryForm'
import { toast } from 'react-hot-toast'

export const CategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const data = await getAllCategories()
            setCategories(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Erreur lors du chargement des catégories')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (data: any) => {
        try {
            if (selectedCategory) {
                await updateCategory(selectedCategory._id, data)
                toast.success('Catégorie mise à jour')
            } else {
                await createCategory(data)
                toast.success('Catégorie créée')
            }
            await fetchCategories()
            setIsModalOpen(false)
            setSelectedCategory(null)
        } catch (error) {
            console.error('Error saving category:', error)
            toast.error('Erreur lors de l\'enregistrement')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return

        try {
            await deleteCategory(id)
            setCategories(categories.filter(c => c._id !== id))
            toast.success('Catégorie supprimée')
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error('Erreur lors de la suppression')
        }
    }

    const handleToggleStatus = async (id: string) => {
        try {
            const updated = await toggleCategoryStatus(id)
            setCategories(categories.map(c => c._id === id ? updated : c))
            toast.success(updated.isActive ? 'Catégorie activée' : 'Catégorie désactivée')
        } catch (error) {
            console.error('Error toggling status:', error)
            toast.error('Erreur lors du changement de statut')
        }
    }

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
                        Catégories
                    </h1>
                    <p className="text-gray-400 font-outfit mt-1">
                        Gérez les catégories et les poules
                    </p>
                </div>

                <button
                    onClick={() => {
                        setSelectedCategory(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center space-x-2 font-outfit"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Nouvelle Catégorie</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Rechercher une catégorie..."
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
                <CategoryList
                    categories={filteredCategories}
                    onEdit={(category) => {
                        setSelectedCategory(category)
                        setIsModalOpen(true)
                    }}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                />
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <CategoryForm
                        category={selectedCategory}
                        onSave={handleSave}
                        onCancel={() => {
                            setIsModalOpen(false)
                            setSelectedCategory(null)
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
