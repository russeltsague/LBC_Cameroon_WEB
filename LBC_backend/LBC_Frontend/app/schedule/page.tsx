'use client';

import { useEffect, useState } from 'react';
import { getWeeklySchedulesList, getCalendars } from '@/app/lib/api';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface WeeklySchedule {
  _id: string;
  date: string;
  venue: string;
  matches: Array<{
    _id: string;
    category: string;
    time: string;
    teams: string;
    homeTeam?: string;
    awayTeam?: string;
    groupNumber?: string;
    terrain?: string;
    journey?: string;
    homeScore?: number;
    awayScore?: number;
    status?: string;
  }>;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [schedulesData, calendarsData] = await Promise.all([
        getWeeklySchedulesList(),
        getCalendars()
      ]);
      setSchedules(schedulesData);
      setCalendars(calendarsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Impossible de charger les programmes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc: { [date: string]: WeeklySchedule[] }, schedule) => {
    const date = new Date(schedule.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedSchedules).sort();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Function to find match score from calendar data
  const findMatchScoreFromCalendar = (homeTeam: string, awayTeam: string) => {
    for (const calendar of calendars) {
      // Search in poules
      if (calendar.poules) {
        for (const poule of calendar.poules) {
          for (const journee of poule.journées) {
            for (const match of journee.matches) {
              const matchHomeTeam = match.homeTeam.trim();
              const matchAwayTeam = match.awayTeam.trim();
              const searchHomeTeam = homeTeam.trim();
              const searchAwayTeam = awayTeam.trim();
              
              if (
                (matchHomeTeam.toLowerCase() === searchHomeTeam.toLowerCase() && 
                 matchAwayTeam.toLowerCase() === searchAwayTeam.toLowerCase()) ||
                (matchHomeTeam.toLowerCase() === searchAwayTeam.toLowerCase() && 
                 matchAwayTeam.toLowerCase() === searchHomeTeam.toLowerCase())
              ) {
                return {
                  homeScore: match.homeScore,
                  awayScore: match.awayScore,
                  status: match.score && match.score.includes('-') ? 'completed' : 'forfeit'
                };
              }
            }
          }
        }
      }
      
      // Search in playoffs
      if (calendar.playoffs) {
        for (const playoff of calendar.playoffs) {
          for (const match of playoff.matches) {
            const matchHomeTeam = match.homeTeam.trim();
            const matchAwayTeam = match.awayTeam.trim();
            const searchHomeTeam = homeTeam.trim();
            const searchAwayTeam = awayTeam.trim();
            
            if (
              (matchHomeTeam.toLowerCase() === searchHomeTeam.toLowerCase() && 
               matchAwayTeam.toLowerCase() === searchAwayTeam.toLowerCase()) ||
              (matchHomeTeam.toLowerCase() === searchAwayTeam.toLowerCase() && 
               matchAwayTeam.toLowerCase() === searchHomeTeam.toLowerCase())
            ) {
              return {
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                status: match.score && match.score.includes('-') ? 'completed' : 'forfeit'
              };
            }
          }
        }
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-dark to-primary py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white text-center uppercase tracking-wider">
            Programmes Hebdomadaires
          </h1>
          <p className="text-center text-white/90 mt-2 text-lg">
            Calendrier officiel de la Ligue de Basketball du Centre
          </p>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-end mb-6">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-8">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && schedules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-gray-700 text-gray-300 px-6 py-8 rounded-lg text-center"
          >
            <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl">Aucun programme hebdomadaire trouvé pour le moment.</p>
          </motion.div>
        )}

        {!loading && !error && sortedDates.map((date, dateIndex) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dateIndex * 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-display font-bold text-white mb-6 pb-2 border-b-2 border-primary flex items-center gap-3">
              <FiCalendar className="w-6 h-6 text-primary" />
              {formatDate(date)}
            </h2>

            {/* Loop through schedules for this date */}
            {groupedSchedules[date].map((schedule, scheduleIndex) => (
              <div key={schedule._id} className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    {schedule.venue}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                      {schedule.matches?.length || 0} match(s)
                    </span>
                    <button
                      onClick={() => router.push(`/admin/matches/weekly?tab=manage&view=detail&schedule=${schedule._id}`)}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Voir les détails</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto bg-surface rounded-lg shadow-lg border border-gray-700">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-800 text-gray-300 text-sm uppercase tracking-wider">
                        <th className="px-6 py-4 text-left font-semibold">Catégorie</th>
                        <th className="px-6 py-4 text-left font-semibold">Heure</th>
                        <th className="px-6 py-4 text-left font-semibold">Rencontre</th>
                        <th className="px-6 py-4 text-center font-semibold">Score</th>
                        <th className="px-6 py-4 text-center font-semibold">N°/Esp Terrain</th>
                        <th className="px-6 py-4 text-center font-semibold">Journée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {schedule.matches && schedule.matches.length > 0 ? (
                        schedule.matches.map((match, index) => (
                          <tr key={match._id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 text-white font-medium">
                              {match.category}
                            </td>
                            <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                              <FiClock className="w-4 h-4" />
                              {formatTime(match.time || '10:00')}
                            </td>
                            <td className="px-6 py-4 text-white">
                              <span className="font-medium">
                                {match.teams || `${match.homeTeam} vs ${match.awayTeam}`}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {(() => {
                                // First try to get from calendar
                                const teams = match.teams || `${match.homeTeam} vs ${match.awayTeam}`;
                                const teamParts = teams.split(' vs ');
                                
                                if (teamParts.length === 2) {
                                  const calendarScore = findMatchScoreFromCalendar(teamParts[0], teamParts[1]);
                                  
                                  if (calendarScore && calendarScore.homeScore !== undefined && calendarScore.awayScore !== undefined) {
                                    return (
                                      <div className="flex items-center justify-center gap-2">
                                        <span className="text-lg font-bold text-white">{calendarScore.homeScore}</span>
                                        <span className="text-gray-400">-</span>
                                        <span className="text-lg font-bold text-white">{calendarScore.awayScore}</span>
                                        {calendarScore.status === 'forfeit' && (
                                          <span className="ml-2 text-xs text-orange-400">(F)</span>
                                        )}
                                      </div>
                                    );
                                  }
                                }
                                
                                // Fallback to weekly schedule data
                                if (match.homeScore !== undefined && match.awayScore !== undefined) {
                                  return (
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="text-lg font-bold text-white">{match.homeScore}</span>
                                      <span className="text-gray-400">-</span>
                                      <span className="text-lg font-bold text-white">{match.awayScore}</span>
                                      {match.status === 'forfeit' && (
                                        <span className="ml-2 text-xs text-orange-400">(F)</span>
                                      )}
                                    </div>
                                  );
                                }
                                
                                return <span className="text-gray-400">-</span>;
                              })()}
                            </td>
                            <td className="px-6 py-4 text-center text-gray-300">
                              {match.terrain || '-'}
                            </td>
                            <td className="px-6 py-4 text-center text-gray-300">
                              {match.journey || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                            Aucun match dans ce programme
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </motion.div>
        ))}

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-surface rounded-lg border border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            FÉDÉRATION CAMEROUNAISE DE BASKETBALL<br />
            LIGUE DE BASKETBALL DU CENTRE<br />
            Pour toute information : <span className="text-primary">contact@liguecamerounbasket.cm</span>
          </p>
        </div>
      </div>
    </div>
  );
}
