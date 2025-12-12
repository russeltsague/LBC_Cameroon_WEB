'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { getMatches, Match, Team } from '@/app/lib/api';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const MatchSchedule = () => {
  const [matchesByDateAndVenue, setMatchesByDateAndVenue] = useState<Record<string, Record<string, Match[]>>>({});
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to start from Monday
    return new Date(today.setDate(diff));
  });

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date to display (e.g., "Samedi, 28 juin 2025")
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date).replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format time to HH:MM
  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    return `${hours}H${minutes}`;
  };

  // Get team name
  const getTeamName = (team: Team | string) => {
    return typeof team === 'string' ? team : team.name;
  };

  // Fetch matches for the current week
  useEffect(() => {
    const fetchWeekMatches = async () => {
      try {
        setLoading(true);
        const weekStart = new Date(currentWeekStart);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const startDate = formatDate(weekStart);
        const endDate = formatDate(weekEnd);

        const matchesData = await getMatches(`?startDate=${startDate}&endDate=${endDate}`);

        // Group matches by date and then by venue
        const grouped: Record<string, Record<string, Match[]>> = {};

        // Sort matches by date and time first
        matchesData.sort((a, b) => {
          const dateA = new Date(`${a.date.split('T')[0]}T${a.time}`);
          const dateB = new Date(`${b.date.split('T')[0]}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });

        matchesData.forEach(match => {
          const matchDate = match.date.split('T')[0];
          const venue = match.venue || 'Lieu à déterminer';

          if (!grouped[matchDate]) {
            grouped[matchDate] = {};
          }
          if (!grouped[matchDate][venue]) {
            grouped[matchDate][venue] = [];
          }
          grouped[matchDate][venue].push(match);
        });

        setMatchesByDateAndVenue(grouped);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekMatches();
  }, [currentWeekStart]);

  // Handle week navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(newDate);
  };

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  const sortedDates = Object.keys(matchesByDateAndVenue).sort();

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-[var(--color-background)] to-black/50 px-6 py-5 border-b border-white/10">
        <h2 className="text-2xl font-display font-bold text-white mb-4 md:mb-0 flex items-center uppercase tracking-wider">
          <CalendarIcon className="h-6 w-6 mr-2 text-[var(--color-primary)]" />
          PROGRAMMATION DU {currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }).toUpperCase()} AU {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
        </h2>
        <div className="flex items-center space-x-4 bg-white/5 rounded-full p-1 border border-white/10">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-all text-gray-400"
            aria-label="Semaine précédente"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-all text-gray-400"
            aria-label="Semaine prochaine"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <motion.div
        className="p-6 space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <div key={date} className="space-y-6">
              {/* Date Header */}
              <h3 className="text-xl font-display font-bold text-white underline decoration-[var(--color-primary)] underline-offset-8 italic">
                {formatDisplayDate(date)}
              </h3>

              {/* Venues */}
              {Object.entries(matchesByDateAndVenue[date]).map(([venue, matches]) => (
                <motion.div key={`${date}-${venue}`} variants={itemVariants} className="space-y-2">
                  {/* Venue Header */}
                  <div className="text-center">
                    <span className="text-[var(--color-primary)] font-display font-bold text-lg uppercase tracking-widest italic">
                      {venue}
                    </span>
                  </div>

                  {/* Matches Table */}
                  <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-700/50 text-gray-300">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-bold border-r border-white/5 text-center w-1/6">Catégorie</th>
                          <th scope="col" className="px-4 py-3 font-bold border-r border-white/5 text-center w-24">Heure</th>
                          <th scope="col" className="px-4 py-3 font-bold border-r border-white/5 text-center w-1/2">Rencontre</th>
                          <th scope="col" className="px-2 py-3 font-bold border-r border-white/5 text-center w-16">N°/Gp</th>
                          <th scope="col" className="px-2 py-3 font-bold border-r border-white/5 text-center w-16">Terrain</th>
                          <th scope="col" className="px-2 py-3 font-bold text-center w-16">Journée</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-white/5">
                        {matches.map((match, index) => (
                          <tr key={match._id} className="hover:bg-white/10 transition-colors">
                            <td className="px-4 py-3 font-medium text-white border-r border-white/5 text-center whitespace-nowrap">
                              {match.category}
                            </td>
                            <td className="px-4 py-3 text-gray-300 border-r border-white/5 text-center font-mono">
                              {formatTime(match.time)}
                            </td>
                            <td className="px-4 py-3 border-r border-white/5">
                              <div className="flex items-center justify-center gap-3 font-display font-bold text-base md:text-lg uppercase tracking-wide">
                                <span className="text-white text-right flex-1">{getTeamName(match.homeTeam)}</span>
                                <span className="text-gray-500 text-sm font-sans font-normal px-2">vs</span>
                                <span className="text-white text-left flex-1">{getTeamName(match.awayTeam)}</span>
                              </div>
                            </td>
                            <td className="px-2 py-3 text-center border-r border-white/5 text-gray-400">
                              {match.poule || '-'}
                            </td>
                            <td className="px-2 py-3 text-center border-r border-white/5 text-gray-400">
                              {match.terrain || '-'}
                            </td>
                            <td className="px-2 py-3 text-center text-gray-400">
                              {match.journee || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>
          ))
        ) : (
          <motion.div className="p-12 text-center" variants={itemVariants}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Aucun match prévu</h3>
            <p className="text-gray-400">
              Aucun match n'est programmé pour cette semaine.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MatchSchedule;
