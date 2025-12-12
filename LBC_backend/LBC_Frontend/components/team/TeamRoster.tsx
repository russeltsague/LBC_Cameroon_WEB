import { FiUser } from 'react-icons/fi'

interface Player {
  id: string
  name: string
  number: number
  position: string
  height: string
  age: number
}

interface TeamRosterProps {
  teamId: string
}

export async function TeamRoster({ teamId }: TeamRosterProps) {
  // Mock data - replace with API call to fetch players by teamId
  const players: Player[] = [
    {
      id: '1',
      name: 'Arnaud Adala Moto',
      number: 8,
      position: 'Forward',
      height: '6\'6"',
      age: 29
    },
    {
      id: '2',
      name: 'Jerry Bilan',
      number: 15,
      position: 'Center',
      height: '6\'10"',
      age: 27
    }
  ]

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Team Roster</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Height</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Age</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}