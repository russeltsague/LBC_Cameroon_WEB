'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Filter, Download } from 'lucide-react'
import { Category, Team, getCategories, getTeams, getCalendar, Calendar } from '@/app/lib/api'
import { toast } from 'react-hot-toast'

interface Standing {
    teamId: string
    teamName: string
    teamLogo?: string
    played: number
    won: number
    lost: number
    points: number
    pointsFor: number
    pointsAgainst: number
    pointDiff: number
}

export const StatsManagement = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [calendar, setCalendar] = useState<Calendar | null>(null)
    const [loading, setLoading] = useState(true)

    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedPoule, setSelectedPoule] = useState('A')

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedCategory) {
            fetchCalendarData()
        }
    }, [selectedCategory, selectedPoule])

    const fetchData = async () => {
        try {
            const [catsData, teamsData] = await Promise.all([
                getCategories(),
                getTeams()
            ])
            setCategories(catsData)
            setTeams(Array.isArray(teamsData) ? teamsData : [])

            if (catsData.length > 0) {
                setSelectedCategory(catsData[0].name)
            }
        } catch (error) {
            console.error('Error fetching initial data:', error)
            toast.error('Erreur lors du chargement des données')
        }
    }

    const fetchCalendarData = async () => {
        setLoading(true)
        try {
            const data = await getCalendar(selectedCategory)
            setCalendar(data)
        } catch (error) {
            console.error('Error fetching calendar:', error)
            // Don't show error toast here as it might just mean no calendar exists yet
            setCalendar(null)
        } finally {
            setLoading(false)
        }
    }

    const calculateStandings = (): Standing[] => {
        const standings: Record<string, Standing> = {}
        const teamMap = new Map<string, string>() // Name -> ID

        // Initialize standings for all teams in the selected category
        teams.filter(t => t.category === selectedCategory).forEach(team => {
            standings[team._id] = {
                teamId: team._id,
                teamName: team.name,
                teamLogo: team.logo,
                played: 0,
                won: 0,
                lost: 0,
                points: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                pointDiff: 0
            }
            teamMap.set(team.name, team._id)
        })

        if (!calendar) return Object.values(standings)

        // Helper to process a match
        const processMatch = (homeTeam: string, awayTeam: string, homeScore?: number, awayScore?: number) => {
            if (homeScore === undefined || homeScore === null || awayScore === undefined || awayScore === null) return

            const homeId = teamMap.get(homeTeam)
            const awayId = teamMap.get(awayTeam)

            if (!homeId || !awayId) return
            if (!standings[homeId] || !standings[awayId]) return

            const home = standings[homeId]
            const away = standings[awayId]

            home.played += 1
            away.played += 1

            home.pointsFor += homeScore
            home.pointsAgainst += awayScore
            away.pointsFor += awayScore
            away.pointsAgainst += homeScore

            if (homeScore > awayScore) {
                home.won += 1
                home.points += 2
                away.lost += 1
                away.points += 1
            } else {
                away.won += 1
                away.points += 2
                home.lost += 1
                home.points += 1
            }
        }

        // Process poules
        if (calendar.poules && calendar.poules.length > 0) {
            calendar.poules.forEach(poule => {
                // Only process matches for the selected poule if poules exist
                const currentCategory = categories.find(c => c.name === selectedCategory)
                if (currentCategory?.hasPoules && poule.name !== selectedPoule) return

                poule.journées.forEach(journee => {
                    journee.matches.forEach(match => {
                        processMatch(match.homeTeam, match.awayTeam, match.homeScore, match.awayScore)
                    })
                })
            })
        }

        // Process playoffs (if any) - usually playoffs don't count towards regular season standings, 
        // but if requested, we could include them. For now, let's stick to poules/regular season 
        // as that's what "standings" usually implies.
        // If the user wants playoff stats included, we can uncomment this.
        /*
        if (calendar.playoffs) {
            calendar.playoffs.forEach(stage => {
                stage.matches.forEach(match => {
                    processMatch(match.homeTeam, match.awayTeam, match.homeScore, match.awayScore)
                })
            })
        }
        */

        return Object.values(standings).map(s => ({
            ...s,
            pointDiff: s.pointsFor - s.pointsAgainst
        })).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points
            return b.pointDiff - a.pointDiff
        })
    }

    const standings = calculateStandings()
    const currentCategory = categories.find(c => c.name === selectedCategory)
    const hasPoules = currentCategory?.hasPoules || false

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
                        Statistiques & Classements
                    </h1>
                    <p className="text-gray-400 font-outfit mt-1">
                        Visualisez les performances des équipes (basé sur le calendrier)
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-gray-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit appearance-none"
                    >
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {hasPoules && (
                    <div className="relative min-w-[150px]">
                        <select
                            value={selectedPoule}
                            onChange={(e) => setSelectedPoule(e.target.value)}
                            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-outfit appearance-none"
                        >
                            {currentCategory?.poules?.map(poule => (
                                <option key={poule} value={poule}>Poule {poule}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Standings Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white font-oswald tracking-wide flex items-center">
                            <Trophy className="mr-2 text-yellow-500 w-5 h-5" />
                            Classement
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 font-outfit text-sm uppercase tracking-wider">
                                    <th className="p-4 rounded-tl-lg">Rang</th>
                                    <th className="p-4">Équipe</th>
                                    <th className="p-4 text-center">Pts</th>
                                    <th className="p-4 text-center">J</th>
                                    <th className="p-4 text-center">G</th>
                                    <th className="p-4 text-center">P</th>
                                    <th className="p-4 text-center">Pour</th>
                                    <th className="p-4 text-center">Contre</th>
                                    <th className="p-4 text-center rounded-tr-lg">Diff</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300 font-outfit">
                                {standings.length > 0 ? (
                                    standings.map((team, index) => (
                                        <tr
                                            key={team.teamId}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="p-4 font-bold text-white">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                        index === 2 ? 'bg-orange-600/20 text-orange-500' :
                                                            'bg-white/5 text-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-white">{team.teamName}</td>
                                            <td className="p-4 text-center font-bold text-orange-500">{team.points}</td>
                                            <td className="p-4 text-center">{team.played}</td>
                                            <td className="p-4 text-center text-green-400">{team.won}</td>
                                            <td className="p-4 text-center text-red-400">{team.lost}</td>
                                            <td className="p-4 text-center">{team.pointsFor}</td>
                                            <td className="p-4 text-center">{team.pointsAgainst}</td>
                                            <td className="p-4 text-center font-bold">{team.pointDiff > 0 ? `+${team.pointDiff}` : team.pointDiff}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-gray-500">
                                            Aucune donnée disponible pour cette sélection.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
