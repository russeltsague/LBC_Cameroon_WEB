'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TeamCard } from '../card/TeamCard';
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Team, getCategories, Category } from '@/app/lib/api';

const FeaturedSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedPoule, setSelectedPoule] = useState<string>('A');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTeams, setAllTeams] = useState<{ team: Team, category: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ team: Team, category: string }[]>([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        const sortedCategories = [...categoriesData].sort((a, b) => {
          if (a.name === 'CORPORATES') return 1;
          if (b.name === 'CORPORATES') return -1;
          return 0;
        });
        setCategories(sortedCategories);

        if (sortedCategories.length > 0) {
          setActiveCategory(sortedCategories[0].name);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Restore last selected category
  useEffect(() => {
    const savedCategory = typeof window !== 'undefined' ? localStorage.getItem('featuredCategory') : null;
    const validSaved = categories.find(cat => cat.name === savedCategory);
    if (savedCategory && validSaved) {
      setActiveCategory(savedCategory);
    } else if (categories.length > 0) {
      setActiveCategory(categories[0].name);
    }
  }, [categories]);

  useEffect(() => {
    if (activeCategory) {
      localStorage.setItem('featuredCategory', activeCategory);
    }
  }, [activeCategory]);

  // Fetch all teams for search
  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`);
        if (!response.ok) throw new Error('Failed to fetch all teams');
        const data = await response.json();
        const teamsWithCategory = (data.data || []).map((team: Team) => ({
          team,
          category: team.category || 'Unknown'
        }));
        setAllTeams(teamsWithCategory);
      } catch (error) {
        console.error('Error fetching all teams:', error);
      }
    };

    fetchAllTeams();
  }, []);

  // Handle search
  const handleSearch = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return;

    if (searchQuery.trim() === '') {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const results = allTeams.filter(
      ({ team }) =>
        team.name.toLowerCase().includes(query) ||
        team.city?.toLowerCase().includes(query) ||
        team.category?.toLowerCase().includes(query)
    );
    setSearchResults(results);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        handleSearch();
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allTeams]);

  // Fetch teams by category
  useEffect(() => {
    const fetchTeamsByCategory = async () => {
      if (!activeCategory) return;

      setLoading(true);
      setError(null);

      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/teams?category=${encodeURIComponent(activeCategory)}`;

        const currentCategory = categories.find(cat => cat.name === activeCategory);
        if (currentCategory?.hasPoules) {
          url += `&poule=${selectedPoule}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch teams');
        const data = await response.json();
        setTeams(data.data || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setError('Failed to load teams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!isSearching) {
      fetchTeamsByCategory();
    }
  }, [activeCategory, selectedPoule, categories, isSearching]);

  useEffect(() => {
    setSelectedPoule('A');
  }, [activeCategory]);

  const currentCategory = categories.find(cat => cat.name === activeCategory);
  const hasPoules = currentCategory?.hasPoules || false;
  const poules = currentCategory?.poules || [];

  return (
    <section className="relative min-h-screen py-20 overflow-hidden bg-[var(--color-background)]">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/images/court-texture.png')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[var(--color-primary)] blur-[150px] opacity-10" />
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[var(--color-accent)] blur-[150px] opacity-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
            Équipes de la <span className="text-[var(--color-primary)]">Ligue</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Découvrez les talents et les clubs qui font vibrer le basketball camerounais
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative z-50">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une équipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-md rounded-2xl text-white border border-white/10 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all duration-300 placeholder-gray-500 shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearching && searchQuery.trim() !== '' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute w-full mt-2 glass rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                >
                  <div className="p-4 border-b border-white/5 bg-black/20">
                    <h3 className="text-sm font-medium text-gray-400">
                      {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}
                    </h3>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {searchResults.map(({ team, category }) => (
                        <div
                          key={team._id}
                          className="flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                          onClick={() => {
                            setActiveCategory(category);
                            setSearchQuery('');
                          }}
                        >
                          <div className="flex-shrink-0 h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center p-1 mr-3 border border-white/5 group-hover:border-[var(--color-primary)]/30 transition-colors">
                            {team.logo ? (
                              <img src={`/teams/${team.logo}`} alt={team.name} className="h-full w-full object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-gray-500">LBC</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">{team.name}</p>
                            <p className="text-xs text-gray-500">{category} {team.city && `• ${team.city}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Aucun résultat trouvé
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Category Selector */}
        <div className="mb-12">
          {/* Mobile Dropdown */}
          <div className="md:hidden flex justify-center relative z-40">
            <div className="relative w-full max-w-xs">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-full px-6 py-3 glass rounded-xl text-white border border-white/10 hover:border-[var(--color-primary)]/50 transition-all"
              >
                <span className="font-medium truncate">{activeCategory}</span>
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
                    {categories.map(category => (
                      <button
                        key={category.name}
                        onClick={() => {
                          setActiveCategory(category.name);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-6 py-3 text-left text-sm transition-colors ${activeCategory === category.name
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'text-gray-300 hover:bg-white/10'
                          }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <motion.button
                key={category.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(category.name)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeCategory === category.name
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/10'
                  }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Poule Selection */}
        <AnimatePresence mode="wait">
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

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading && !isSearching ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                {error}
              </div>
            </div>
          ) : (
            <>
              {isSearching ? (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-8 flex items-center">
                    <MagnifyingGlassIcon className="h-6 w-6 mr-2 text-[var(--color-primary)]" />
                    Résultats de recherche
                  </h3>
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {searchResults.map(({ team, category }) => (
                        <motion.div
                          key={team._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative"
                        >
                          <TeamCard
                            id={team._id}
                            name={team.name}
                            city={team.city}
                            logo={team.logo}
                            category={category}
                            founded={team.founded || 2024}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-500">
                      Aucune équipe trouvée
                    </div>
                  )}
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                >
                  {teams.map((team) => (
                    <motion.div
                      key={team._id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      <TeamCard
                        id={team._id}
                        name={team.name}
                        city={team.city}
                        logo={team.logo}
                        category={team.category}
                        founded={team.founded || 2024}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {teams.length === 0 && !loading && !error && !isSearching && (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">
                    Aucune équipe dans cette catégorie pour le moment.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
