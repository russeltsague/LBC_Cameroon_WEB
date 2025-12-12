'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiRefreshCw,
  FiEdit2,
  FiSave,
  FiX,
  FiTrash2,
  FiArrowLeft,
  FiMapPin,
  FiPlus,
  FiEye,
  FiPlay,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface ManageMatchesTabProps {
  schedules: any[];
  loading: boolean;
  onScheduleSelect: (schedule: any) => void;
  onRefresh: () => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

export const ManageMatchesTab: React.FC<ManageMatchesTabProps> = ({
  schedules,
  loading,
  onScheduleSelect,
  onRefresh,
  onDeleteSchedule,
}) => {
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

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = new Date(schedule.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedDates = Object.keys(groupedSchedules).sort();

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Programmes Hebdomadaires</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Schedules */}
      {sortedDates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8 border border-white/10 text-center"
        >
          <FiCalendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Aucun programme trouvé
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Aucun programme hebdomadaire n'a été créé
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

              {/* Schedules List */}
              <div className="divide-y divide-white/5">
                {groupedSchedules[date].map((schedule: any, scheduleIndex: number) => (
                  <div
                    key={schedule._id}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Schedule Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2 text-gray-400">
                            <FiMapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">{schedule.venue}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {schedule.matches?.length || 0} match(s)
                          </div>
                        </div>
                        
                        {/* Match Preview */}
                        {schedule.matches && schedule.matches.length > 0 && (
                          <div className="space-y-1">
                            {schedule.matches.slice(0, 2).map((match: any, matchIdx: number) => (
                              <div key={matchIdx} className="text-sm text-gray-400">
                                {match.time && `${formatTime(match.time)} - `}
                                {match.category && `${match.category} - `}
                                {match.teams || `${match.homeTeam} vs ${match.awayTeam}`}
                              </div>
                            ))}
                            {schedule.matches.length > 2 && (
                              <div className="text-sm text-gray-500">
                                ... et {schedule.matches.length - 2} autre(s) match(s)
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onScheduleSelect(schedule)}
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Voir les détails"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSchedule(schedule._id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Supprimer le programme"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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

interface ScheduleDetailTabProps {
  schedule: any;
  editingSchedule: any | null;
  onBack: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onMatchUpdate: (matchIndex: number, field: string, value: any) => void;
  onAddMatch: () => void;
  onRemoveMatch: (matchIndex: number) => void;
  categories: any[];
  onMatchStatusUpdate: (scheduleId: string, matchIndex: number, status: 'upcoming' | 'live' | 'completed' | 'forfeit') => void;
  onScoreInputChange: (scheduleId: string, matchIndex: number, team: 'home' | 'away', value: string) => void;
  onToggleScoreEdit: (scheduleId: string, matchIndex: number, currentHomeScore?: number, currentAwayScore?: number) => void;
  editingScore: string | null;
  scoreInputs: Record<string, { home: number; away: number }>;
  getMatchStatusColor: (status?: string) => string;
  getMatchStatusText: (status?: string) => string;
  onForfeitMatch: (scheduleId: string, matchIndex: number, forfeitTeam: 'home' | 'away') => void;
}

export const ScheduleDetailTab: React.FC<ScheduleDetailTabProps> = ({
  schedule,
  editingSchedule,
  onBack,
  onEdit,
  onSave,
  onCancel,
  onMatchUpdate,
  onAddMatch,
  onRemoveMatch,
  categories,
  onMatchStatusUpdate,
  onScoreInputChange,
  onToggleScoreEdit,
  editingScore,
  scoreInputs,
  getMatchStatusColor,
  getMatchStatusText,
  onForfeitMatch,
}) => {
  const currentSchedule = editingSchedule || schedule;
  const isEditing = !!editingSchedule;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-gray-400 hover:bg-white/10 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {formatDate(currentSchedule.date)}
            </h2>
            <div className="flex items-center gap-2 text-gray-400">
              <FiMapPin className="w-4 h-4" />
              <span>{currentSchedule.venue}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <FiSave className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:bg-gray-600 transition-colors"
              >
                <FiX className="w-4 h-4" />
                <span>Annuler</span>
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:bg-blue-600 transition-colors"
            >
              <FiEdit2 className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          )}
        </div>
      </div>

      {/* Schedule Info */}
      {isEditing && (
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Lieu</label>
              <input
                type="text"
                value={currentSchedule.venue || ''}
                onChange={(e) => onMatchUpdate(-1, 'venue', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Matches */}
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Matchs</h3>
            {isEditing && (
              <button
                onClick={onAddMatch}
                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <FiPlus className="w-3 h-3" />
                <span>Ajouter un match</span>
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {currentSchedule.matches?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Aucun match dans ce programme</p>
              {isEditing && (
                <button
                  onClick={onAddMatch}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  Ajouter un match
                </button>
              )}
            </div>
          ) : (
            currentSchedule.matches.map((match: any, matchIndex: number) => {
              const scoreKey = `${schedule._id}-${matchIndex}`;
              const isEditingScore = editingScore === scoreKey;
              const currentStatus = match.status || 'upcoming';
              const scores = scoreInputs[scoreKey] || { home: match.homeScore || 0, away: match.awayScore || 0 };

              return (
                <div key={match._id} className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Match Details */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Catégorie</label>
                        {isEditing ? (
                          <select
                            value={match.category || ''}
                            onChange={(e) => onMatchUpdate(matchIndex, 'category', e.target.value)}
                            className="w-full px-2 py-1 bg-white/5 text-white rounded border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm"
                          >
                            <option value="">Sélectionner</option>
                            {categories.map((cat: any) => (
                              <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-white text-sm">{match.category || '-'}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Heure</label>
                        {isEditing ? (
                          <input
                            type="time"
                            value={match.time || '10:00'}
                            onChange={(e) => onMatchUpdate(matchIndex, 'time', e.target.value)}
                            className="w-full px-2 py-1 bg-white/5 text-white rounded border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm"
                          />
                        ) : (
                          <div className="text-white text-sm">{formatTime(match.time || '10:00')}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Équipes</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={match.teams || `${match.homeTeam || ''} vs ${match.awayTeam || ''}`}
                            onChange={(e) => onMatchUpdate(matchIndex, 'teams', e.target.value)}
                            className="w-full px-2 py-1 bg-white/5 text-white rounded border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm"
                          />
                        ) : (
                          <div className="text-white text-sm">{match.teams || `${match.homeTeam} vs ${match.awayTeam}`}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Groupe</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={match.groupNumber || ''}
                            onChange={(e) => onMatchUpdate(matchIndex, 'groupNumber', e.target.value)}
                            className="w-full px-2 py-1 bg-white/5 text-white rounded border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm"
                          />
                        ) : (
                          <div className="text-white text-sm">{match.groupNumber || '-'}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Terrain</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={match.terrain || ''}
                            onChange={(e) => onMatchUpdate(matchIndex, 'terrain', e.target.value)}
                            className="w-full px-2 py-1 bg-white/5 text-white rounded border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm"
                          />
                        ) : (
                          <div className="text-white text-sm">{match.terrain || '-'}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Journée</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={match.journey || ''}
                            onChange={(e) => onMatchUpdate(matchIndex, 'journey', e.target.value)}
                            className="w-full px-2 py-1 bg-white/5 text-white rounded border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm"
                          />
                        ) : (
                          <div className="text-white text-sm">{match.journey || '-'}</div>
                        )}
                      </div>
                    </div>

                    {/* Status and Score Management */}
                    <div className="flex flex-col gap-3 lg:w-64">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Statut:</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getMatchStatusColor(currentStatus)}`}>
                          {getMatchStatusText(currentStatus)}
                        </div>
                      </div>

                      {/* Score Display/Edit */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Score:</span>
                        {currentStatus === 'completed' || currentStatus === 'forfeit' || isEditingScore ? (
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-white">{scores.home}</span>
                            <span className="text-gray-400">-</span>
                            <span className="text-lg font-bold text-white">{scores.away}</span>
                            {currentStatus === 'forfeit' && (
                              <span className="ml-2 text-xs text-orange-400">(Forfait)</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-white">{match.homeScore || '-'}</span>
                            <span className="text-gray-400">-</span>
                            <span className="text-lg font-bold text-white">{match.awayScore || '-'}</span>
                            {match.status === 'forfeit' && (
                              <span className="ml-2 text-xs text-orange-400">(Forfait)</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Score Edit */}
                      {!isEditing && (
                        <button
                          onClick={() => onToggleScoreEdit(schedule._id, matchIndex, match.homeScore, match.awayScore)}
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Modifier le score"
                        >
                          {isEditingScore ? <FiX className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
                        </button>
                      )}

                      {/* Score Input */}
                      {isEditingScore && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="number"
                              min="0"
                              max="200"
                              value={scores.home}
                              onChange={(e) => onScoreInputChange(schedule._id, matchIndex, 'home', e.target.value)}
                              className="w-16 px-2 py-1 bg-white/10 text-white rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-center text-sm"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                              type="number"
                              min="0"
                              max="200"
                              value={scores.away}
                              onChange={(e) => onScoreInputChange(schedule._id, matchIndex, 'away', e.target.value)}
                              className="w-16 px-2 py-1 bg-white/10 text-white rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-center text-sm"
                            />
                          </div>
                          <button
                            onClick={() => onMatchStatusUpdate(schedule._id, matchIndex, 'completed')}
                            className="w-full px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiSave className="w-3 h-3" />
                            <span>Enregistrer</span>
                          </button>
                        </div>
                      )}

                      {/* Status Actions */}
                      <div className="flex flex-col gap-2">
                        {currentStatus !== 'live' && currentStatus !== 'completed' && (
                          <button
                            onClick={() => onMatchStatusUpdate(schedule._id, matchIndex, 'live')}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiPlay className="w-3 h-3" />
                            <span>En direct</span>
                          </button>
                        )}
                        
                        {currentStatus === 'live' && (
                          <button
                            onClick={() => onMatchStatusUpdate(schedule._id, matchIndex, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                            disabled={isEditingScore}
                          >
                            <FiSave className="w-3 h-3" />
                            <span>Terminer</span>
                          </button>
                        )}
                        
                        {currentStatus !== 'upcoming' && currentStatus !== 'live' && (
                          <button
                            onClick={() => onMatchStatusUpdate(schedule._id, matchIndex, 'upcoming')}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <FiArrowLeft className="w-3 h-3" />
                            <span>Remettre</span>
                          </button>
                        )}
                        
                        {/* Forfeit buttons */}
                        {currentStatus !== 'forfeit' && currentStatus !== 'completed' && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => onForfeitMatch(schedule._id, matchIndex, 'home')}
                              className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                            >
                              <span>Forfait Domicile</span>
                            </button>
                            <button
                              onClick={() => onForfeitMatch(schedule._id, matchIndex, 'away')}
                              className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                            >
                              <span>Forfait Extérieur</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => onRemoveMatch(matchIndex)}
                        className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
