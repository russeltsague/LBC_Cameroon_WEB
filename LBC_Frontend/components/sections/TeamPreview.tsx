
// components/StatsSection.tsx
'use client'

import { motion } from 'framer-motion'
import { FiAward, FiUsers, FiActivity } from 'react-icons/fi'

const stats = [
  { id: 1, name: 'Équipes en compétition', value: '24', icon: FiUsers },
  { id: 2, name: 'Matchs joués', value: '156', icon: FiActivity },
  { id: 3, name: 'Championnats', value: '15', icon: FiAward }
]

export const StatsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-center">
                <div className="p-4 rounded-lg bg-orange-500/10 mr-6">
                  <stat.icon className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-gray-400">{stat.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// components/TeamsPreviewSection.tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TeamCard } from '../ui/TeamCard'

const teams = [
  { id: '1', name: 'FAP Basketball', logo: '/teams/fap-basketball.png', wins: 12, losses: 2 },
  { id: '2', name: 'Université de Douala', logo: '/teams/univ-douala.png', wins: 10, losses: 4 },
  { id: '3', name: 'APEJES Academy', logo: '/teams/apejes.png', wins: 9, losses: 5 },
  { id: '4', name: 'New Stars', logo: '/teams/new-stars.png', wins: 8, losses: 6 }
]

export const TeamsPreviewSection = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Équipes <span className="text-orange-400">Phares</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Découvrez les meilleures équipes de la saison
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * teams.indexOf(team) }}
            >
              <Link href={`/teams/${team.id}`}>
                <TeamCard team={team} />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/teams" 
            className="inline-flex items-center px-6 py-3 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
          >
            Voir toutes les équipes
          </Link>
        </div>
      </div>
    </section>
  )
}
