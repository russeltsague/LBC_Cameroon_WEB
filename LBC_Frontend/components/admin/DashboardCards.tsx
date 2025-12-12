'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiCalendar, 
  FiCheckCircle, 
  FiClock,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import axios from 'axios';
import Link from 'next/link';

interface DashboardMetrics {
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  liveMatches: number;
  recentMatches: any[];
  upcomingWeek: any[];
  categoryBreakdown: CategoryBreakdown[];
}

interface CategoryBreakdown {
  category: string;
  teams: number;
  matches: number;
  completedMatches: number;
}

export function DashboardCards() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/statistics/dashboard`);
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-white/10 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-400 py-12">
        Failed to load dashboard metrics
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Teams',
      value: metrics.totalTeams,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/teams'
    },
    {
      title: 'Total Matches',
      value: metrics.totalMatches,
      icon: FiCalendar,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/matches'
    },
    {
      title: 'Completed',
      value: metrics.completedMatches,
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
      link: '/admin/matches?status=completed'
    },
    {
      title: 'Upcoming',
      value: metrics.upcomingMatches,
      icon: FiClock,
      color: 'from-orange-500 to-orange-600',
      link: '/admin/matches?status=upcoming'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link href={stat.link}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <FiTrendingUp className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                </div>
                <h3 className="text-gray-400 text-sm font-outfit mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-white font-oswald">{stat.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Matches and Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-oswald">Recent Matches</h2>
            <FiActivity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {metrics.recentMatches.length > 0 ? (
              metrics.recentMatches.map((match: any) => (
                <div key={match._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-outfit text-sm">{match.homeTeam?.name || 'TBD'}</span>
                      <span className="text-white font-bold text-lg">{match.homeScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-outfit text-sm">{match.awayTeam?.name || 'TBD'}</span>
                      <span className="text-white font-bold text-lg">{match.awayScore}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs text-gray-400">{match.category}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">No recent matches</div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Matches */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-oswald">Upcoming This Week</h2>
            <FiClock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {metrics.upcomingWeek.length > 0 ? (
              metrics.upcomingWeek.map((match: any) => (
                <div key={match._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="text-white font-outfit text-sm mb-1">{match.homeTeam?.name || 'TBD'}</div>
                    <div className="text-gray-400 text-xs">vs</div>
                    <div className="text-white font-outfit text-sm mt-1">{match.awayTeam?.name || 'TBD'}</div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs text-gray-400">{match.category}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">{match.time}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">No upcoming matches this week</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white font-oswald mb-6">Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.categoryBreakdown.map((category) => (
            <div key={category.category} className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-outfit font-semibold mb-3">{category.category}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Teams:</span>
                  <span className="text-white font-semibold">{category.teams}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Matches:</span>
                  <span className="text-white font-semibold">{category.matches}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Completed:</span>
                  <span className="text-green-400 font-semibold">{category.completedMatches}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
