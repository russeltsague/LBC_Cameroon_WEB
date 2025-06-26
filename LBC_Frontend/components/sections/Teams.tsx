'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TeamCard } from '../ui/TeamCard'
import { FiSearch } from 'react-icons/fi'

interface Team {
  id: string
  name: string
  city: string
  logo: string
  category: string
  founded: number
  championships: number
}

export const TeamsSection = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`)

        if (!res.ok) throw new Error('Failed to fetch teams')
        const data = await res.json()
        setTeams(data)
      } catch (err) {
        console.error('Error fetching teams:', err)
        setError('Failed to load teams. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section id="teams" className="py-24 bg-gray-950">
      <div className="container px-6 mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Équipes de la <span className="text-orange-400">Ligue</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Découvrez toutes les équipes participantes cette saison
          </p>
        </motion.div>

        <motion.div className="max-w-2xl mx-auto mb-12 relative" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des équipes..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center text-white">Loading teams...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TeamCard {...team} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                Aucune équipe trouvée pour votre recherche
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
