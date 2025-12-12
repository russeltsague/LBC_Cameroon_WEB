
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiX,
  FiSave,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiEye,
} from 'react-icons/fi';
import { getCalendars, getTeams, createMatch, getAllCategories, saveWeeklyScheduleAsMatches, createWeeklySchedule, getMatchesByDateRange, updateMatchStatus, getWeeklySchedulesList, updateWeeklyScheduleDetails, deleteWeeklyScheduleById, updateCalendarMatchScore } from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import { ManageMatchesTab, ScheduleDetailTab } from './ManageMatchesTabNew';



interface WeeklyMatch {
  id: string
  category: string
  time: string
  teams: string
  groupNumber: string
  terrain: string
  journey: string
  date: string
  venue: string
}

interface MatchTable {
  id: string
  date: string
  venue: string
  matches: WeeklyMatch[]
  isExpanded: boolean
}

export const WeeklyMatchForm = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [calendars, setCalendars] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')
  
  // Create tab states
  const [tables, setTables] = useState<MatchTable[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [teamSearchTerms, setTeamSearchTerms] = useState<Record<string, string>>({})
  const [showTeamSuggestions, setShowTeamSuggestions] = useState<Record<string, boolean>>({})
  // Modal context contains the category to display and the id of the match row being edited
  const [showCategoryModal, setShowCategoryModal] = useState<{ category: string; matchId: string } | null>(null)

  // Manage tab states
  const [weeklySchedules, setWeeklySchedules] = useState<any[]>([])
  const [schedulesLoading, setSchedulesLoading] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  
  // Match status management
  const [matchStatuses, setMatchStatuses] = useState<Record<string, string>>({})
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [scoreInputs, setScoreInputs] = useState<Record<string, { home: number; away: number }>>({})

  useEffect(() => {
    fetchData()
    generateAvailableDates()
    if (activeTab === 'manage') {
      fetchWeeklySchedules()
    }
  }, [activeTab])

  // Fetch weekly schedules for manage tab
  const fetchWeeklySchedules = async () => {
    setSchedulesLoading(true)
    try {
      const schedules = await getWeeklySchedulesList()
      setWeeklySchedules(schedules)
    } catch (error) {
      console.error('Error fetching weekly schedules:', error)
      toast.error('Erreur lors du chargement des programmes hebdomadaires')
    } finally {
      setSchedulesLoading(false)
    }
  }

  // Handle schedule selection
  const handleScheduleSelect = (schedule: any) => {
    setSelectedSchedule(schedule)
    setEditingSchedule(null)
    setViewMode('detail')
  }

  // Handle back to list
  const handleBackToList = () => {
    setSelectedSchedule(null)
    setEditingSchedule(null)
    setViewMode('list')
  }

  // Handle schedule edit
  const handleScheduleEdit = () => {
    if (selectedSchedule) {
      setEditingSchedule({ ...selectedSchedule })
    }
  }

  // Handle schedule save
  const handleScheduleSave = async () => {
    if (!editingSchedule) return
    
    try {
      const updatedSchedule = await updateWeeklyScheduleDetails(editingSchedule._id, editingSchedule)
      setSelectedSchedule(updatedSchedule)
      setEditingSchedule(null)
      
      // Update the schedules list
      setWeeklySchedules(prev => 
        prev.map(schedule => 
          schedule._id === updatedSchedule._id ? updatedSchedule : schedule
        )
      )
      
      toast.success('Programme mis à jour avec succès')
    } catch (error: any) {
      console.error('Error updating schedule:', error)
      
      // Handle specific duplicate match error
      if (error.message && error.message.includes('already scheduled in another date')) {
        let errorMessage = error.message;
        if (error.duplicateMatches && Array.isArray(error.duplicateMatches)) {
          errorMessage = `Les matchs suivants sont déjà programmés à une autre date: ${error.duplicateMatches.join(', ')}. Chaque match ne peut être programmé qu'une seule fois.`;
        }
        toast.error(errorMessage, {
          duration: 5000,
          style: {
            backgroundColor: '#dc2626',
            color: 'white',
          }
        });
      } else {
        toast.error('Erreur lors de la mise à jour du programme');
      }
    }
  }

  // Handle schedule delete
  const handleScheduleDelete = async (scheduleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) return
    
    try {
      await deleteWeeklyScheduleById(scheduleId)
      setWeeklySchedules(prev => prev.filter(schedule => schedule._id !== scheduleId))
      
      if (selectedSchedule?._id === scheduleId) {
        handleBackToList()
      }
      
      toast.success('Programme supprimé avec succès')
    } catch (error) {
      console.error('Error deleting schedule:', error)
      toast.error('Erreur lors de la suppression du programme')
    }
  }

  // Handle match update in editing schedule
  const handleScheduleMatchUpdate = (matchIndex: number, field: string, value: any) => {
    if (!editingSchedule) return
    
    setEditingSchedule((prev: any) => ({
      ...prev,
      matches: prev.matches.map((match: any, index: number) => 
        index === matchIndex ? { ...match, [field]: value } : match
      )
    }))
  }

  // Handle add match to editing schedule
  const handleAddMatchToSchedule = () => {
    if (!editingSchedule) return
    
    const newMatch = {
      _id: `temp-${Date.now()}`,
      category: '',
      teams: '',
      groupNumber: '',
      terrain: 'T1',
      journey: '1',
      homeTeam: '',
      awayTeam: '',
      time: '10:00'
    }
    
    setEditingSchedule((prev: any) => ({
      ...prev,
      matches: [...prev.matches, newMatch]
    }))
  }

  // Handle remove match from editing schedule
  const handleRemoveMatchFromSchedule = (matchIndex: number) => {
    if (!editingSchedule) return
    
    setEditingSchedule((prev: any) => ({
      ...prev,
      matches: prev.matches.filter((_: any, index: number) => index !== matchIndex)
    }))
  }

  // Handle match status update
  const handleMatchStatusUpdate = async (scheduleId: string, matchIndex: number, status: 'upcoming' | 'live' | 'completed' | 'forfeit') => {
    try {
      // Find the actual match ID if it exists
      const schedule = weeklySchedules.find(s => s._id === scheduleId)
      if (!schedule || !schedule.matches[matchIndex]) return
      
      const match = schedule.matches[matchIndex]
      let matchId = match.matchId // If match was saved as actual match
      
      let homeScore: number | undefined, awayScore: number | undefined
      
      if (status === 'completed') {
        const scores = scoreInputs[`${scheduleId}-${matchIndex}`]
        if (!scores || scores.home === undefined || scores.away === undefined) {
          toast.error('Veuillez entrer les scores pour marquer le match comme terminé')
          return
        }
        homeScore = scores.home
        awayScore = scores.away
      }
      
      // Update match status via API
      if (matchId) {
        const statusForUpdate = status === 'forfeit' ? 'completed' : status
        await updateMatchStatus(matchId, statusForUpdate, homeScore, awayScore)
      }
      
      // Also update the weekly schedule in the database with scores
      if (status === 'completed' && homeScore !== undefined && awayScore !== undefined) {
        try {
          // Update the weekly schedule with the new scores
          const updatedMatches = [...schedule.matches]
          updatedMatches[matchIndex] = {
            ...updatedMatches[matchIndex],
            status,
            homeScore,
            awayScore
          }
          
          await updateWeeklyScheduleDetails(scheduleId, {
            matches: updatedMatches
          })
          
          console.log('Weekly schedule updated in database with scores')
        } catch (scheduleError) {
          console.error('Error updating weekly schedule with scores:', scheduleError)
          // Continue with other updates even if this fails
        }
      }
      
      // Also update calendar match score if completed
      if (status === 'completed' && homeScore !== undefined && awayScore !== undefined) {
        try {
          // Extract team names from match data
          const teams = match.teams || `${match.homeTeam} vs ${match.awayTeam}`
          const teamParts = teams.split(' vs ')
          if (teamParts.length === 2) {
            await updateCalendarMatchScore(
              schedule.date,
              teamParts[0].trim(),
              teamParts[1].trim(),
              homeScore,
              awayScore,
              status
            )
            toast.success('Score mis à jour dans le calendrier')
          }
        } catch (calendarError) {
          console.error('Error updating calendar match score:', calendarError)
          // Don't show error to user as the main update succeeded
        }
      }
      
      // Update local state
      setMatchStatuses(prev => ({
        ...prev,
        [`${scheduleId}-${matchIndex}`]: status
      }))
      
      // Update schedule in local state
      setWeeklySchedules((prev: any[]) => 
        prev.map((schedule: any) => {
          if (schedule._id === scheduleId) {
            const updatedMatches = [...schedule.matches]
            updatedMatches[matchIndex] = {
              ...updatedMatches[matchIndex],
              status,
              ...(status === 'completed' && { homeScore, awayScore })
            }
            return { ...schedule, matches: updatedMatches }
          }
          return schedule
        })
      )
      
      // Update selected schedule if it's the current one
      if (selectedSchedule?._id === scheduleId) {
        setSelectedSchedule((prev: any) => {
          if (!prev) return prev
          const updatedMatches = [...prev.matches]
          updatedMatches[matchIndex] = {
            ...updatedMatches[matchIndex],
            status,
            ...(status === 'completed' && { homeScore, awayScore })
          }
          return { ...prev, matches: updatedMatches }
        })
      }
      
      toast.success(`Match marqué comme ${status === 'upcoming' ? 'à venir' : status === 'live' ? 'en direct' : 'terminé'}`)
      
      if (status === 'completed') {
        setEditingScore(null)
        // Clear score inputs for this match
        setScoreInputs((prev: Record<string, { home: number; away: number }>) => {
          const newInputs = { ...prev }
          delete newInputs[`${scheduleId}-${matchIndex}`]
          return newInputs
        })
      }
    } catch (error) {
      console.error('Error updating match status:', error)
      toast.error('Erreur lors de la mise à jour du statut du match')
    }
  }

  // Handle score input changes
  const handleScoreInputChange = (scheduleId: string, matchIndex: number, team: 'home' | 'away', value: string) => {
    const numValue = parseInt(value) || 0
    setScoreInputs(prev => ({
      ...prev,
      [`${scheduleId}-${matchIndex}`]: {
        ...prev[`${scheduleId}-${matchIndex}`],
        [team]: numValue
      }
    }))
  }

  // Toggle score editing mode
  const toggleScoreEdit = (scheduleId: string, matchIndex: number, currentHomeScore?: number, currentAwayScore?: number) => {
    const key = `${scheduleId}-${matchIndex}`
    
    if (editingScore === key) {
      setEditingScore(null)
    } else {
      setEditingScore(key)
      setScoreInputs(prev => ({
        ...prev,
        [key]: {
          home: currentHomeScore || 0,
          away: currentAwayScore || 0
        }
      }))
    }
  }

  // Get match status color
  const getMatchStatusColor = (status?: string) => {
    switch (status) {
      case 'live':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'forfeit':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  }

  // Get match status text
  const getMatchStatusText = (status?: string) => {
    switch (status) {
      case 'live':
        return 'En direct';
      case 'completed':
        return 'Terminé';
      case 'forfeit':
        return 'Forfait';
      default:
        return 'À venir';
    }
  }

  // Handle forfeit match
  const handleForfeitMatch = async (scheduleId: string, matchIndex: number, forfeitTeam: 'home' | 'away') => {
    try {
      const schedule = weeklySchedules.find(s => s._id === scheduleId)
      if (!schedule || !schedule.matches[matchIndex]) return
      
      const match = schedule.matches[matchIndex]
      const teams = match.teams || `${match.homeTeam} vs ${match.awayTeam}`
      const teamParts = teams.split(' vs ')
      
      if (teamParts.length !== 2) {
        toast.error('Impossible de déterminer les équipes')
        return
      }
      
      // Set forfeit scores (20-0 for winner, 0-20 for loser)
      let homeScore = 0, awayScore = 0
      if (forfeitTeam === 'home') {
        // Away team wins 20-0
        awayScore = 20
      } else {
        // Home team wins 20-0
        homeScore = 20
      }
      
      // Update the match as forfeit
      await handleMatchStatusUpdate(scheduleId, matchIndex, 'forfeit')
      
      // Update scores in the match
      const updatedMatches = [...schedule.matches]
      updatedMatches[matchIndex] = {
        ...updatedMatches[matchIndex],
        status: 'forfeit',
        homeScore,
        awayScore,
        forfeitTeam,
        forfeitWinner: forfeitTeam === 'home' ? teamParts[1].trim() : teamParts[0].trim()
      }
      
      // Update weekly schedule in database
      await updateWeeklyScheduleDetails(scheduleId, {
        matches: updatedMatches
      })
      
      // Update calendar
      try {
        await updateCalendarMatchScore(
          schedule.date,
          teamParts[0].trim(),
          teamParts[1].trim(),
          homeScore,
          awayScore,
          'forfeit'
        )
      } catch (calendarError) {
        console.error('Error updating calendar:', calendarError)
      }
      
      // Update local state
      setWeeklySchedules((prev: any[]) => 
        prev.map((s: any) => {
          if (s._id === scheduleId) {
            return { ...s, matches: updatedMatches }
          }
          return s
        })
      )
      
      if (selectedSchedule?._id === scheduleId) {
        setSelectedSchedule((prev: any) => {
          if (!prev) return prev
          return { ...prev, matches: updatedMatches }
        })
      }
      
      const winner = forfeitTeam === 'home' ? teamParts[1].trim() : teamParts[0].trim()
      toast.success(`Match déclaré en forfait - ${winner} vainqueur par forfait (20-0)`)
      
    } catch (error) {
      console.error('Error handling forfeit:', error)
      toast.error('Erreur lors de la déclaration du forfait')
    }
  }

  // Handle selection of a match from the category calendar
  const handleMatchSelect = (matchData: any) => {
    if (!showCategoryModal) return;
    const { matchId } = showCategoryModal;
    setTables(prev => prev.map(table => ({
      ...table,
      matches: table.matches.map(m =>
        m.id === matchId
          ? {
              ...m,
              category: matchData.category,
              teams: `${matchData.homeTeam} vs ${matchData.awayTeam}`,
              groupNumber: matchData.poule?.replace('POULE ', '') || '',
              journey: matchData.journee?.toString() || ''
            }
          : m
      )
    })));
    // close modal after selection
    setShowCategoryModal(null);
  }
/*

      for (const table of tables) {
        const emptyMatch = table.matches.find(m => !m.teams && !m.category)
        if (emptyMatch) {
          targetTable = table
          targetMatch = emptyMatch
          break
        }
      }

      // If no empty match found, create a new one in the first table
      if (!targetMatch && tables.length > 0) {
        targetTable = tables[0]
        const newMatch: WeeklyMatch = {
          id: `match-${Date.now()}`,
          category: selectedMatchForSchedule.category,
          time: '10:00',
          teams: `${selectedMatchForSchedule.homeTeam} vs ${selectedMatchForSchedule.awayTeam}`,
          groupNumber: selectedMatchForSchedule.poule?.replace('POULE ', '') || '',
          terrain: 'T1',
          journey: selectedMatchForSchedule.journee?.toString() || '',
          date: targetTable.date,
          venue: targetTable.venue
        }
        targetMatch = newMatch
        setTables(prev => prev.map(table =>
          table.id === targetTable!.id
            ? { ...table, matches: [...table.matches, newMatch] }
            : table
        ))
      } else if (targetMatch && targetTable) {
        // Update the existing empty match
        setTables(prev => prev.map(table =>
          table.id === targetTable!.id
            ? {
                ...table,
                matches: table.matches.map(m =>
                  m.id === targetMatch!.id
                    ? {
                        ...m,
                        category: selectedMatchForSchedule.category,
                        teams: `${selectedMatchForSchedule.homeTeam} vs ${selectedMatchForSchedule.awayTeam}`,
                        groupNumber: selectedMatchForSchedule.poule?.replace('POULE ', '') || '',
                        journey: selectedMatchForSchedule.journee?.toString() || ''
                      }
                    : m
                )
              }
            : table
        ))
      }

      
*/
  const fetchData = async () => {
    try {
      console.log('Fetching data...')
      const [categoriesData, calendarsData, teamsData] = await Promise.all([
        getAllCategories(),
        getCalendars(),
        getTeams()
      ])
      console.log('Categories data:', categoriesData)
      console.log('Categories length:', categoriesData?.length)
      console.log('Calendars data:', calendarsData)
      console.log('Teams data:', teamsData)
      setCategories(categoriesData || [])
      setCalendars(calendarsData || [])
      setTeams(Array.isArray(teamsData) ? teamsData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()

    // Generate next 12 weeks of Wed, Sat, Sun
    for (let week = 0; week < 12; week++) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() + (week * 7))

      // Find next Wednesday
      const wednesday = new Date(weekStart)
      wednesday.setDate(weekStart.getDate() + ((3 - weekStart.getDay() + 7) % 7))

      // Find next Saturday  
      const saturday = new Date(weekStart)
      saturday.setDate(weekStart.getDate() + ((6 - weekStart.getDay() + 7) % 7))

      // Find next Sunday
      const sunday = new Date(weekStart)
      sunday.setDate(weekStart.getDate() + ((0 - weekStart.getDay() + 7) % 7))

      dates.push(
        wednesday.toISOString().split('T')[0],
        saturday.toISOString().split('T')[0],
        sunday.toISOString().split('T')[0]
      )
    }

    setAvailableDates([...new Set(dates)].sort())
  }

  const getCalendarForCategory = (category: string) => {
    return calendars.find(cal => cal.category === category)
  }

  const getCalendarMatches = (category: string) => {
    const calendar = getCalendarForCategory(category)
    if (!calendar) return []

    const matches: any[] = []

    // Collect matches from poules
    if (calendar.poules) {
      calendar.poules.forEach((poule: any) => {
        poule.journées.forEach((journee: any) => {
          journee.matches.forEach((match: any) => {
            matches.push({
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              score: match.score,
              category: calendar.category,
              journee: journee.n,
              poule: poule.name,
              displayText: `${match.homeTeam} vs ${match.awayTeam}${poule.name ? ` (${poule.name})` : ''}${journee.n > 0 ? ` - J${journee.n}` : ''}`
            })
          })
        })
      })
    }

    // Add playoff matches if they exist
    if (calendar.playoffs) {
      calendar.playoffs.forEach((round: any) => {
        round.matches.forEach((match: any) => {
          matches.push({
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            score: match.score,
            category: calendar.category,
            journee: 0,
            poule: 'Playoff',
            displayText: `${match.homeTeam} vs ${match.awayTeam} (Playoff)`
          })
        })
      })
    }

    return matches
  }

  // Helper to check if a team is already playing on a specific date
  const isTeamPlayingOnDate = (teamName: string, date: string, currentMatchId: string) => {
    if (!date) return false

    for (const table of tables) {
      if (table.date === date) {
        for (const match of table.matches) {
          if (match.id === currentMatchId) continue // Skip current match being edited
          if (!match.teams) continue

          const parts = match.teams.split(' vs ')
          if (parts.length !== 2) continue

          const [home, away] = parts.map(t => t.trim())
          if (home === teamName || away === teamName) {
            return true
          }
        }
      }
    }
    return false
  }

  const getAvailableMatches = (category: string, date: string, currentMatchId: string) => {
    if (!category) return []

    const allMatches = getCalendarMatches(category)

    return allMatches.filter(match => {
      // 1. Filter out matches that are already played (have a score)
      // Check if score exists and is not just empty/placeholder
      const hasScore = match.score && match.score.trim() !== '' && match.score !== '-'
      if (hasScore) return false

      // 2. Filter out matches already selected in the current weekly schedule
      // We check if this specific match pairing is already in any table
      const isAlreadySelected = tables.some(table =>
        table.matches.some(m =>
          m.id !== currentMatchId && // Skip self
          m.teams === `${match.homeTeam} vs ${match.awayTeam}` // Exact match string match
        )
      )
      if (isAlreadySelected) return false

      // 3. Constraint: Check if either team is playing another match on this date
      if (date) {
        if (isTeamPlayingOnDate(match.homeTeam, date, currentMatchId)) return false
        if (isTeamPlayingOnDate(match.awayTeam, date, currentMatchId)) return false
      }

      return true
    })
  }

  const searchTeamMatches = (category: string, searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return []

    const matches = getCalendarMatches(category)
    const searchLower = searchTerm.toLowerCase()

    return matches.filter(match =>
      match.homeTeam.toLowerCase().includes(searchLower) ||
      match.awayTeam.toLowerCase().includes(searchLower)
    )
  }

  const addNewTable = () => {
    const newTable: MatchTable = {
      id: `table-${Date.now()}`,
      date: '',
      venue: '',
      matches: [],
      isExpanded: true
    }
    setTables(prev => [...prev, newTable])
  }

  const removeTable = (tableId: string) => {
    setTables(prev => prev.filter(table => table.id !== tableId))
  }

  const updateTable = (tableId: string, field: keyof MatchTable, value: any) => {
    setTables(prev => prev.map(table =>
      table.id === tableId ? { ...table, [field]: value } : table
    ))
  }

  const addNewMatch = (tableId: string) => {
    const newMatch: WeeklyMatch = {
      id: `match-${Date.now()}`,
      category: '',
      time: '10:00',
      teams: '',
      groupNumber: '',
      terrain: 'T1',
      journey: '',
      date: tables.find(t => t.id === tableId)?.date || '',
      venue: tables.find(t => t.id === tableId)?.venue || ''
    }

    setTables(prev => prev.map(table =>
      table.id === tableId
        ? { ...table, matches: [...table.matches, newMatch] }
        : table
    ))
  }

  const removeMatch = (tableId: string, matchId: string) => {
    setTables(prev => prev.map(table =>
      table.id === tableId
        ? { ...table, matches: table.matches.filter(match => match.id !== matchId) }
        : table
    ))

    // Clean up search terms for removed matches
    setTeamSearchTerms(prev => {
      const newTerms = { ...prev }
      delete newTerms[matchId]
      return newTerms
    })

    setShowTeamSuggestions(prev => {
      const newSuggestions = { ...prev }
      delete newSuggestions[matchId]
      return newSuggestions
    })
  }

  const updateMatch = (tableId: string, matchId: string, field: keyof WeeklyMatch, value: string) => {
    setTables(prev => prev.map(table =>
      table.id === tableId
        ? {
          ...table,
          matches: table.matches.map(match =>
            match.id === matchId ? { ...match, [field]: value } : match
          )
        }
        : table
    ))
  }

  const updateTeamSearch = (matchId: string, searchTerm: string) => {
    setTeamSearchTerms(prev => ({ ...prev, [matchId]: searchTerm }))
    setShowTeamSuggestions(prev => ({ ...prev, [matchId]: searchTerm.length >= 2 }))
  }

  const selectTeamMatch = (matchId: string, matchText: string) => {
    // Find the table that contains this match
    const containingTable = tables.find(t => t.matches.some(m => m.id === matchId))
    if (containingTable) {
      updateMatch(containingTable.id, matchId, 'teams', matchText)
    }
    setTeamSearchTerms(prev => ({ ...prev, [matchId]: '' }))
    setShowTeamSuggestions(prev => ({ ...prev, [matchId]: false }))
  }

  const toggleTableExpanded = (tableId: string) => {
    setTables(prev => prev.map(table =>
      table.id === tableId ? { ...table, isExpanded: !table.isExpanded } : table
    ))
  }

  const saveWeeklySchedule = async () => {
    if (tables.length === 0) {
      toast.error('Aucun tableau à sauvegarder')
      return
    }

    // Validate all tables have date and venue
    for (const table of tables) {
      if (!table.date || !table.venue) {
        toast.error('Veuillez remplir la date et le lieu pour tous les tableaux')
        return
      }

      for (const match of table.matches) {
        if (!match.category || !match.teams) {
          toast.error('Veuillez remplir la catégorie et les équipes pour tous les matchs')
          return
        }
      }
    }

    setSaving(true)
    try {
      // Convert tables to weekly schedule format and save
      for (const table of tables) {
        const weeklyScheduleData = {
          date: table.date,
          venue: table.venue,
          matches: table.matches.map(match => {
            const [homeTeam, awayTeam] = match.teams.split(' vs ').map(t => t.trim())
            return {
              category: match.category,
              teams: match.teams,
              groupNumber: match.groupNumber,
              terrain: match.terrain,
              journey: match.journey,
              homeTeam,
              awayTeam
            }
          }),
          isExpanded: false
        }

        // Create weekly schedule
        const createdSchedule = await createWeeklySchedule(weeklyScheduleData)
        
        // Convert weekly schedule to actual matches
        if (!createdSchedule._id) {
          throw new Error('Failed to create weekly schedule')
        }
        const result = await saveWeeklyScheduleAsMatches(createdSchedule._id)
        
        if (result.errorCount > 0) {
          console.error('Some matches failed to save:', result.errors)
          toast.error(`${result.createdCount} matchs créés, ${result.errorCount} erreurs`)
        } else {
          toast.success(`${result.createdCount} matchs programmés avec succès`)
        }
      }

      setTables([])
    } catch (error: any) {
      console.error('Error saving schedule:', error)
      
      // Handle specific duplicate match error
      if (error.message && error.message.includes('already scheduled in another date')) {
        // Try to extract duplicate matches from error
        let errorMessage = error.message;
        if (error.duplicateMatches && Array.isArray(error.duplicateMatches)) {
          errorMessage = `Les matchs suivants sont déjà programmés à une autre date: ${error.duplicateMatches.join(', ')}. Chaque match ne peut être programmé qu'une seule fois.`;
        }
        toast.error(errorMessage, {
          duration: 5000,
          style: {
            backgroundColor: '#dc2626',
            color: 'white',
          }
        });
      } else {
        toast.error('Erreur lors de la sauvegarde du programme');
      }
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).replace(/\b\w/g, l => l.toUpperCase())
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const isDateSelectable = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dayOfWeek = date.getDay()
    const dateString = date.toISOString().split('T')[0]

    // Only allow Wednesday (3), Saturday (6), Sunday (0)
    return [0, 3, 6].includes(dayOfWeek) && availableDates.includes(dateString)
  }

  const selectDate = (tableId: string, day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = date.toISOString().split('T')[0]
    updateTable(tableId, 'date', dateString)
    setShowDatePicker(null)
  }

  const changeMonth = (direction: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
            Programmation Hebdomadaire
          </h1>
          <p className="text-gray-400 font-outfit mt-1">
            Créez et gérez les programmes de matchs
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'create'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              Créer un programme
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'manage'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              Gérer les matchs
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' ? (
        <>
          {/* Create Tab Header */}
          <div className="flex justify-end">
            {tables.length > 0 && (
              <button
                onClick={saveWeeklySchedule}
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <FiSave className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tables */}
          <div className="space-y-6">
            {tables.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-8 border border-white/10 text-center"
              >
                <FiCalendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Aucun tableau créé
                </h3>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Cliquez sur "Ajouter un tableau" pour commencer à créer votre programme hebdomadaire
                </p>
                <button
                  onClick={addNewTable}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity mx-auto"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Ajouter un tableau</span>
                </button>
              </motion.div>
            ) : (
              tables.map((table, tableIndex) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tableIndex * 0.1 }}
                  className="glass rounded-xl border border-white/10 overflow-hidden"
                >
                  {/* Table Header */}
                  <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleTableExpanded(table.id)}
                          className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                          {table.isExpanded ? (
                            <FiChevronUp className="w-5 h-5" />
                          ) : (
                            <FiChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {formatDate(table.date) || 'Date non sélectionnée'}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-400">
                            <FiMapPin className="w-4 h-4" />
                            <span>{table.venue || 'Lieu non spécifié'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeTable(table.id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Supprimer le tableau"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Table Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                        <div
                          onClick={() => setShowDatePicker(showDatePicker === table.id ? null : table.id)}
                          className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          {formatDate(table.date) || 'Sélectionner une date'}
                        </div>

                        {/* Date Picker Calendar */}
                        <AnimatePresence>
                          {showDatePicker === table.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute top-full mt-2 z-50 glass rounded-xl border border-white/10 p-4 shadow-xl"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <button
                                  onClick={() => changeMonth(-1)}
                                  className="p-1 rounded hover:bg-white/10 transition-colors"
                                >
                                  <FiChevronUp className="w-4 h-4 rotate-270" />
                                </button>
                                <h4 className="text-white font-medium">
                                  {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                                </h4>
                                <button
                                  onClick={() => changeMonth(1)}
                                  className="p-1 rounded hover:bg-white/10 transition-colors"
                                >
                                  <FiChevronDown className="w-4 h-4 rotate-90" />
                                </button>
                              </div>

                              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                                  <div key={i} className="text-gray-400 font-medium p-1">{day}</div>
                                ))}
                              </div>

                              <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(currentMonth).map((day, i) => (
                                  <div key={i} className="aspect-square">
                                    {day && (
                                      <button
                                        onClick={() => selectDate(table.id, day)}
                                        disabled={!isDateSelectable(day)}
                                        className={`w-full h-full rounded text-xs transition-colors ${isDateSelectable(day)
                                            ? 'text-white hover:bg-blue-500/20 cursor-pointer'
                                            : 'text-gray-600 cursor-not-allowed'
                                          } ${table.date === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0]
                                            ? 'bg-blue-500/30'
                                            : ''
                                          }`}
                                      >
                                        {day}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Lieu</label>
                        <input
                          type="text"
                          value={table.venue}
                          onChange={(e) => updateTable(table.id, 'venue', e.target.value)}
                          placeholder="Entrez le lieu manuellement"
                          className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table Content */}
                  <AnimatePresence>
                    {table.isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          {table.matches.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>Aucun match dans ce tableau</p>
                              <button
                                onClick={() => addNewMatch(table.id)}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                              >
                                Ajouter un match
                              </button>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Catégorie</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Heure</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Équipes</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Groupe</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Terrain</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Journée</th>
                                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.matches.map((match, matchIndex) => (
                                    <tr key={match.id} className="border-b border-white/5 hover:bg-white/5">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <select
                                            value={match.category}
                                            onChange={(e) => {
                                              const newCat = e.target.value;
                                              updateMatch(table.id, match.id, 'category', newCat);
                                              if (newCat) {
                                                setShowCategoryModal({ category: newCat, matchId: match.id });
                                              }
                                            }}
                                            className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-blue-500/50 focus:outline-none text-sm font-medium hover:bg-white/15 transition-colors cursor-pointer"
                                          >
                                            <option value="" className="bg-gray-800">Sélectionner une catégorie</option>
                                            {categories && categories.length > 0 ? (
                                              categories.map(category => (
                                                <option key={category._id} value={category.name} className="bg-gray-800 text-white font-medium">
                                                  {category.name}
                                                </option>
                                              ))
                                            ) : (
                                              <option value="" disabled className="bg-gray-800 text-gray-400">Aucune catégorie disponible</option>
                                            )}
                                          </select>
                                          {match.category && (
                                            <button
                                              onClick={() => setShowCategoryModal({ category: match.category, matchId: match.id })}
                                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                              title="Voir les matchs disponibles"
                                            >
                                              <FiEye className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="time"
                                          value={match.time}
                                          onChange={(e) => updateMatch(table.id, match.id, 'time', e.target.value)}
                                          className="w-full bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-sm"
                                        />
                                      </td>
                                      <td className="py-3 px-4 relative">
                                        <select
                                          value={match.teams}
                                          onChange={(e) => {
                                            const selectedValue = e.target.value
                                            if (!selectedValue) return

                                            // Find the selected match object to auto-fill details
                                            const availableMatches = getAvailableMatches(match.category, table.date, match.id)
                                            const selectedMatch = availableMatches.find(m => `${m.homeTeam} vs ${m.awayTeam}` === selectedValue)

                                            if (selectedMatch) {
                                              // Update multiple fields at once
                                              setTables(prev => prev.map(t =>
                                                t.id === table.id
                                                  ? {
                                                      ...t,
                                                      matches: t.matches.map(m =>
                                                        m.id === match.id
                                                          ? {
                                                              ...m,
                                                              teams: selectedValue,
                                                              groupNumber: selectedMatch.poule?.replace('POULE ', '') || '',
                                                              journey: selectedMatch.journee?.toString() || ''
                                                            }
                                                          : m
                                                      )
                                                  }
                                                  : t
                                              ))
                                            } else {
                                              updateMatch(table.id, match.id, 'teams', selectedValue)
                                            }
                                          }}
                                          disabled={!match.category}
                                          className="w-full bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <option value="">Sélectionner un match</option>
                                          {match.category ? (
                                            getAvailableMatches(match.category, table.date, match.id).length > 0 ? (
                                              getAvailableMatches(match.category, table.date, match.id).map((availMatch, idx) => (
                                                <option key={idx} value={`${availMatch.homeTeam} vs ${availMatch.awayTeam}`}>
                                                  {availMatch.displayText}
                                                </option>
                                              ))
                                            ) : (
                                              <option value="" disabled>Aucun match disponible</option>
                                            )
                                          ) : (
                                            <option value="" disabled>Sélectionnez une catégorie d'abord</option>
                                          )}
                                          {/* Keep current value if it's not in available list (e.g. if it became invalid but was already selected) */}
                                          {match.teams && !getAvailableMatches(match.category, table.date, match.id).some(m => `${m.homeTeam} vs ${m.awayTeam}` === match.teams) && (
                                            <option value={match.teams}>
                                              {match.teams}
                                              {match.groupNumber ? ` (${match.groupNumber})` : ''}
                                              {match.journey ? ` - J${match.journey}` : ''}
                                            </option>
                                          )}
                                        </select>
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="text"
                                          value={match.groupNumber}
                                          onChange={(e) => updateMatch(table.id, match.id, 'groupNumber', e.target.value)}
                                          placeholder="A"
                                          className="w-full bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-sm"
                                        />
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="text"
                                          value={match.terrain}
                                          onChange={(e) => updateMatch(table.id, match.id, 'terrain', e.target.value)}
                                          placeholder="T1"
                                          className="w-full bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-sm"
                                        />
                                      </td>
                                      <td className="py-3 px-4">
                                        <input
                                          type="text"
                                          value={match.journey}
                                          onChange={(e) => updateMatch(table.id, match.id, 'journey', e.target.value)}
                                          placeholder="1"
                                          className="w-full bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-blue-500/50 focus:outline-none text-sm"
                                        />
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <button
                                          onClick={() => removeMatch(table.id, match.id)}
                                          className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                          <FiTrash2 className="w-3 h-3" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              {/* Add Row Button - Under the last row */}
                              <div className="mt-4 flex justify-center">
                                <button
                                  onClick={() => addNewMatch(table.id)}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center space-x-2"
                                >
                                  <FiPlus className="w-4 h-4" />
                                  <span>Ajouter une ligne</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Add Table Button - Under the table */}
                  <div className="p-4 border-t border-white/5">
                    <button
                      onClick={addNewTable}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Ajouter un nouveau tableau</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Manage Tab Content */
        viewMode === 'list' ? (
          <ManageMatchesTab
            schedules={weeklySchedules}
            loading={schedulesLoading}
            onScheduleSelect={handleScheduleSelect}
            onRefresh={fetchWeeklySchedules}
            onDeleteSchedule={handleScheduleDelete}
          />
        ) : (
          <ScheduleDetailTab
            schedule={selectedSchedule!}
            editingSchedule={editingSchedule}
            onBack={handleBackToList}
            onEdit={handleScheduleEdit}
            onSave={handleScheduleSave}
            onCancel={() => setEditingSchedule(null)}
            onMatchUpdate={handleScheduleMatchUpdate}
            onAddMatch={handleAddMatchToSchedule}
            onRemoveMatch={handleRemoveMatchFromSchedule}
            categories={categories}
            onMatchStatusUpdate={handleMatchStatusUpdate}
            onScoreInputChange={handleScoreInputChange}
            onToggleScoreEdit={toggleScoreEdit}
            editingScore={editingScore}
            scoreInputs={scoreInputs}
            getMatchStatusColor={getMatchStatusColor}
            getMatchStatusText={getMatchStatusText}
            onForfeitMatch={handleForfeitMatch}
          />
        )
      )}
      {/* Category Calendar Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCategoryModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="glass rounded-2xl border border-white/10 w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-oswald">
                      Calendrier - {showCategoryModal.category}
                    </h3>
                    <p className="text-gray-400 font-outfit mt-1">
                      Matchs non joués disponibles pour la programmation
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCategoryModal(null)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {(() => {
                  const availableMatches = getCalendarMatches(showCategoryModal.category).filter(match => {
                    const hasScore = match.score && match.score.trim() !== '' && match.score !== '-'
                    return !hasScore
                  })

                  if (availableMatches.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <FiCalendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-white mb-2">
                          Aucun match disponible
                        </h4>
                        <p className="text-gray-400">
                          Tous les matchs de cette catégorie ont déjà été joués ou programmés.
                        </p>
                      </div>
                    )
                  }

                  // Group matches by poule and journee
                  const groupedMatches: Record<string, Record<string, any[]>> = {}
                  availableMatches.forEach(match => {
                    const pouleKey = match.poule || 'Sans groupe'
                    if (!groupedMatches[pouleKey]) {
                      groupedMatches[pouleKey] = {}
                    }
                    const journeeKey = match.journee ? `Journée ${match.journee}` : 'Sans journée'
                    if (!groupedMatches[pouleKey][journeeKey]) {
                      groupedMatches[pouleKey][journeeKey] = []
                    }
                    groupedMatches[pouleKey][journeeKey].push(match)
                  })

                  return (
                    <div className="space-y-6">
                      {Object.entries(groupedMatches).map(([poule, journees]) => (
                        <div key={poule} className="glass rounded-xl border border-white/5 overflow-hidden">
                          <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-white/5">
                            <h4 className="text-lg font-bold text-white font-oswald">
                              {poule}
                            </h4>
                          </div>
                          <div className="divide-y divide-white/5">
                            {Object.entries(journees).map(([journee, matches]) => (
                              <div key={journee} className="p-4">
                                <h5 className="text-sm font-medium text-gray-400 mb-3">{journee}</h5>
                                <div className="grid gap-3">
                                  {matches.map((match, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                                      onClick={() => handleMatchSelect(match)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-orange-400">
                                              {match.homeTeam}
                                            </span>
                                            <span className="text-xs text-gray-500">VS</span>
                                            <span className="text-sm font-medium text-blue-400">
                                              {match.awayTeam}
                                            </span>
                                          </div>
                                          {match.score && (
                                            <div className="text-xs text-gray-400 text-center">
                                              Score: {match.score}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            Sélectionner
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}