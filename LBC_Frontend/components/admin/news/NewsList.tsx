'use client'

import { motion } from 'framer-motion'
import { FiEdit2, FiTrash, FiEye, FiEyeOff, FiCalendar, FiUser, FiTag } from 'react-icons/fi'
import { News } from '@/app/lib/api'

interface NewsListProps {
    news: News[]
    onEdit: (news: News) => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string) => void
}

export const NewsList = ({ news, onEdit, onDelete, onToggleStatus }: NewsListProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (news.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400 font-outfit">
                Aucun article trouvé.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article, index) => (
                <motion.div
                    key={article._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-2xl p-6 border border-white/10 hover:bg-white/5 transition-all group flex flex-col"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold font-outfit border ${article.isPublished
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                            {article.isPublished ? 'PUBLIÉ' : 'BROUILLON'}
                        </span>
                        <span className="text-xs text-blue-400 font-medium font-outfit px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            {article.category}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 font-oswald tracking-wide line-clamp-2">
                        {article.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 font-outfit flex-1">
                        {article.summary || article.content}
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-outfit border-t border-white/10 pt-4">
                            <div className="flex items-center">
                                <FiUser className="w-3 h-3 mr-1" />
                                {article.author}
                            </div>
                            <div className="flex items-center">
                                <FiCalendar className="w-3 h-3 mr-1" />
                                {formatDate(article.createdAt)}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onToggleStatus(article._id)}
                                className={`p-2 rounded-lg transition-colors ${article.isPublished
                                        ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-white'
                                        : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'
                                    }`}
                                title={article.isPublished ? 'Dépublier' : 'Publier'}
                            >
                                {article.isPublished ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => onEdit(article)}
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                            >
                                <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(article._id)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <FiTrash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
