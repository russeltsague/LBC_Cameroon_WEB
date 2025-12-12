'use client'

import { motion } from 'framer-motion'
import { FiEdit2, FiTrash, FiGlobe, FiMail, FiPhone, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import Image from 'next/image'
import { Sponsor } from '@/app/lib/api'

interface SponsorListProps {
    sponsors: Sponsor[]
    onEdit: (sponsor: Sponsor) => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string) => void
}

export const SponsorList = ({ sponsors, onEdit, onDelete, onToggleStatus }: SponsorListProps) => {
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Platinum': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'Gold': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            case 'Silver': return 'bg-gray-400/10 text-gray-300 border-gray-400/20'
            case 'Bronze': return 'bg-orange-600/10 text-orange-400 border-orange-600/20'
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }
    }

    if (sponsors.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400 font-outfit">
                Aucun sponsor trouvé.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.map((sponsor, index) => (
                <motion.div
                    key={sponsor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-2xl p-6 border border-white/10 hover:bg-white/5 transition-all group flex flex-col"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 bg-white/5 rounded-xl p-2 flex items-center justify-center border border-white/10">
                            {sponsor.logoUrl ? (
                                <Image
                                    src={sponsor.logoUrl}
                                    alt={sponsor.name}
                                    width={64}
                                    height={64}
                                    className="object-contain w-full h-full"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-600 font-oswald">{sponsor.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold font-outfit border ${getLevelColor(sponsor.sponsorshipLevel)}`}>
                                {sponsor.sponsorshipLevel}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${sponsor.isActive
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {sponsor.isActive ? 'ACTIF' : 'INACTIF'}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 font-oswald tracking-wide">
                        {sponsor.name}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-outfit flex-1">
                        {sponsor.description}
                    </p>

                    <div className="space-y-3 border-t border-white/10 pt-4">
                        {sponsor.websiteUrl && (
                            <a
                                href={sponsor.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors font-outfit"
                            >
                                <FiGlobe className="w-4 h-4 mr-2" />
                                <span className="truncate">{sponsor.websiteUrl.replace(/^https?:\/\//, '')}</span>
                            </a>
                        )}
                        {sponsor.contactEmail && (
                            <div className="flex items-center text-sm text-gray-400 font-outfit">
                                <FiMail className="w-4 h-4 mr-2" />
                                <span className="truncate">{sponsor.contactEmail}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onToggleStatus(sponsor._id)}
                            className={`p-2 rounded-lg transition-colors ${sponsor.isActive
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                    : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'
                                }`}
                            title={sponsor.isActive ? 'Désactiver' : 'Activer'}
                        >
                            {sponsor.isActive ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => onEdit(sponsor)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                        >
                            <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(sponsor._id)}
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
