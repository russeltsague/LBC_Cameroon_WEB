'use client'

import { motion } from 'framer-motion'
import { FiEdit2, FiTrash, FiClock, FiMapPin } from 'react-icons/fi'
import { Team } from '@/app/lib/api'

interface MatchListProps {
    matches: any[]
    teams: Team[]
    onEdit: (match: any) => void
    onDelete: (id: string) => void
}

export const MatchList = ({ matches, teams, onEdit, onDelete }: MatchListProps) => {
    // Group matches by journee
    const matchesByJournee = matches.reduce((acc, match) => {
        const journee = match.journee || 1
        if (!acc[journee]) acc[journee] = []
        acc[journee].push(match)
        return acc
    }, {} as Record<number, any[]>)

    const journees = Object.keys(matchesByJournee).map(Number).sort((a, b) => a - b)

    const getTeamName = (teamId: string | any) => {
        if (typeof teamId === 'object') return teamId.name
        const team = teams.find(t => t._id === teamId)
        return team ? team.name : 'Unknown Team'
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        })
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400 font-outfit">
                Aucun match trouvé pour cette sélection.
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {journees.map(journee => (
                <motion.div
                    key={journee}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-bold text-white font-oswald tracking-wide">
                            {journee}{journee === 1 ? 'ère' : 'ème'} Journée
                        </h3>
                        <div className="h-px flex-1 bg-white/10"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {matchesByJournee[journee].map((match: any, index: number) => (
                            <motion.div
                                key={match._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass rounded-xl p-4 border border-white/10 hover:bg-white/5 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    {/* Teams & Score */}
                                    <div className="flex-1 flex items-center justify-between w-full md:w-auto gap-8">
                                        <div className="flex-1 text-right">
                                            <span className="text-white font-bold font-oswald text-lg">
                                                {getTeamName(match.homeTeam)}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center min-w-[100px]">
                                            {match.status === 'completed' ? (
                                                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                                    <span className="text-2xl font-bold text-orange-500 font-oswald">
                                                        {match.homeScore} - {match.awayScore}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 font-oswald text-xl">VS</div>
                                            )}
                                            <span className={`text-xs mt-1 font-medium px-2 py-0.5 rounded-full ${match.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                    match.status === 'live' ? 'bg-red-500/10 text-red-400 animate-pulse' :
                                                        'bg-gray-500/10 text-gray-400'
                                                }`}>
                                                {match.status === 'completed' ? 'Terminé' :
                                                    match.status === 'live' ? 'EN DIRECT' :
                                                        formatDate(match.date)}
                                            </span>
                                        </div>

                                        <div className="flex-1 text-left">
                                            <span className="text-white font-bold font-oswald text-lg">
                                                {getTeamName(match.awayTeam)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info & Actions */}
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                                        <div className="flex flex-col text-sm text-gray-400 font-outfit">
                                            <div className="flex items-center">
                                                <FiClock className="w-4 h-4 mr-2" />
                                                {match.time}
                                            </div>
                                            <div className="flex items-center">
                                                <FiMapPin className="w-4 h-4 mr-2" />
                                                {match.venue}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(match)}
                                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(match._id)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <FiTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
