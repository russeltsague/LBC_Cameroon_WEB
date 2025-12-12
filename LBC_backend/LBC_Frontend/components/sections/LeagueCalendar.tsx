'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getCategories, getCalendars } from '@/app/lib/api';
import { Category, Calendar as CalendarType } from '@/app/lib/api';
import { FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const LeagueCalendar: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch categories and calendars on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
        
        const [categoriesData] = await Promise.all([
          getCategories()
        ]);
        
        console.log('Categories fetched:', categoriesData);
        
        // Try to fetch calendars - first try public API, then authenticated API
        let calendarsData: CalendarType[] = [];
        try {
          // Try public API first
          const publicResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/calendar/public`);
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            calendarsData = publicData.data || [];
            console.log('Public calendars fetched:', calendarsData);
          }
        } catch (publicError) {
          console.log('Public API failed, trying authenticated API...');
        }
        
        // If public API failed, try authenticated API
        if (calendarsData.length === 0) {
          try {
            calendarsData = await getCalendars();
            console.log('Authenticated calendars fetched:', calendarsData);
          } catch (authError) {
            console.log('Authenticated API also failed');
          }
        }
        
        // Move 'CORPORATES' to the end
        const sortedCategories = [...categoriesData].sort((a, b) => {
          if (a.name === 'CORPORATES') return 1;
          if (b.name === 'CORPORATES') return -1;
          return 0;
        });
        
        setCategories(sortedCategories);
        setCalendars(calendarsData);
        
        if (sortedCategories.length > 0) {
          setSelectedCategory(sortedCategories[0].name);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // If calendar fetch fails, still show categories
        try {
          const categoriesData = await getCategories();
          const sortedCategories = [...categoriesData].sort((a, b) => {
            if (a.name === 'CORPORATES') return 1;
            if (b.name === 'CORPORATES') return -1;
            return 0;
          });
          setCategories(sortedCategories);
          if (sortedCategories.length > 0) {
            setSelectedCategory(sortedCategories[0].name);
          }
        } catch (catError) {
          console.error('Error fetching categories:', catError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCurrentCalendar = () => {
    const calendar = calendars.find(cal => cal.category === selectedCategory);
    console.log('Current calendar for category', selectedCategory, ':', calendar);
    console.log('Available calendars:', calendars);
    return calendar;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const currentCalendar = getCurrentCalendar();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm"
          >
            <span className="text-orange-400 font-semibold text-sm tracking-wider uppercase">Saison 2024-2025</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Calendrier des <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Rencontres</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Suivez tous les matchs de la saison régulière et des phases finales avec notre calendrier interactif.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-12">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl">
              <div className="lg:hidden w-full mb-6">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl bg-gray-800/80 text-white border border-gray-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 appearance-none shadow-lg backdrop-blur-xl font-medium text-lg transition-all"
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Desktop Tabs - Same style as Featured Teams */}
              <div className="hidden lg:flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category._id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedCategory === category.name
                        ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/10'
                      }`}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        {!currentCalendar ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun calendrier disponible</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Aucun calendrier n'a été créé pour la catégorie "{selectedCategory}". 
              Veuillez contacter l'administration pour plus d'informations.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {currentCalendar.hasPoules && currentCalendar.poules ? (
              currentCalendar.poules.map((poule, pouleIndex) => (
                <motion.div
                  key={pouleIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: pouleIndex * 0.1 }}
                  className="bg-gray-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                >
                  {/* Poule Header - Not Clickable */}
                  <div className="px-8 py-6 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 rounded-full bg-blue-500 block"></span>
                        {poule.name}
                      </h3>
                      <p className="text-blue-300/80 text-sm mt-1 ml-5 font-medium">
                        {poule.teams?.length || 0} ÉQUIPES EN COMPÉTITION
                      </p>
                      {/* Team Names */}
                      {poule.teams && poule.teams.length > 0 && (
                        <div className="mt-3 ml-5 flex flex-wrap gap-2">
                          {poule.teams.map((team, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/10 rounded text-xs font-medium text-blue-200 border border-blue-500/20">
                              {team}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 max-w-2xl justify-end">
                      {poule.teams && poule.teams.length > 0 && (
                        <>
                          {poule.teams.slice(0, 6).map((team, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-500/10 rounded-lg text-xs font-semibold text-blue-200 border border-blue-500/20 whitespace-nowrap">
                              {team}
                            </span>
                          ))}
                          {poule.teams.length > 6 && (
                            <span className="px-3 py-1 bg-blue-500/10 rounded-lg text-xs font-semibold text-blue-200 border border-blue-500/20">
                              +{poule.teams.length - 6}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Poule Content - Always Visible */}
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {poule.journées.map((journee) => (
                        <div key={journee.n} className="group bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
                          <div className="bg-white/5 px-5 py-3 flex justify-between items-center border-b border-white/5">
                            <span className="font-bold text-white text-lg flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Journée {journee.n}
                            </span>
                            {journee.exempt && (
                              <span className="text-xs font-bold bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/20 flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Exempt: {journee.exempt}
                              </span>
                            )}
                          </div>
                          {/* Journée Content - Always Visible */}
                          <div className="p-2 space-y-1">
                            {journee.matches.map((match, idx) => (
                              <div key={idx} className="p-3 rounded-xl hover:bg-white/5 transition-colors group/match">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-right text-sm text-gray-300 truncate flex-1 font-medium group-hover/match:text-white transition-colors" title={match.homeTeam}>
                                    {match.homeTeam || 'TBD'}
                                  </div>
                                  <div className="px-4 py-1.5 bg-gray-900/80 rounded-lg font-bold text-white border border-white/10 text-sm whitespace-nowrap min-w-[80px] text-center shadow-inner">
                                    {match.homeScore !== undefined && match.awayScore !== undefined ? `${match.homeScore}-${match.awayScore}` : '-'}
                                  </div>
                                  <div className="text-left text-sm text-gray-300 truncate flex-1 font-medium group-hover/match:text-white transition-colors" title={match.awayTeam}>
                                    {match.awayTeam || 'TBD'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              /* Simple Format - Display matches directly */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              >
                <div className="px-8 py-6 bg-gradient-to-r from-green-900/40 to-green-800/40 border-b border-white/5">
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                      <span className="w-2 h-8 rounded-full bg-green-500 block"></span>
                      {currentCalendar.category}
                    </h3>
                    <p className="text-green-300/80 text-sm mt-1 ml-5 font-medium">FORMAT SIMPLE</p>
                    {/* Team Names for Simple Format */}
                    {currentCalendar.poules && currentCalendar.poules.length > 0 && currentCalendar.poules[0].teams && (
                      <div className="mt-3 ml-5 flex flex-wrap gap-2">
                        {currentCalendar.poules[0].teams.map((team, index) => (
                          <span key={index} className="px-2 py-1 bg-green-500/10 rounded text-xs font-medium text-green-200 border border-green-500/20">
                            {team}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Check if there are any matches in the calendar */}
                {currentCalendar.poules && currentCalendar.poules.length > 0 && currentCalendar.poules[0].journées ? (
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {currentCalendar.poules[0].journées.map((journee) => (
                        <div key={journee.n} className="group bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
                          <div className="bg-white/5 px-5 py-3 flex justify-between items-center border-b border-white/5">
                            <span className="font-bold text-white text-lg flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Journée {journee.n}
                            </span>
                            {journee.exempt && (
                              <span className="text-xs font-bold bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/20 flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Exempt: {journee.exempt}
                              </span>
                            )}
                          </div>
                          {/* Journée Content - Always Visible */}
                          <div className="p-2 space-y-1">
                            {journee.matches.map((match, idx) => (
                              <div key={idx} className="p-3 rounded-xl hover:bg-white/5 transition-colors group/match">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-right text-sm text-gray-300 truncate flex-1 font-medium group-hover/match:text-white transition-colors" title={match.homeTeam}>
                                    {match.homeTeam || 'TBD'}
                                  </div>
                                  <div className="px-4 py-1.5 bg-gray-900/80 rounded-lg font-bold text-white border border-white/10 text-sm whitespace-nowrap min-w-[80px] text-center shadow-inner">
                                    {match.homeScore !== undefined && match.awayScore !== undefined ? `${match.homeScore}-${match.awayScore}` : '-'}
                                  </div>
                                  <div className="text-left text-sm text-gray-300 truncate flex-1 font-medium group-hover/match:text-white transition-colors" title={match.awayTeam}>
                                    {match.awayTeam || 'TBD'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCalendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Aucun match programmé</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Aucun match n'a été programmé pour cette catégorie.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Playoffs Section */}
            {currentCalendar.playoffs && currentCalendar.playoffs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              >
                <div className="px-8 py-6 bg-gradient-to-r from-purple-900/40 to-purple-800/40 border-b border-white/5">
                  <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <span className="w-2 h-8 rounded-full bg-purple-500 block"></span>
                    Phase Finale
                  </h3>
                  <p className="text-purple-300/80 text-sm mt-1 ml-5 font-medium">ÉLIMINATION DIRECTE</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentCalendar.playoffs.map((round, rIdx) => (
                      <div key={rIdx} className="group bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="bg-white/5 px-5 py-3 border-b border-white/5">
                          <h4 className="font-bold text-white text-lg flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            {round.name}
                          </h4>
                        </div>
                        <div className="p-2 space-y-1">
                          {round.matches.map((match, i) => (
                            <div key={i} className="p-3 rounded-xl hover:bg-white/5 transition-colors">
                              <div className="font-medium text-gray-200 text-sm text-center">{match.homeTeam}</div>
                              {match.homeScore !== undefined && match.awayScore !== undefined && (
                                <div className="text-xs text-purple-400 mt-1 text-center font-medium">{match.homeScore}-{match.awayScore}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-block p-6 rounded-2xl bg-gray-900/40 backdrop-blur-sm border border-white/5">
            <p className="text-orange-400 font-bold text-lg mb-1">Le Secrétaire Général</p>
            <p className="text-gray-400 text-sm">Fédération Camerounaise de Basketball - Ligue du Centre</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeagueCalendar;
