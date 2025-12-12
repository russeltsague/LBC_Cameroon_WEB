'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiRefreshCw,
  FiEdit2,
  FiSave,
  FiX,
  FiPlay,
  FiCheck,
  FiClock,
  FiMapPin,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface ManageMatchesTabProps {
  matches: any[];
  loading: boolean;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  onStatusUpdate: (matchId: string, status: 'upcoming' | 'live' | 'completed') => void;
  onRefresh: () => void;
  editingMatch: string | null;
  scoreInputs: Record<string, { home: number; away: number }>;
  onScoreChange: (matchId: string, team: 'home' | 'away', value: string) => void;
  onToggleScoreEdit: (matchId: string, currentHomeScore?: number, currentAwayScore?: number) => void;
}

export const ManageMatchesTab: React.FC<ManageMatchesTabProps> = ({
  matches,
  loading,
  dateRange,
  setDateRange,
  onStatusUpdate,
  onRefresh,
  editingMatch,
  scoreInputs,
  onScoreChange,
  onToggleScoreEdit,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'En direct';
      case 'completed':
        return 'Terminé';
      default:
        return 'À venir';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Group matches by date
  const groupedMatches = matches.reduce((acc, match) => {
    const date = new Date(match.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedMatches).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date de début</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date de fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Matches */}
      {sortedDates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8 border border-white/10 text-center"
        >
          <FiCalendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Aucun match trouvé
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Aucun match programmé pour la période sélectionnée
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date, dateIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dateIndex * 0.1 }}
              className="glass rounded-xl border border-white/10 overflow-hidden"
            >
              {/* Date Header */}
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">
                    {formatDate(date)}
                  </h3>
                </div>
              </div>

              {/* Matches List */}
              <div className="divide-y divide-white/5">
                {groupedMatches[date].map((match: any, matchIndex: number) => (
                  <div
                    key={match._id}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Match Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-400">
                              {formatTime(match.time || '10:00')}
                            </div>
                            <div className="text-sm text-gray-400">
                              {match.category}
                            </div>
                            {match.terrain && (
                              <div className="text-sm text-gray-400">
                                Terrain: {match.terrain}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <FiMapPin className="w-4 h-4" />
                            <span className="text-sm">{match.venue}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-white font-medium">
                              {typeof match.homeTeam === 'object' ? match.homeTeam.name : match.homeTeam}
                            </span>
                            <div className="flex items-center gap-2">
                              {match.status === 'completed' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                                <>
                                  <span className="text-2xl font-bold text-white">{match.homeScore}</span>
                                  <span className="text-gray-400">-</span>
                                  <span className="text-2xl font-bold text-white">{match.awayScore}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">VS</span>
                              )}
                            </div>
                            <span className="text-white font-medium">
                              {typeof match.awayTeam === 'object' ? match.awayTeam.name : match.awayTeam}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(match.status)}`}>
                          {getStatusText(match.status)}
                        </div>

                        {/* Score Edit */}
                        {match.status !== 'completed' && (
                          <button
                            onClick={() => onToggleScoreEdit(match._id, match.homeScore, match.awayScore)}
                            className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Modifier le score"
                          >
                            {editingMatch === match._id ? <FiX className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
                          </button>
                        )}

                        {/* Status Actions */}
                        <div className="flex items-center gap-2">
                          {match.status !== 'live' && match.status !== 'completed' && (
                            <button
                              onClick={() => onStatusUpdate(match._id, 'live')}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Démarrer le match"
                            >
                              <FiPlay className="w-4 h-4" />
                            </button>
                          )}
                          
                          {match.status === 'live' && (
                            <button
                              onClick={() => onStatusUpdate(match._id, 'completed')}
                              className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                              title="Terminer le match"
                              disabled={editingMatch === match._id}
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          
                          {match.status === 'upcoming' && (
                            <button
                              onClick={() => onStatusUpdate(match._id, 'upcoming')}
                              className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Remettre à venir"
                            >
                              <FiClock className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score Input Section */}
                    {editingMatch === match._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-400">Score:</label>
                            <input
                              type="number"
                              min="0"
                              value={scoreInputs[match._id]?.home || 0}
                              onChange={(e) => onScoreChange(match._id, 'home', e.target.value)}
                              className="w-16 px-2 py-1 bg-white/10 text-white rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-center"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                              type="number"
                              min="0"
                              value={scoreInputs[match._id]?.away || 0}
                              onChange={(e) => onScoreChange(match._id, 'away', e.target.value)}
                              className="w-16 px-2 py-1 bg-white/10 text-white rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-center"
                            />
                          </div>
                          <button
                            onClick={() => onStatusUpdate(match._id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                          >
                            <FiSave className="w-3 h-3" />
                            <span>Enregistrer</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
