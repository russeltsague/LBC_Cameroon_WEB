'use client';

import React from 'react';

// Sample data matching the image with different venues for demonstration
const sampleMatches = [
  {
    _id: '1',
    date: '2024-10-01',
    time: '14:00',
    homeTeam: 'Dynamo Douala',
    awayTeam: 'Aigle Royal',
    homeScore: 0,
    awayScore: 0,
    category: 'D1 MASCULINE',
    venue: 'Stade de la Réunification - Terrain 1',
    status: 'upcoming',
    journee: '1ère Journée'
  },
  {
    _id: '2',
    date: '2024-10-01',
    time: '16:00',
    homeTeam: 'Fauve Azur',
    awayTeam: 'Fovu Club',
    homeScore: 0,
    awayScore: 0,
    category: 'D1 MASCULINE',
    venue: 'Stade de la Réunification - Terrain 1',
    status: 'upcoming',
    journee: '1ère Journée'
  },
  {
    _id: '3',
    date: '2024-10-01',
    time: '14:00',
    homeTeam: 'UMS de Loum',
    awayTeam: 'Apejes',
    homeScore: 0,
    awayScore: 0,
    category: 'D1 MASCULINE',
    venue: 'Stade de la Réunification - Terrain 2',
    status: 'upcoming',
    journee: '1ère Journée'
  },
  {
    _id: '4',
    date: '2024-10-01',
    time: '16:00',
    homeTeam: 'Panthère',
    awayTeam: 'FAP',
    homeScore: 0,
    awayScore: 0,
    category: 'D1 MASCULINE',
    venue: 'Stade de la Réunification - Terrain 2',
    status: 'upcoming',
    journee: '1ère Journée'
  },
  {
    _id: '5',
    date: '2024-10-02',
    time: '14:00',
    homeTeam: 'Canon',
    awayTeam: 'Renaissance',
    homeScore: 0,
    awayScore: 0,
    category: 'D1 MASCULINE',
    venue: 'Stade de la Réunification - Terrain 1',
    status: 'upcoming',
    journee: '1ère Journée'
  },
  {
    _id: '6',
    date: '2024-10-02',
    time: '16:00',
    homeTeam: 'Tonnerre',
    awayTeam: 'Dragon',
    homeScore: 0,
    awayScore: 0,
    category: 'D1 MASCULINE',
    venue: 'Stade de la Réunification - Terrain 1',
    status: 'upcoming',
    journee: '1ère Journée'
  },
  // Add matches for a different date and venue
  {
    _id: '7',
    date: '2024-10-03',
    time: '15:00',
    homeTeam: 'AS Fortuna',
    awayTeam: 'New Star',
    homeScore: 0,
    awayScore: 0,
    category: 'D1 MASCULINE',
    venue: 'Stade Omnisports - Terrain Principal',
    status: 'upcoming',
    journee: '1ère Journée'
  }
];

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ThisWeekSchedule = () => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  // Format date for display (DD MM YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter matches for the current week
  const currentWeekMatches = sampleMatches.map(match => {
    const matchDate = new Date(match.date);
    const adjustedDate = new Date(matchDate);
    adjustedDate.setDate(adjustedDate.getDate() + (currentWeekOffset * 7));
    
    return {
      ...match,
      date: adjustedDate.toISOString().split('T')[0] // Format back to YYYY-MM-DD
    };
  });

  // Sort matches by date, then by category, then by time
  const sortedMatches = [...currentWeekMatches].sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) return categoryCompare;
    return a.time.localeCompare(b.time);
  });

  // Group matches by date and venue for display
  const matchesByDateAndVenue = sortedMatches.reduce((acc, match) => {
    const key = `${match.date}-${match.venue}`;
    if (!acc[key]) {
      acc[key] = {
        date: match.date,
        venue: match.venue,
        matches: []
      };
    }
    acc[key].matches.push(match);
    return acc;
  }, {} as Record<string, { date: string; venue: string; matches: typeof sampleMatches }>);

  const groupedMatches = Object.values(matchesByDateAndVenue).sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return a.venue.localeCompare(b.venue);
  });

  // Track the current date and category to avoid redundancy
  let currentDate = '';

  // Calculate date range for the current week
  const getWeekRange = (offset: number) => {
    const dates = [...new Set(sampleMatches.map(match => match.date))].sort();
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    
    // Adjust dates based on week offset
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() + (offset * 7));
    
    const adjustedEnd = new Date(endDate);
    adjustedEnd.setDate(adjustedEnd.getDate() + (offset * 7));
    
    return { startDate: adjustedStart, endDate: adjustedEnd };
  };
  
  const { startDate, endDate } = getWeekRange(currentWeekOffset);
  
  // Format date range for display
  const formatDateRange = (start: Date, end: Date) => {
    const formatOptions: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    };
    
    const startStr = start.toLocaleDateString('fr-FR', { 
      day: '2-digit' 
    });
    
    const endStr = end.toLocaleDateString('fr-FR', formatOptions);
    
    return `Programmation du ${startStr} au ${endStr}`;
  };
  
  // Navigation handlers
  const nextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const prevWeek = () => setCurrentWeekOffset(prev => Math.max(0, prev - 1));
  
  const formatWeekRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long' 
    }).toUpperCase();
    
    const endStr = end.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }).toUpperCase();
    
    return (
      <div className="flex items-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          DU {startStr} AU {endStr}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-950 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 transition-all duration-300">
      {/* Navigation Header */}
      <div className="relative overflow-hidden bg-gray-900">
        <div className="relative flex items-center justify-between p-4 bg-gray-900 text-white">
        <button 
          onClick={prevWeek}
          disabled={currentWeekOffset === 0}
          className={`p-2 rounded-full transition-all duration-200 ${
            currentWeekOffset === 0 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-orange-700/50 hover:scale-105 transform active:scale-95'
          }`}
          aria-label="Semaine précédente"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl md:text-2xl font-bold text-center text-white/90 tracking-wide">
          {formatDateRange(startDate, endDate)}
        </h2>
        
          <button 
            onClick={nextWeek}
            className="p-2 rounded-full hover:bg-orange-700/50 hover:scale-105 transform active:scale-95 transition-all duration-200"
            aria-label="Semaine suivante"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gray-900 p-6 text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
          Programme de la <span className="text-orange-400">Ligue</span>
        </h1>
        <p className="text-gray-300">
          Calendrier des matchs par catégorie
        </p>
      </div>
      
      {/* Date Range */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3 w-1 h-8 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-white">{formatWeekRange(startDate, endDate)}</h2>
          </div>
        </div>
      </div>
      
      {/* Matches by Date and Venue */}
      <div className="divide-y divide-gray-100">
        {groupedMatches.map(({ date, venue, matches }) => {
          const showDate = date !== currentDate;
          currentDate = date;
          
          return (
            <div key={`${date}-${venue}`} className="py-5 px-6 hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-amber-900/10 transition-all duration-300 border-l-4 border-transparent hover:border-orange-500/50">
              {/* Date Header */}
              {showDate && (
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white/90 flex items-center">
                    <span className="relative flex h-8 w-8 items-center justify-center mr-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500/30"></span>
                      <span className="relative inline-flex h-4 w-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500"></span>
                    </span>
                    <span className="relative">
                      {formatDate(date)}
                      <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0"></span>
                    </span>
                  </h3>
                </div>
              )}
              
              {/* Venue */}
              <div className="mb-4 ml-2 pl-6 border-l-2 border-orange-500/40">
                <p className="text-sm font-medium text-orange-200/90 flex items-center">
                  <span className="relative mr-2 flex h-5 w-5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400/30"></span>
                    <svg className="relative h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  </span>
                  {venue}
                </p>
              </div>
            
              {/* Matches Table */}
              <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900 shadow-lg">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Heure
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Domicile
                      </th>
                      <th className="w-16 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Extérieur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Journée
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {matches.map((match, index) => {
                      const showCategory = index === 0 || matches[index - 1].category !== match.category;
                      
                      return (
                        <tr 
                          key={match._id} 
                          className={`group transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'} hover:bg-gray-800/70`}
                        >
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                            {showCategory && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-200 border border-blue-800/30 group-hover:bg-blue-800/40 transition-colors">
                                {match.category}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                            {match.time}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                            {match.homeTeam}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-center">
                            {match.status === 'completed' ? (
                              <span className="inline-flex items-center justify-center w-16 py-1 text-sm font-semibold bg-gray-700 text-white rounded group-hover:bg-gray-600 transition-colors">
                                {match.homeScore} - {match.awayScore}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-10 h-6 text-xs font-semibold bg-blue-600 text-white rounded-full group-hover:bg-blue-500 transition-colors">
                                VS
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                            {match.awayTeam}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs font-medium bg-orange-900/30 text-orange-200 border border-orange-800/30 rounded-full group-hover:bg-orange-800/40 transition-colors">
                              {match.journee}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Add some spacing between venue groups */}
              <div className="h-4"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThisWeekSchedule;
