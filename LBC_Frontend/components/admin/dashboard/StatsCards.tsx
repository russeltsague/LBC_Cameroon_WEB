'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiCalendar, FiAward, FiEdit2 } from 'react-icons/fi'
import { getCategories, Category } from '@/app/lib/api'

interface DashboardStats {
    totalTeams: number
    totalMatches: number
    completedMatches: number
    upcomingMatches: number
    categories: number
}

export const StatsCards = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalTeams: 0,
        totalMatches: 0,
        completedMatches: 0,
        upcomingMatches: 0,
        categories: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await getCategories()
                setCategories(categoriesData)
                if (categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0].name)
                }
            } catch (err) {
                console.error('Error fetching categories:', err)
                setError('Failed to load categories')
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchStats = async () => {
            if (!selectedCategory) return

            try {
                setLoading(true)
                // Build URLs
                const matchesUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/matches?category=${encodeURIComponent(selectedCategory)}`
                const teamsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/teams?category=${encodeURIComponent(selectedCategory)}`

                const [matchesRes, teamsRes] = await Promise.all([
                    fetch(matchesUrl),
                    fetch(teamsUrl)
                ])

                if (!matchesRes.ok || !teamsRes.ok) throw new Error('Failed to fetch data')

                const matchesData = await matchesRes.json()
                const teamsData = await teamsRes.json()

                const matches = matchesData.data || []
                const teams = (teamsData.data || teamsData) || []

                const completedMatches = matches.filter((match: any) => match.status === 'completed').length
                const upcomingMatches = matches.filter((match: any) => match.status === 'upcoming').length

                setStats({
                    totalTeams: teams.length,
                    totalMatches: completedMatches + upcomingMatches,
                    completedMatches,
                    upcomingMatches,
                    categories: categories.length
                })
            } catch (err) {
                console.error('Error fetching stats:', err)
                setError('Failed to load statistics')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [selectedCategory])

    const statItems = [
        {
            name: 'Équipes actives',
            value: stats.totalTeams.toString(),
            change: 'dans la catégorie',
            icon: FiUsers,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            name: 'Matchs joués',
            value: stats.completedMatches.toString(),
            change: 'terminés',
            icon: FiCalendar,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        {
            name: 'Matchs à venir',
            value: stats.upcomingMatches.toString(),
            change: 'programmés',
            icon: FiEdit2,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        },
        {
            name: 'Catégories',
            value: stats.categories.toString(),
            change: 'au total',
            icon: FiAward,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
    ]

    return (
        <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin scrollbar-thumb-white/10">
                {categories.map((category) => (
                    <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap font-outfit ${selectedCategory === category.name
                                ? 'bg-white/10 text-white border border-orange-500/50'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="glass rounded-2xl p-6 border border-white/10 animate-pulse h-32" />
                    ))
                ) : (
                    statItems.map((stat, index) => (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass rounded-2xl p-6 border ${stat.border} hover:bg-white/5 transition-all duration-300 group`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-400 text-sm font-medium font-outfit">{stat.name}</h3>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white font-oswald tracking-wide group-hover:scale-105 transition-transform origin-left">
                                {stat.value}
                            </p>
                            <p className="text-sm text-gray-500 mt-2 font-outfit">{stat.change}</p>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
