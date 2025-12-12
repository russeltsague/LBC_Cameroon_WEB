import { FiCalendar, FiClock } from 'react-icons/fi'

interface Match {
  id: string
  date: string
  time: string
  opponent: string
  homeAway: 'home' | 'away'
  venue: string
}

interface UpcomingMatchesProps {
  teamId: string
}

export async function UpcomingMatches({ teamId }: UpcomingMatchesProps) {
  // Mock data - replace with API call to fetch upcoming matches by teamId
  const matches: Match[] = [
    {
      id: '1',
      date: '2023-11-15',
      time: '18:00',
      opponent: 'Université de Douala',
      homeAway: 'home',
      venue: 'Yaoundé Sports Complex'
    },
    {
      id: '2',
      date: '2023-11-22',
      time: '15:00',
      opponent: 'APEJES Academy',
      homeAway: 'away',
      venue: 'Douala Arena'
    }
  ]

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Upcoming Matches</h2>
      
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <FiCalendar className="text-orange-400 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {match.homeAway === 'home' ? 'vs' : '@'} {match.opponent}
                </h3>
                <div className="flex items-center space-x-3 text-gray-400 mt-1">
                  <span className="flex items-center text-sm">
                    <FiClock className="w-4 h-4 mr-1" /> 
                    {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {match.time}
                  </span>
                  <span className="text-sm bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                    {match.venue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}