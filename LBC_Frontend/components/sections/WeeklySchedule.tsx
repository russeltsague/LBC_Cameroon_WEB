'use client'
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { getMatches } from '@/app/lib/api';

type Team = {
  _id: string;
  name: string;
  logo?: string;
};

type Match = {
  _id: string;
  date: string;
  time: string;
  homeTeam: Team | string;
  awayTeam: Team | string;
  homeScore?: number;
  awayScore?: number;
  category: string;
  venue: string;
  status: 'completed' | 'upcoming' | 'live';
};

export const WeeklySchedule = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Get start and end of current week
  const getWeekDates = (weekOffset = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { start: startOfWeek, end: endOfWeek };
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date to display (e.g., "Lundi 12 Mars")
  const formatDisplayDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date).replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format time to HH:MM
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Get team name, handling both string and Team object
  const getTeamName = (team: Team | string) => {
    return typeof team === 'string' ? team : team.name;
  };

  // Fetch matches for the current week
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const { start, end } = getWeekDates(currentWeek);
        const startDate = formatDate(start);
        const endDate = formatDate(end);
        
        // This assumes you have an API endpoint that can filter matches by date range
        const matchesData = await getMatches(`?startDate=${startDate}&endDate=${endDate}`);
        setMatches(matchesData);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentWeek]);

  // Group matches by date
  const matchesByDate: Record<string, Match[]> = {};
  matches.forEach(match => {
    const matchDate = match.date.split('T')[0];
    if (!matchesByDate[matchDate]) {
      matchesByDate[matchDate] = [];
    }
    matchesByDate[matchDate].push(match);
  });

  // Get days of the current week
  const getWeekDays = () => {
    const { start } = getWeekDates(currentWeek);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date().toDateString();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Week Navigation */}
      <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
        <button
          onClick={() => setCurrentWeek(prev => prev - 1)}
          className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Semaine précédente
        </button>
        
        <div className="flex items-center text-gray-700 font-medium">
          <CalendarIcon className="h-5 w-5 mr-2 text-orange-500" />
          {formatDisplayDate(weekDays[0])} - {formatDisplayDate(weekDays[6])}
        </div>
        
        <button
          onClick={() => setCurrentWeek(prev => prev + 1)}
          className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
        >
          Semaine prochaine
          <ChevronRightIcon className="h-5 w-5 ml-1" />
        </button>
      </div>

      {/* Days Navigation */}
      <div className="flex overflow-x-auto bg-white border-b">
        {weekDays.map((day, index) => {
          const dayMatches = matchesByDate[formatDate(day)] || [];
          const isToday = day.toDateString() === today;
          const isExpanded = expandedDay === formatDate(day);
          
          return (
            <div 
              key={index}
              className={`flex-shrink-0 w-1/7 px-4 py-3 cursor-pointer transition-colors ${
                isToday ? 'bg-orange-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setExpandedDay(isExpanded ? null : formatDate(day))}
            >
              <div className={`text-center text-sm font-medium ${
                isToday ? 'text-orange-600' : 'text-gray-700'
              }`}>
                {new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(day)}
              </div>
              <div className={`mt-1 text-center text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center mx-auto ${
                isToday ? 'bg-orange-500 text-white' : 'text-gray-800'
              }`}>
                {day.getDate()}
              </div>
              {dayMatches.length > 0 && (
                <div className="mt-1 text-center">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    {dayMatches.length} match{dayMatches.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Matches List */}
      <div className="divide-y">
        {expandedDay ? (
          // Show matches for the selected day
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Programme du {formatDisplayDate(new Date(expandedDay))}
            </h3>
            
            {matchesByDate[expandedDay]?.length > 0 ? (
              <div className="space-y-4">
                {matchesByDate[expandedDay].map((match) => (
                  <div key={match._id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">{match.category}</span>
                      <span className="text-xs text-gray-400">{match.venue}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="text-right w-5/12 font-medium">
                        {getTeamName(match.homeTeam)}
                      </div>
                      
                      <div className="flex items-center justify-center w-2/12">
                        <div className="bg-gray-100 rounded-lg px-3 py-1 text-center">
                          <span className="text-sm font-bold">
                            {match.status === 'completed' ? (
                              `${match.homeScore || 0} - ${match.awayScore || 0}`
                            ) : (
                              formatTime(match.time)
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-left w-5/12 font-medium">
                        {getTeamName(match.awayTeam)}
                      </div>
                    </div>
                    
                    {match.status === 'live' && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                          EN DIRECT
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun match prévu ce jour
              </div>
            )}
          </div>
        ) : (
          // Show today's matches by default, or a message if none
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Programme d'aujourd'hui
            </h3>
            
            {matchesByDate[formatDate(new Date())]?.length > 0 ? (
              <div className="space-y-4">
                {matchesByDate[formatDate(new Date())].map((match) => (
                  <div key={match._id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">{match.category}</span>
                      <span className="text-xs text-gray-400">{match.venue}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="text-right w-5/12 font-medium">
                        {getTeamName(match.homeTeam)}
                      </div>
                      
                      <div className="flex items-center justify-center w-2/12">
                        <div className="bg-gray-100 rounded-lg px-3 py-1 text-center">
                          <span className="text-sm font-bold">
                            {match.status === 'completed' ? (
                              `${match.homeScore || 0} - ${match.awayScore || 0}`
                            ) : (
                              formatTime(match.time)
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-left w-5/12 font-medium">
                        {getTeamName(match.awayTeam)}
                      </div>
                    </div>
                    
                    {match.status === 'live' && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                          EN DIRECT
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun match prévu aujourd'hui
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
