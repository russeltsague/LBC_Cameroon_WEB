'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiTrash2 } from 'react-icons/fi'
import { getCalendars, deleteCalendar, updateCalendar, Calendar as CalendarType } from '@/app/lib/api'
import { toast } from 'react-hot-toast'

export const CalendarViewer = () => {
  const [calendars, setCalendars] = useState<CalendarType[]>([])
  const [loading, setLoading] = useState(true)
  const [editedMatches, setEditedMatches] = useState<Map<string, {homeScore: string, awayScore: string}>>(new Map())

  useEffect(() => {
    fetchCalendars()
  }, [])

  const fetchCalendars = async () => {
    try {
      console.log('Fetching calendars in admin viewer...');
      const data = await getCalendars()
      console.log('Calendars fetched in admin viewer:', data);
      setCalendars(data)
    } catch (error) {
      console.error('Error fetching calendars:', error)
      toast.error('Erreur lors du chargement des calendriers')
    } finally {
      setLoading(false)
    }
  }

  const updateMatchScore = async (calendarId: string, pouleIndex: number, journeeIndex: number, matchIndex: number, field: 'homeScore' | 'awayScore', value: string) => {
    try {
      const calendar = calendars.find(cal => cal._id === calendarId)
      if (!calendar) return

      const updatedCalendar = { ...calendar }
      const numValue = value ? parseInt(value) : undefined

      if (updatedCalendar.poules && updatedCalendar.poules[pouleIndex]) {
        updatedCalendar.poules[pouleIndex].journées[journeeIndex].matches[matchIndex][field] = numValue
      } else if (updatedCalendar.playoffs) {
        // Handle playoffs if needed
        const playoffRound = updatedCalendar.playoffs.find(round => 
          round.matches.some(match => match.homeTeam === updatedCalendar.poules?.[pouleIndex]?.journées?.[journeeIndex]?.matches?.[matchIndex]?.homeTeam)
        )
        if (playoffRound) {
          const matchIndexInPlayoff = playoffRound.matches.findIndex(match => 
            match.homeTeam === updatedCalendar.poules?.[pouleIndex]?.journées?.[journeeIndex]?.matches?.[matchIndex]?.homeTeam
          )
          if (matchIndexInPlayoff !== -1) {
            playoffRound.matches[matchIndexInPlayoff][field] = numValue
          }
        }
      }

      await updateCalendar(calendarId, updatedCalendar)
      setCalendars(calendars.map(cal => cal._id === calendarId ? updatedCalendar : cal))
      toast.success('Score mis à jour avec succès')
    } catch (error) {
      console.error('Error updating match score:', error)
      toast.error('Erreur lors de la mise à jour du score')
    }
  }

  const handleScoreChange = (calendarId: string, pouleIndex: number, journeeIndex: number, matchIndex: number, field: 'homeScore' | 'awayScore', value: string) => {
    const matchKey = `${calendarId}-${pouleIndex}-${journeeIndex}-${matchIndex}`
    const currentEdits = editedMatches.get(matchKey) || { homeScore: '', awayScore: '' }
    
    setEditedMatches(new Map(editedMatches).set(matchKey, {
      ...currentEdits,
      [field]: value
    }))
  }

  const saveMatchScore = async (calendarId: string, pouleIndex: number, journeeIndex: number, matchIndex: number) => {
    try {
      const matchKey = `${calendarId}-${pouleIndex}-${journeeIndex}-${matchIndex}`
      const edits = editedMatches.get(matchKey)
      
      if (!edits) return

      const calendar = calendars.find(cal => cal._id === calendarId)
      if (!calendar) return

      const updatedCalendar = { ...calendar }
      
      if (updatedCalendar.poules && updatedCalendar.poules[pouleIndex]) {
        updatedCalendar.poules[pouleIndex].journées[journeeIndex].matches[matchIndex].homeScore = edits.homeScore ? parseInt(edits.homeScore) : undefined
        updatedCalendar.poules[pouleIndex].journées[journeeIndex].matches[matchIndex].awayScore = edits.awayScore ? parseInt(edits.awayScore) : undefined
      }

      await updateCalendar(calendarId, updatedCalendar)
      setCalendars(calendars.map(cal => cal._id === calendarId ? updatedCalendar : cal))
      
      // Clear the edits for this match
      const newEdits = new Map(editedMatches)
      newEdits.delete(matchKey)
      setEditedMatches(newEdits)
      
      toast.success('Score sauvegardé avec succès')
    } catch (error) {
      console.error('Error saving match score:', error)
      toast.error('Erreur lors de la sauvegarde du score')
    }
  }

  const getMatchEditValue = (calendarId: string, pouleIndex: number, journeeIndex: number, matchIndex: number, field: 'homeScore' | 'awayScore') => {
    const matchKey = `${calendarId}-${pouleIndex}-${journeeIndex}-${matchIndex}`
    const edits = editedMatches.get(matchKey)
    
    if (edits) {
      return edits[field]
    }
    
    // Return original value if not edited
    const calendar = calendars.find(cal => cal._id === calendarId)
    if (calendar && calendar.poules && calendar.poules[pouleIndex]) {
      const match = calendar.poules[pouleIndex].journées[journeeIndex].matches[matchIndex]
      return match[field]?.toString() || ''
    }
    
    return ''
  }

  const deleteCalendarHandler = async (calendarId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce calendrier ?')) return
    
    try {
      await deleteCalendar(calendarId)
      setCalendars(calendars.filter(cal => cal._id !== calendarId))
      toast.success('Calendrier supprimé avec succès')
    } catch (error) {
      console.error('Error deleting calendar:', error)
      toast.error('Erreur lors de la suppression du calendrier')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
            Calendriers Créés
          </h1>
          <p className="text-gray-400 font-outfit mt-1">
            Consultez et gérez les calendriers existants par catégorie
          </p>
        </div>
      </div>

      {calendars.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun calendrier trouvé</h3>
          <p className="text-gray-400">
            Aucun calendrier n'a été créé. Utilisez le générateur pour créer des calendriers.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {calendars.map((calendar, index) => (
            <motion.div
              key={calendar._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl border border-white/10 overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{calendar.category}</h3>
                      <p className="text-sm text-gray-400">
                        {calendar.hasPoules ? `${calendar.poules?.length || 0} poules` : 'Format simple'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCalendarHandler(calendar._id!)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Supprimer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Content - Always Expanded */}
              <div className="p-6 space-y-4">
                {calendar.hasPoules && calendar.poules ? (
                  calendar.poules.map((poule, pouleIndex) => (
                    <div key={pouleIndex} className="border border-white/10 rounded-lg">
                      {/* Poule Header - Not Clickable */}
                      <div className="p-4 bg-white/5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold text-white">{poule.name}</h4>
                          <div className="text-sm text-gray-400">
                            {poule.teams?.length || 0} équipes • {poule.journées?.length || 0} journées
                          </div>
                        </div>
                      </div>

                      {/* Poule Content - Always Visible */}
                      <div className="p-4 space-y-3">
                        {poule.journées.map((journee, journeeIndex) => (
                          <div key={journeeIndex} className="border border-white/10 rounded-lg">
                            {/* Journée Header - Not Clickable */}
                            <div className="p-3 bg-white/5">
                              <div className="flex justify-between items-center">
                                <h5 className="text-md font-medium text-white">
                                  Journée {journee.n}
                                </h5>
                                {journee.exempt && (
                                  <span className="text-sm bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                                    Exempt: {journee.exempt}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Journée Content - Always Visible */}
                            <div className="p-3 space-y-2">
                              {journee.matches.map((match, matchIndex) => (
                                <div key={matchIndex} className="flex items-center justify-between bg-white/5 rounded p-3">
                                  <div className="flex items-center gap-4">
                                    <span className="text-white font-medium">
                                      {match.homeTeam || 'TBD'}
                                    </span>
                                    {match.homeScore !== undefined && match.awayScore !== undefined ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          value={getMatchEditValue(calendar._id!, pouleIndex, journeeIndex, matchIndex, 'homeScore')}
                                          onChange={(e) => handleScoreChange(calendar._id!, pouleIndex, journeeIndex, matchIndex, 'homeScore', e.target.value)}
                                          className="w-12 bg-white/10 text-amber-300 px-1 py-0.5 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm font-bold"
                                          min="0"
                                          max="200"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                          type="number"
                                          value={getMatchEditValue(calendar._id!, pouleIndex, journeeIndex, matchIndex, 'awayScore')}
                                          onChange={(e) => handleScoreChange(calendar._id!, pouleIndex, journeeIndex, matchIndex, 'awayScore', e.target.value)}
                                          className="w-12 bg-white/10 text-amber-300 px-1 py-0.5 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm font-bold"
                                          min="0"
                                          max="200"
                                        />
                                        <button
                                          onClick={() => saveMatchScore(calendar._id!, pouleIndex, journeeIndex, matchIndex)}
                                          className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 transition-colors text-xs font-medium"
                                        >
                                          Sauver
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          placeholder="0"
                                          value={getMatchEditValue(calendar._id!, pouleIndex, journeeIndex, matchIndex, 'homeScore')}
                                          onChange={(e) => handleScoreChange(calendar._id!, pouleIndex, journeeIndex, matchIndex, 'homeScore', e.target.value)}
                                          className="w-12 bg-white/10 text-gray-400 px-1 py-0.5 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm"
                                          min="0"
                                          max="200"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                          type="number"
                                          placeholder="0"
                                          value={getMatchEditValue(calendar._id!, pouleIndex, journeeIndex, matchIndex, 'awayScore')}
                                          onChange={(e) => handleScoreChange(calendar._id!, pouleIndex, journeeIndex, matchIndex, 'awayScore', e.target.value)}
                                          className="w-12 bg-white/10 text-gray-400 px-1 py-0.5 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm"
                                          min="0"
                                          max="200"
                                        />
                                        <button
                                          onClick={() => saveMatchScore(calendar._id!, pouleIndex, journeeIndex, matchIndex)}
                                          className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 transition-colors text-xs font-medium"
                                        >
                                          Sauver
                                        </button>
                                      </div>
                                    )}
                                    <span className="text-white font-medium">
                                      {match.awayTeam || 'TBD'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  /* Simple Format - Display matches directly */
                  <div className="space-y-3">
                    {calendar.poules && calendar.poules.length > 0 && calendar.poules[0].journées ? (
                      calendar.poules[0].journées.map((journee, journeeIndex) => (
                        <div key={journeeIndex} className="border border-white/10 rounded-lg">
                          {/* Journée Header - Not Clickable */}
                          <div className="p-3 bg-white/5">
                            <div className="flex justify-between items-center">
                              <h5 className="text-md font-medium text-white">
                                Journée {journee.n}
                              </h5>
                              {journee.exempt && (
                                <span className="text-sm bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                                  Exempt: {journee.exempt}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Journée Content - Always Visible */}
                          <div className="p-3 space-y-2">
                            {journee.matches.map((match, matchIndex) => (
                              <div key={matchIndex} className="flex items-center justify-between bg-white/5 rounded p-3">
                                <div className="flex items-center gap-4">
                                  <span className="text-white font-medium">
                                    {match.homeTeam || 'TBD'}
                                  </span>
                                  {match.homeScore !== undefined && match.awayScore !== undefined ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        value={getMatchEditValue(calendar._id!, 0, journeeIndex, matchIndex, 'homeScore')}
                                        onChange={(e) => handleScoreChange(calendar._id!, 0, journeeIndex, matchIndex, 'homeScore', e.target.value)}
                                        className="w-12 bg-white/10 text-amber-300 px-1 py-0.5 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm font-bold"
                                        min="0"
                                        max="200"
                                      />
                                      <span className="text-gray-400">-</span>
                                      <input
                                        type="number"
                                        value={getMatchEditValue(calendar._id!, 0, journeeIndex, matchIndex, 'awayScore')}
                                        onChange={(e) => handleScoreChange(calendar._id!, 0, journeeIndex, matchIndex, 'awayScore', e.target.value)}
                                        className="w-12 bg-white/10 text-amber-300 px-1 py-0.5 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm font-bold"
                                        min="0"
                                        max="200"
                                      />
                                      <button
                                        onClick={() => saveMatchScore(calendar._id!, 0, journeeIndex, matchIndex)}
                                        className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 transition-colors text-xs font-medium"
                                      >
                                        Sauver
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={getMatchEditValue(calendar._id!, 0, journeeIndex, matchIndex, 'homeScore')}
                                        onChange={(e) => handleScoreChange(calendar._id!, 0, journeeIndex, matchIndex, 'homeScore', e.target.value)}
                                        className="w-12 bg-white/10 text-gray-400 px-1 py-0.5 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm"
                                        min="0"
                                        max="200"
                                      />
                                      <span className="text-gray-400">-</span>
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={getMatchEditValue(calendar._id!, 0, journeeIndex, matchIndex, 'awayScore')}
                                        onChange={(e) => handleScoreChange(calendar._id!, 0, journeeIndex, matchIndex, 'awayScore', e.target.value)}
                                        className="w-12 bg-white/10 text-gray-400 px-1 py-0.5 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm"
                                        min="0"
                                        max="200"
                                      />
                                      <button
                                        onClick={() => saveMatchScore(calendar._id!, 0, journeeIndex, matchIndex)}
                                        className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-300 rounded border border-green-500/30 hover:bg-green-500/30 transition-colors text-xs font-medium"
                                      >
                                        Sauver
                                      </button>
                                    </div>
                                  )}
                                  <span className="text-white font-medium">
                                    {match.awayTeam || 'TBD'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <p>Aucun match programmé pour cette catégorie</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
