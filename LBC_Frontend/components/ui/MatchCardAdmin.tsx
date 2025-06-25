'use client'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

type MatchCardAdminProps = {
  match: {
    id: string
    date: string
    time: string
    homeTeam: string
    awayTeam: string
    homeScore?: number
    awayScore?: number
    venue: string
    status: 'completed' | 'upcoming' | 'live'
  }
  formatDate: (dateString: string) => string
  onEdit: () => void
  onDelete: () => void
}

export const MatchCardAdmin = ({ match, formatDate, onEdit, onDelete }: MatchCardAdminProps) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center text-orange-400">
            <CalendarIcon className="w-5 h-5 mr-2" />
            <span>{formatDate(match.date)}</span>
          </div>
          <div className="flex items-center mt-1 text-gray-300">
            <ClockIcon className="w-5 h-5 mr-2" />
            <span>{match.time} • {match.venue}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="text-center mx-4">
            <div className="text-white font-medium">{match.homeTeam}</div>
            <div className="text-gray-300 text-sm">vs</div>
            <div className="text-white font-medium">{match.awayTeam}</div>
          </div>
          
          {match.status === 'completed' && (
            <div className="bg-gray-700 px-3 py-1 rounded-md mx-4">
              <span className="font-bold">{match.homeScore}</span> - <span className="font-bold">{match.awayScore}</span>
            </div>
          )}
          
          <div className="flex space-x-2 ml-4">
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-orange-400 p-1"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-400 p-1"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}