// components/ClassificationSection.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react';
import { TrophyIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import useSWR from 'swr';
import { getCategories, Category, getTeams, Team, getClassificationFromCalendar } from '@/app/lib/api';
import { useAppStore } from '@/lib/store';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

interface TeamStanding {
  _id: string;
  team: {
    _id: string;
    name: string;
    logo?: string;
  };
  position: number;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifference: number;
  points: number;
  recentResults: string[];
  category: string;
}

interface ClassificationProps {
  category?: string;
}

export default function Classification({ category: initialCategory }: ClassificationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPoule, setSelectedPoule] = useState<string>('A');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const classificationVersion = useAppStore((state) => state.classificationVersion);

  const { data: categories, error: categoriesError } = useSWR<Category[]>('/api/categories', getCategories);
  const { data: allTeams, error: teamsError } = useSWR<Team[]>('/api/teams', getTeams);

  useEffect(() => {
    if (!categories) return;

    const savedCategory = localStorage.getItem('classificationCategory');
    const validSaved = categories.find(cat => cat.name === savedCategory);

    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else if (savedCategory && validSaved) {
      setSelectedCategory(savedCategory);
    } else if (categories.length > 0) {
      const sorted = [...categories].sort((a, b) => {
        if (a.name === 'CORPORATES') return 1;
        if (b.name === 'CORPORATES') return -1;
        return 0;
      });
      setSelectedCategory(sorted[0].name);
    }
  }, [categories, initialCategory]);

  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('classificationCategory', selectedCategory);
      setSelectedPoule('A');
    }
  }, [selectedCategory]);

  const getApiCategoryName = (categoryName: string): string => {
    const categoryMapping: { [key: string]: string } = {
      'L1 MESSIEURS': 'L1 MESSIEUR',
      'L2A MESSIEURS': 'L2A MESSIEUR',
      'L2B MESSIEURS': 'L2B MESSIEUR'
    };
    return categoryMapping[categoryName] || categoryName;
  };

  const currentCategory = useMemo(() => categories?.find(cat => cat.name === selectedCategory), [categories, selectedCategory]);
  const hasPoules = currentCategory?.hasPoules || false;
  const poules = currentCategory?.poules || [];

  // Calendar-based classification data fetching
  const { data: standingsData, error: standingsError, mutate: mutateStandings } = useSWR(
    selectedCategory ? ['calendar-classification', selectedCategory, selectedPoule, hasPoules] : null,
    async () => {
      if (!selectedCategory) return [];
      try {
        const apiCategoryName = getApiCategoryName(selectedCategory);
        const data = await getClassificationFromCalendar(apiCategoryName, hasPoules ? selectedPoule : undefined);
        return data;
      } catch (error) {
        console.error('Error fetching classification:', error);
        throw error;
      }
    },
    { 
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  );

  const sortedStandings = useMemo(() => {
    if (!selectedCategory || !currentCategory || !allTeams) return [];

    let categoryTeams = allTeams.filter(team => team.category === selectedCategory);

    if (hasPoules) {
      categoryTeams = categoryTeams.filter(team => team.poule === selectedPoule);
    }

    // Handle team statistics data structure (new system)
    if (standingsData && standingsData.length > 0 && standingsData[0].team) {
      // This is team statistics data
      return standingsData.map((standing: any, index: number) => ({
        _id: standing._id,
        team: { 
          _id: standing.team._id, 
          name: standing.team.name, 
          logo: standing.team.logo 
        },
        position: standing.position || index + 1,
        played: standing.played || 0,
        wins: standing.wins || 0,
        draws: standing.draws || 0,
        losses: standing.losses || 0,
        pointsFor: standing.pointsFor || 0,
        pointsAgainst: standing.pointsAgainst || 0,
        pointsDifference: standing.pointsDifference || 0,
        points: standing.points || 0,
        recentResults: standing.recentResults || [],
        category: selectedCategory
      }));
    }

    // Fallback to old API structure (shouldn't be used anymore)
    const defaultStandings: TeamStanding[] = categoryTeams.map(team => ({
      _id: team._id,
      team: { _id: team._id, name: team.name, logo: team.logo },
      position: 0, played: 0, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointsDifference: 0, points: 0, recentResults: [], category: team.category,
    }));

    const apiStandings = standingsData || [];
    const apiStandingsMap = new Map(apiStandings.map((s: TeamStanding) => [s.team.name, s]));

    const mergedStandings = defaultStandings.map(defaultStanding => {
      const apiStanding = apiStandingsMap.get(defaultStanding.team.name);
      return apiStanding ? { ...defaultStanding, ...apiStanding } : defaultStanding;
    });

    return mergedStandings
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.pointsDifference !== a.pointsDifference) return b.pointsDifference - a.pointsDifference;
        return b.pointsFor - a.pointsFor;
      })
      .map((team, index) => ({ ...team, position: index + 1 }));
  }, [selectedCategory, selectedPoule, allTeams, standingsData, currentCategory, hasPoules]);

  const isLoading = !categories || !allTeams || (selectedCategory && standingsData === undefined);
  const error = categoriesError || teamsError || standingsError;

  return (
    <section id="classification" className="py-12 sm:py-20 min-h-screen bg-[var(--color-background)]">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
            Classement de la <span className="text-[var(--color-primary)]">Ligue</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Classement actuel des équipes par catégorie
          </p>
        </motion.div>

        {/* Category Selection */}
        <div className="mb-8">
          <div className="md:hidden relative z-30">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center justify-between w-full px-6 py-3 glass rounded-xl text-white border border-white/10"
            >
              <span className="font-medium">{selectedCategory}</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full mt-2 glass rounded-xl overflow-hidden shadow-xl border border-white/10"
                >
                  {categories?.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.name)
                        setIsCategoryOpen(false)
                      }}
                      className={`w-full px-6 py-3 text-left transition-colors ${selectedCategory === cat.name
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-gray-300 hover:bg-white/10'
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex flex-wrap justify-center gap-3 mb-12">
            {categories?.map(cat => (
              <motion.button
                key={cat.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedCategory === cat.name
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/10'
                  }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Poule Selection */}
        <AnimatePresence>
          {hasPoules && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center mb-12"
            >
              <div className="inline-flex bg-black/20 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                {poules.map(poule => (
                  <button
                    key={poule}
                    onClick={() => setSelectedPoule(poule)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${selectedPoule === poule
                        ? 'bg-white/10 text-white shadow-sm border border-white/10'
                        : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    Poule {poule}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Selection Display */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-white">
            {selectedCategory}
            {hasPoules && (
              <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
            )}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              {error}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl overflow-x-auto"
          >
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-black/40">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Équipe
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    MJ
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    V
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    D
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    PTS+
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    PTS-
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Diff
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {sortedStandings.length > 0 ? (
                  sortedStandings.map((team, index) => (
                    <motion.tr
                      key={`${team.team.name}-${team.team._id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`hover:bg-white/5 transition-colors ${team.position <= 4 ? 'bg-[var(--color-primary)]/5' : ''
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {team.position === 1 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, damping: 10 }}
                              className="mr-2"
                            >
                              <FaTrophy className="text-yellow-500 w-5 h-5" />
                            </motion.div>
                          )}
                          <span className={`font-bold text-lg ${team.position === 1 ? 'text-yellow-400' :
                              team.position <= 4 ? 'text-[var(--color-primary)]' : 'text-gray-500'
                            }`}>
                            {team.position}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {team.team.logo && (
                            <div className="h-8 w-8 relative mr-3 bg-white/5 rounded-full p-1">
                              <img src={`/teams/${team.team.logo}`} alt="" className="object-contain w-full h-full" />
                            </div>
                          )}
                          <span className="text-sm font-bold text-white">{team.team.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300 font-medium">
                        {team.played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                        {team.wins}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                        {team.losses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-base font-bold text-[var(--color-primary)]">
                        {team.points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-400">
                        {team.pointsFor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-400">
                        {team.pointsAgainst}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-bold ${team.pointsDifference > 0 ? 'text-green-400' :
                          team.pointsDifference < 0 ? 'text-red-400' : 'text-gray-500'
                        }`}>
                        {team.pointsDifference > 0 ? '+' : ''}{team.pointsDifference}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      {hasPoules
                        ? `Aucune équipe trouvée pour ${selectedCategory} - Poule ${selectedPoule}`
                        : `Aucune équipe trouvée pour ${selectedCategory}`
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </section>
  )
}
