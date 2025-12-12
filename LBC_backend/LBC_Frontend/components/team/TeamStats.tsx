import { FiBarChart2, FiTarget, FiTrendingUp } from 'react-icons/fi'

interface TeamStatsProps {
  teamId: string
}

export async function TeamStats({ teamId }: TeamStatsProps) {
  // Mock data - replace with API call to fetch stats by teamId
  const stats = {
    ppg: 86.4,
    oppg: 78.2,
    fgPercentage: 45.3,
    threePercentage: 36.1,
    rebounds: 42.5,
    assists: 20.8
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Team Statistics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          icon={<FiTrendingUp className="text-orange-400" />}
          title="Points Per Game"
          value={stats.ppg.toFixed(1)}
          comparison={`+${(stats.ppg - stats.oppg).toFixed(1)} vs opponents`}
        />
        <StatCard 
          icon={<FiBarChart2 className="text-orange-400" />}
          title="Field Goal %"
          value={`${stats.fgPercentage.toFixed(1)}%`}
          comparison="League avg: 45.2%"
        />
        <StatCard 
          icon={<FiTarget className="text-orange-400" />}
          title="3-Point %"
          value={`${stats.threePercentage.toFixed(1)}%`}
          comparison="League avg: 35.7%"
        />
        <StatCard 
          icon={<FiTrendingUp className="text-orange-400" />}
          title="Rebounds"
          value={stats.rebounds.toFixed(1)}
          comparison="League avg: 42.3"
        />
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, comparison }: {
  icon: React.ReactNode
  title: string
  value: string
  comparison: string
}) {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <div className="flex items-center mb-2">
        <div className="p-2 rounded-full bg-orange-500/10 mr-3">
          {icon}
        </div>
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{comparison}</p>
    </div>
  )
}