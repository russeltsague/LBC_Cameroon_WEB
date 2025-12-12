'use client'

import { FiSearch, FiFilter } from 'react-icons/fi'
import { Category } from '@/app/lib/api'

interface MatchFiltersProps {
    categories: Category[]
    selectedCategory: string
    selectedPoule: string
    searchTerm: string
    onCategoryChange: (category: string) => void
    onPouleChange: (poule: string) => void
    onSearchChange: (term: string) => void
}

export const MatchFilters = ({
    categories,
    selectedCategory,
    selectedPoule,
    searchTerm,
    onCategoryChange,
    onPouleChange,
    onSearchChange
}: MatchFiltersProps) => {
    const currentCategory = categories.find(c => c.name === selectedCategory)
    const hasPoules = currentCategory?.hasPoules || false
    const poules = currentCategory?.poules || []

    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Rechercher un match..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit"
                />
            </div>

            <div className="relative min-w-[200px]">
                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit appearance-none"
                >
                    {categories.map(cat => (
                        <option key={cat._id} value={cat.name} className="bg-gray-900">{cat.name}</option>
                    ))}
                </select>
            </div>

            {hasPoules && (
                <div className="relative min-w-[150px]">
                    <select
                        value={selectedPoule}
                        onChange={(e) => onPouleChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit appearance-none"
                    >
                        {poules.map(poule => (
                            <option key={poule} value={poule} className="bg-gray-900">Poule {poule}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}
