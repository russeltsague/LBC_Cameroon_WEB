// app/admin/teams/[id]/page.tsx
'use client'
import { notFound } from 'next/navigation'
import { FiArrowLeft, FiEdit2, FiSave, FiUpload } from 'react-icons/fi'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiUser, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'

interface Team {
  id: string
  name: string
  city: string
  logo: string
  founded: number
  arena: string
  championships: number
  category: string
  coach: string
  about: string
}
interface PageProps {
  params: {
    id: string;
  };
}

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch this data from your API
  const [team, setTeam] = useState<Team>({
    id: params.id,
    name: 'FAP Basketball',
    city: 'Yaoundé',
    logo: '/teams/fap-basketball.png',
    founded: 1972,
    arena: 'Yaoundé Sports Complex',
    championships: 8,
    category: 'Elite Men',
    coach: 'Jean-Paul Akono',
    about: 'FAP Basketball Club is one of the most successful basketball teams in Cameroon, with multiple national championships.'
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedTeam, setEditedTeam] = useState<Team>({ ...team })

  const handleSave = () => {
    setTeam(editedTeam)
    setIsEditing(false)
    // Here you would typically send the updated data to your API
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div>
          <h1 className="text-2xl font-bold mb-2">Team Not Found</h1>
          <Link href="/admin/teams" className="text-orange-400 hover:underline">
            Back to Teams
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Team Header */}
      <div className="relative h-64 bg-gradient-to-r from-blue-900/90 to-orange-900/80">
        <div className="absolute inset-0 bg-[url('/images/court-pattern.svg')] opacity-10" />
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="flex flex-col md:flex-row items-center w-full justify-between">
            <div className="flex items-center">
              <div className="w-32 h-32 md:w-48 md:h-48 relative mr-0 md:mr-8 mb-4 md:mb-0">
                <Image
                  src={team.logo}
                  alt={team.name}
                  fill
                  className="object-contain drop-shadow-lg"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full">
                    <FiUpload className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-center md:text-left">
                <Link href="/admin/teams" className="inline-flex items-center text-gray-300 hover:text-white mb-4">
                  <FiArrowLeft className="mr-2" /> Back to Teams
                </Link>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTeam.name}
                    onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
                    className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gray-800 border border-gray-700 rounded px-4 py-2 w-full"
                  />
                ) : (
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{team.name}</h1>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedTeam({ ...team })
                    }}
                    className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition-colors flex items-center"
                  >
                    <FiSave className="mr-2" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition-colors flex items-center"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Team
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About Team */}
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">About the Team</h2>
                {isEditing && (
                  <button className="text-orange-400 hover:text-orange-300">
                    <FiEdit2 />
                  </button>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={editedTeam.about}
                  onChange={(e) => setEditedTeam({ ...editedTeam, about: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white min-h-[120px]"
                />
              ) : (
                <p className="text-gray-300">{team.about}</p>
              )}
            </div>

            {/* Team Roster Admin */}
            <TeamRosterAdmin teamId={team.id} />
          </div>

          <div className="space-y-8">
            {/* Team Info Card */}
            <div className="bg-gray-900 rounded-xl p-6 sticky top-4">
              <h3 className="text-xl font-bold text-white mb-4">Team Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Category</h4>
                  {isEditing ? (
                    <select
                      value={editedTeam.category}
                      onChange={(e) => setEditedTeam({ ...editedTeam, category: e.target.value })}
                      className="bg-gray-800 border border-gray-700 rounded w-full px-3 py-2 text-white"
                    >
                      <option value="Elite Men">Elite Men</option>
                      <option value="Elite Women">Elite Women</option>
                      <option value="U21">U21</option>
                      <option value="U18">U18</option>
                    </select>
                  ) : (
                    <p className="text-white">{team.category}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Head Coach</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTeam.coach}
                      onChange={(e) => setEditedTeam({ ...editedTeam, coach: e.target.value })}
                      className="bg-gray-800 border border-gray-700 rounded w-full px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-white">{team.coach}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Home Arena</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTeam.arena}
                      onChange={(e) => setEditedTeam({ ...editedTeam, arena: e.target.value })}
                      className="bg-gray-800 border border-gray-700 rounded w-full px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-white">{team.arena}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Championships</h4>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editedTeam.championships}
                      onChange={(e) => setEditedTeam({ ...editedTeam, championships: parseInt(e.target.value) })}
                      className="bg-gray-800 border border-gray-700 rounded w-full px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-white">{team.championships}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Founded Year</h4>
                  {isEditing ? (
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={editedTeam.founded}
                      onChange={(e) => setEditedTeam({ ...editedTeam, founded: parseInt(e.target.value) })}
                      className="bg-gray-800 border border-gray-700 rounded w-full px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-white">{team.founded}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Team Roster Admin Component
function TeamRosterAdmin({ teamId }: { teamId: string }) {
  const [players, setPlayers] = useState([
    { id: '1', name: 'Arnaud Adala Moto', number: 8, position: 'Forward', height: '6\'6"', age: 29 },
    { id: '2', name: 'Jerry Bilan', number: 15, position: 'Center', height: '6\'10"', age: 27 }
  ])
  const [isAdding, setIsAdding] = useState(false)
  const [newPlayer, setNewPlayer] = useState({
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
      number: parseInt(newPlayer.number),
      position: newPlayer.position,
      height: newPlayer.height,
      age: parseInt(newPlayer.age)
    }])
    setNewPlayer({ name: '', number: '', position: '', height: '', age: '' })
    setIsAdding(false)
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Team Roster</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition-colors flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Player
        </button>
      </div>
      
      {isAdding && (
        <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Add New Player</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Number</label>
              <input
                type="number"
                min="0"
                value={newPlayer.number}
                onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
              <input
                type="text"
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Height</label>
              <input
                type="text"
                value={newPlayer.height}
                onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded w-full px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
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
              Cancel
            </button>
            <button
              onClick={handleAddPlayer}
              className="px-4 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600 transition-colors"
            >
              Add Player
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Height</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Age</th>
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






