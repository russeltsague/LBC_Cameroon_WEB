'use client'

import { motion } from 'framer-motion'
import { FiEdit2, FiTrash, FiToggleLeft, FiToggleRight, FiUsers } from 'react-icons/fi'
import { Category } from '@/app/lib/api'

interface CategoryListProps {
    categories: Category[]
    onEdit: (category: Category) => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string) => void
}

export const CategoryList = ({ categories, onEdit, onDelete, onToggleStatus }: CategoryListProps) => {
    if (categories.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400 font-outfit">
                Aucune catégorie trouvée.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
                <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-2xl p-6 border border-white/10 hover:bg-white/5 transition-all group flex flex-col"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-xl flex items-center justify-center border border-white/10">
                            <FiUsers className="w-6 h-6 text-orange-400" />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${category.isActive
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            {category.isActive ? 'ACTIF' : 'INACTIF'}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 font-oswald tracking-wide">
                        {category.name}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4 font-outfit flex-1">
                        {category.description || 'Aucune description'}
                    </p>

                    {category.hasPoules && category.poules && category.poules.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {category.poules.map(poule => (
                                <span key={poule} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/20">
                                    Poule {poule}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onToggleStatus(category._id)}
                            className={`p-2 rounded-lg transition-colors ${category.isActive
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                    : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'
                                }`}
                            title={category.isActive ? 'Désactiver' : 'Activer'}
                        >
                            {category.isActive ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => onEdit(category)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                        >
                            <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(category._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <FiTrash className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
