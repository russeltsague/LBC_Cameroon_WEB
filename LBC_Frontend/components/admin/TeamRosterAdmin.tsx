

// components/admin/TeamRosterAdmin.tsx
'use client'
import { useState } from 'react'
import { FiPlus, FiUser, FiTrash2, FiEdit2 } from 'react-icons/fi'

interface Player {
  id: string
  name: string
  number: number
  position: string
  height: string
  age: number
}

interface TeamRosterAdminProps {
  teamId: string
}

export default function TeamRosterAdmin({ teamId }: TeamRosterAdminProps) {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Arnaud Adala Moto', number: 8, position: 'Ailier', height: '1,98m', age: 29 },
    { id: '2', name: 'Jerry Bilan', number: 15, position: 'Pivot', height: '2,08m', age: 27 }
  ])
  
  const [isAdding, setIsAdding] = useState(false)
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'> & { number: string, age: string }>({
    name: '',
    number: '',
    position: '',
    height: '',
    age: ''
  })

  const handleAddPlayer = () => {
    setPlayers([...players, {
      id: Date.now().toString(),
      name: newPlayer.name,
      number: parseInt(newPlayer.number) || 0,
      position: newPlayer.position,
      height: newPlayer.height,
      age: parseInt(newPlayer.age) || 18
    }])
    setNewPlayer({ name: '', number: '', position: '', height: '', age: '' })
    setIsAdding(false)
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Effectif de l'Équipe</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition-colors flex items-center"
        >
          <FiPlus className="mr-2" />
          Ajouter un Joueur
        </button>
      </div>
      
      {isAdding && (
        <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Ajouter un Nouveau Joueur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
              <input
                type="text"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Numéro</label>
              <input
                type="number"
                min="0"
                value={newPlayer.number}
                onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Poste</label>
              <input
                type="text"
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Taille</label>
              <input
                type="text"
                value={newPlayer.height}
                onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Âge</label>
              <input
                type="number"
                min="16"
                max="50"
                value={newPlayer.age}
                onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAddPlayer}
              className="px-4 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joueur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Poste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Taille</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Âge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900/50 divide-y divide-gray-800">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-400">{player.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center">
                  <FiUser className="mr-2 text-gray-400" /> {player.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.height}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{player.age}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button className="text-gray-400 hover:text-orange-400 mr-3">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-red-400">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}