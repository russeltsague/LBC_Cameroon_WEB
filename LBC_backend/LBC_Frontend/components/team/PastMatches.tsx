import { FiCalendar, FiClock } from 'react-icons/fi'

interface Match {
  id: string
  date: string
  opponent: string
  homeAway: 'home' | 'away'
  result: 'W' | 'L'
  score: string
}

interface PastMatchesProps {
  teamId: string
}

export async function PastMatches({ teamId }: PastMatchesProps) {
  // Mock data - replace with API call to fetch past matches by teamId
  const matches: Match[] = [
    {
      id: '1',
      date: '2023-10-15',
      opponent: 'Université de Douala',
      homeAway: 'home',
      result: 'W',
      score: '78-72'
    },
    {
      id: '2',
      date: '2023-10-08',
      opponent: 'New Stars',
      homeAway: 'away',
      result: 'L',
      score: '65-68'
    }
  ]

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Past Matches</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Opponent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Venue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900/50 divide-y divide-gray-800">
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiCalendar className="text-gray-400 mr-2" />
                    <span className="text-sm text-white">
                      {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <FiClock className="mr-1" /> {match.homeAway === 'home' ? 'Home' : 'Away'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {match.homeAway === 'home' ? 'vs' : '@'} {match.opponent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {match.homeAway === 'home' ? 'Yaoundé Sports Complex' : 'Douala Arena'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    match.result === 'W' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {match.result} {match.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}