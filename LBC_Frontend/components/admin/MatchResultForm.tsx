// components/admin/MatchResultsForm.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiChevronDown } from 'react-icons/fi'

export function MatchResultsForm() {
  const [selectedCategory, setSelectedCategory] = useState('men-division-1')
  const [matches, setMatches] = useState([
    { id: 1, homeTeam: 'FAP', awayTeam: 'Université Douala', date: '2023-10-15', homeScore: null, awayScore: null },
    { id: 2, homeTeam: 'New Stars', awayTeam: 'Prison', date: '2023-10-16', homeScore: 72, awayScore: 68 },
    { id: 3, homeTeam: 'APEJES', awayTeam: 'Minuh', date: '2023-10-17', homeScore: null, awayScore: null },
  ])

  const handleScoreChange = (id: number, team: 'home' | 'away', value: string) => {
    setMatches(matches.map(match => {
      if (match.id === id) {
        return {
          ...match,
          [`${team}Score`]: value === '' ? null : parseInt(value)
        }
      }
      return match
    }))
  }

  const saveResults = () => {
    // Ici vous enverriez normalement les données à votre backend
    alert('Résultats enregistrés avec succès !')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-gray-900 border border-gray-800 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="men-division-1">Division 1 Hommes</option>
            <option value="women-division-1">Division 1 Femmes</option>
            <option value="u21">U21</option>
            <option value="u18">U18</option>
          </select>
          <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
        </div>
        
        <div className="relative max-w-xs">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des matchs..."
            className="bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-800/50 p-4 text-sm font-medium text-gray-400">
          <div className="col-span-4">Match</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Score Domicile</div>
          <div className="col-span-3">Score Extérieur</div>
        </div>
        
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="grid grid-cols-12 p-4 items-center border-b border-gray-800 last:border-0 hover:bg-gray-800/20"
          >
            <div className="col-span-4 font-medium text-white">
              {match.homeTeam} vs {match.awayTeam}
            </div>
            <div className="col-span-2 text-gray-400">{match.date}</div>
            <div className="col-span-3">
              <input
                type="number"
                min="0"
                value={match.homeScore || ''}
                onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1 w-16 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                min="0"
                value={match.awayScore || ''}
                onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1 w-16 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveResults}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
        >
          Enregistrer les Résultats
        </button>
      </div>
    </motion.div>
  )
}
