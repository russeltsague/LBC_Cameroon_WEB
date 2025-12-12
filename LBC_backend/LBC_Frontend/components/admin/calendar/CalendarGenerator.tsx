'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiCalendar, 
  FiDownload, 
  FiRefreshCw, 
  FiCheck, 
  FiAlertTriangle,
  FiEye,
  FiSave,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi'
import { getCategories, getTeams, Category, Team, getCalendars, createCalendar, updateCalendar, deleteCalendar, Calendar as CalendarType } from '@/app/lib/api'
import { generateCompleteCalendar, generateCompleteCalendarStructure, generateRoundRobin, Calendar } from '@/utils/calendarGenerator'
import { toast } from 'react-hot-toast'
import { useAppStore } from '@/lib/store'

export const CalendarGenerator = () => {
  const triggerClassificationRefresh = useAppStore((state) => state.triggerClassificationRefresh);
  const [categories, setCategories] = useState<Category[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
    const [previewMode, setPreviewMode] = useState(false)
  const [savedCalendars, setSavedCalendars] = useState<CalendarType[]>([])
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [modifiedCalendars, setModifiedCalendars] = useState<Map<string, Calendar>>(new Map())

  useEffect(() => {
    fetchData()
    fetchSavedCalendars()
  }, [])

  
  const fetchData = async () => {
    try {
      const [catsData, teamsData] = await Promise.all([
        getCategories(),
        getTeams()
      ])
      setCategories(catsData.filter(cat => cat.isActive !== false))
      const teamsArray = Array.isArray(teamsData) ? teamsData : []
      setTeams(teamsArray)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategorySelection = (categoryName: string) => {
    const newSelection = new Set(selectedCategories)
    if (newSelection.has(categoryName)) {
      newSelection.delete(categoryName)
    } else {
      newSelection.add(categoryName)
    }
    setSelectedCategories(newSelection)
  }

  const generateCalendars = async () => {
    if (selectedCategories.size === 0) {
      toast.error('Veuillez sélectionner au moins une catégorie')
      return
    }

    setGenerating(true)
    try {
      const selectedCategoriesData = Array.from(selectedCategories).map(catName => 
        categories.find(cat => cat.name === catName)
      ).filter(Boolean) as Category[]
      
      const newCalendars = generateCompleteCalendarStructure(selectedCategoriesData, teams)
      setCalendars(newCalendars)
      setModifiedCalendars(new Map())
      toast.success(`Structure de calendriers générée pour ${newCalendars.length} catégorie(s)`)
      setPreviewMode(true)
    } catch (error) {
      console.error('Error generating calendars:', error)
      toast.error('Erreur lors de la génération des calendriers')
    } finally {
      setGenerating(false)
    }
  }

  const updateGeneratedCalendar = (categoryName: string, updatedCalendar: Calendar) => {
    const newCalendars = calendars.map(cal => 
      cal.category === categoryName ? updatedCalendar : cal
    )
    setCalendars(newCalendars)
  }

  
  // Manual save function for generated calendars
  const saveGeneratedCalendars = async () => {
    if (calendars.length === 0) {
      toast.error('Aucun calendrier à sauvegarder')
      return
    }

    try {
      let savedCount = 0
      let updatedCount = 0

      for (const calendar of calendars) {
        const existingCalendar = savedCalendars.find(cal => cal.category === calendar.category)
        
        // Transform calendar data to match API interface
        const calendarData = {
          category: calendar.category,
          hasPoules: calendar.hasPoules,
          poules: calendar.poules?.map(poule => ({
            name: poule.name,
            teams: poule.teams || [],
            journées: poule.journées.map(journee => ({
              n: journee.n,
              matches: journee.matches.map(match => {
                return {
                  homeTeam: match.homeTeam || '',
                  awayTeam: match.awayTeam || '',
                  homeScore: match.homeScore,
                  awayScore: match.awayScore
                };
              }),
              exempt: journee.exempt || ''
            }))
          })) || [],
          playoffs: calendar.playoffs?.map(playoff => ({
            name: playoff.name,
            matches: playoff.matches.map(match => {
              return {
                homeTeam: match.homeTeam || '',
                awayTeam: match.awayTeam || '',
                homeScore: match.homeScore,
                awayScore: match.awayScore
              };
            })
          })) || []
        }
        
        // Debug: Log the data being sent
        console.log(`Calendar data for ${calendar.category}:`, JSON.stringify(calendarData, null, 2))
        
        if (existingCalendar) {
          // Update existing calendar
          await updateCalendar(existingCalendar._id!, calendarData)
          updatedCount++
        } else {
          // Create new calendar
          await createCalendar(calendarData)
          savedCount++
        }
      }

      await fetchSavedCalendars() // Refresh saved calendars
      
      // Trigger classification refresh to update team stats
      if (savedCount > 0 || updatedCount > 0) {
        triggerClassificationRefresh();
        console.log('Triggered classification refresh after calendar save');
      }
      
      if (savedCount > 0 && updatedCount > 0) {
        toast.success(`${savedCount} calendrier(s) créé(s), ${updatedCount} calendrier(s) mis à jour(s)`)
      } else if (savedCount > 0) {
        toast.success(`${savedCount} calendrier(s) créé(s) avec succès`)
      } else if (updatedCount > 0) {
        toast.success(`${updatedCount} calendrier(s) mis à jour(s) avec succès`)
      }
    } catch (error) {
      console.error('Error saving calendars:', error)
      toast.error('Erreur lors de la sauvegarde des calendriers')
    }
  }

  const approveCalendar = async (calendar: Calendar) => {
    try {
      const calendarData: Omit<CalendarType, '_id' | 'createdAt' | 'updatedAt'> = {
        category: calendar.category,
        hasPoules: calendar.hasPoules,
        poules: calendar.poules?.map(poule => ({
          name: poule.name,
          teams: poule.teams,
          journées: poule.journées.map(journee => ({
            n: journee.n,
            matches: journee.matches.map(match => ({
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              homeScore: match.homeScore,
              awayScore: match.awayScore
            })),
            exempt: journee.exempt
          }))
        })),
        playoffs: calendar.playoffs?.map(round => ({
          name: round.name,
          matches: round.matches.map(match => ({
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeScore: match.homeScore,
            awayScore: match.awayScore
          }))
        }))
      }
      
      await createCalendar(calendarData)
      toast.success(`Calendrier approuvé et sauvegardé pour ${calendar.category}`)
      
      // Remove from generated calendars after approval
      setCalendars(calendars.filter(cal => cal.category !== calendar.category))
      setModifiedCalendars(new Map(modifiedCalendars))
      fetchSavedCalendars()
    } catch (error) {
      console.error('Error approving calendar:', error)
      toast.error('Erreur lors de l\'approbation du calendrier')
    }
  }

  const saveCalendar = async (calendar: Calendar) => {
    try {
      const calendarData: Omit<CalendarType, '_id' | 'createdAt' | 'updatedAt'> = {
        category: calendar.category,
        hasPoules: calendar.hasPoules,
        poules: calendar.poules?.map(poule => ({
          name: poule.name,
          teams: poule.teams,
          journées: poule.journées.map(journee => ({
            n: journee.n,
            matches: journee.matches.map(match => ({
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              homeScore: match.homeScore,
              awayScore: match.awayScore
            })),
            exempt: journee.exempt
          }))
        })),
        playoffs: calendar.playoffs?.map(round => ({
          name: round.name,
          matches: round.matches.map(match => ({
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeScore: match.homeScore,
            awayScore: match.awayScore
          }))
        }))
      }
      
      const newCalendar = await createCalendar(calendarData)
      toast.success('Calendrier sauvegardé avec succès')
      fetchSavedCalendars()
    } catch (error) {
      console.error('Error saving calendar:', error)
      toast.error('Erreur lors de la sauvegarde du calendrier')
    }
  }

  const updateSavedCalendar = async (calendarId: string, updatedCalendar: Calendar) => {
    try {
      const calendarData: Partial<CalendarType> = {
        category: updatedCalendar.category,
        hasPoules: updatedCalendar.hasPoules,
        poules: updatedCalendar.poules?.map(poule => ({
          name: poule.name,
          teams: poule.teams,
          journées: poule.journées.map(journee => ({
            n: journee.n,
            matches: journee.matches.map(match => ({
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              homeScore: match.homeScore,
              awayScore: match.awayScore
            })),
            exempt: journee.exempt
          }))
        })),
        playoffs: updatedCalendar.playoffs?.map(round => ({
          name: round.name,
          matches: round.matches.map(match => ({
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeScore: match.homeScore,
            awayScore: match.awayScore
          }))
        }))
      }
      
      await updateCalendar(calendarId, calendarData)
      toast.success('Calendrier mis à jour avec succès')
      setEditMode(false)
      setEditingCalendar(null)
      fetchSavedCalendars()
    } catch (error) {
      console.error('Error updating calendar:', error)
      toast.error('Erreur lors de la mise à jour du calendrier')
    }
  }

  const deleteSavedCalendar = async (calendarId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce calendrier ?')) return
    
    try {
      await deleteCalendar(calendarId)
      toast.success('Calendrier supprimé avec succès')
      fetchSavedCalendars()
    } catch (error) {
      console.error('Error deleting calendar:', error)
      toast.error('Erreur lors de la suppression du calendrier')
    }
  }

  const fetchSavedCalendars = async () => {
    try {
      console.log('Fetching saved calendars in generator...');
      const calendars = await getCalendars()
      console.log('Saved calendars fetched in generator:', calendars);
      setSavedCalendars(calendars)
    } catch (error) {
      console.error('Error fetching saved calendars:', error)
    }
  }

  const exportCalendar = (calendar: Calendar) => {
    const dataStr = JSON.stringify(calendar, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `calendar-${calendar.category.toLowerCase().replace(/\s+/g, '-')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Calendrier exporté')
  }

  const getTeamCount = (categoryName: string) => {
    return teams.filter(team => 
      team.category === categoryName && team.isActive !== false
    ).length
  }

  const getCategoryStats = (category: Category) => {
    const categoryTeams = teams.filter(team => 
      team.category === category.name && team.isActive !== false
    )
    
    if (!category.hasPoules) {
      return {
        totalTeams: categoryTeams.length,
        poules: []
      }
    }

    const poules: Record<string, string[]> = {}
    categoryTeams.forEach(team => {
      const poule = team.poule || 'A'
      if (!poules[poule]) {
        poules[poule] = []
      }
      poules[poule].push(team.name)
    })

    return {
      totalTeams: categoryTeams.length,
      poules: Object.entries(poules).map(([name, teams]) => ({
        name,
        teams: teams.length
      }))
    }
  }

  const startEditingCalendar = (calendar: CalendarType) => {
    const convertedCalendar: Calendar = {
      category: calendar.category,
      hasPoules: calendar.hasPoules,
      poules: calendar.poules?.map(poule => ({
        name: poule.name,
        teams: poule.teams,
        journées: poule.journées.map(journee => ({
          n: journee.n,
          matches: journee.matches.map(match => ({
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeScore: match.homeScore,
            awayScore: match.awayScore
          })),
          exempt: journee.exempt
        }))
      })),
      playoffs: calendar.playoffs?.map(round => ({
        name: round.name,
        matches: round.matches.map(match => ({
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeScore: match.homeScore,
          awayScore: match.awayScore
        }))
      }))
    }
    
    setEditingCalendar(convertedCalendar)
    setEditMode(true)
  }

  const startEditingGeneratedCalendar = (calendar: Calendar) => {
    setEditingCalendar(calendar)
    setEditMode(true)
  }

  // Helper function to get available teams for a specific dropdown
  const getAvailableTeams = (calendar: Calendar, pouleIndex: number, journeeIndex: number, matchIndex: number, field: 'homeTeam' | 'awayTeam') => {
    const filteredTeams = teams.filter(t => 
      t.category === calendar.category && 
      (!calendar.hasPoules || t.poule === calendar.poules![pouleIndex].name.replace('POULE ', '').trim())
    );
    
    const journee = calendar.poules![pouleIndex].journées[journeeIndex];
    const currentMatch = journee.matches[matchIndex];
    const otherField = field === 'homeTeam' ? 'awayTeam' : 'homeTeam';
    const otherValue = currentMatch[otherField];
    
    // Filter out teams already used in this journée (except the current match's other team)
    const availableTeams = filteredTeams.filter(team => {
      // Allow the other team in current match to remain in options
      if (team.name === otherValue) return true;
      
      // Check if team is already used in other matches
      const isUsedInOtherMatches = journee.matches.some((match, idx) => {
        if (idx === matchIndex) return false; // Skip current match
        return match.homeTeam === team.name || match.awayTeam === team.name;
      });
      
      // Also exclude if team is exempt
      const isExempt = journee.exempt === team.name;
      
      return !isUsedInOtherMatches && !isExempt;
    });
    
    return availableTeams;
  }

  // Helper function to get available teams for exempt selection
  const getAvailableExemptTeams = (calendar: Calendar, pouleIndex: number, currentJourneeIndex: number) => {
    const filteredTeams = teams.filter(t => 
      t.category === calendar.category && 
      (!calendar.hasPoules || t.poule === calendar.poules![pouleIndex].name.replace('POULE ', '').trim())
    );
    
    // Get teams that are not already exempt in other journées
    const availableExemptTeams = filteredTeams.filter(team => {
      // Check if team is already exempt in another journée
      const isAlreadyExempt = calendar.poules![pouleIndex].journées.some((journee, idx) => {
        return idx !== currentJourneeIndex && journee.exempt === team.name;
      });
      
      return !isAlreadyExempt;
    });
    
    return availableExemptTeams;
  }

  // Helper function to parse score string
  const parseScore = (scoreString: string) => {
    if (!scoreString) return { homeScore: '', awayScore: '', isForfeit: false }
    
    // Check for forfeit patterns
    if (scoreString.toLowerCase().includes('forfait') || scoreString.toLowerCase().includes('f')) {
      // Remove the forfeit text and extract the score part
      const scorePart = scoreString.toLowerCase().replace('forfait', '').replace('f', '').replace('(', '').replace(')', '').trim()
      const parts = scorePart.split('-')
      return {
        homeScore: parts[0]?.trim() || '0',
        awayScore: parts[1]?.trim() || '0',
        isForfeit: true
      }
    }
    
    // Parse regular score (e.g., "85-78")
    const parts = scoreString.split('-')
    if (parts.length === 2) {
      return {
        homeScore: parts[0]?.trim() || '',
        awayScore: parts[1]?.trim() || '',
        isForfeit: false
      }
    }
    
    return { homeScore: '', awayScore: '', isForfeit: false }
  }

  // Helper function to format score string
  const formatScore = (homeScore: string, awayScore: string, isForfeit: boolean) => {
    if (!homeScore && !awayScore) return ''
    if (isForfeit) return `${homeScore || '0'}-${awayScore || '0'} (Forfait)`
    return `${homeScore}-${awayScore}`
  }

  // Helper function to get forfeit team from score
  const getForfeitTeam = (scoreString: string): 'home' | 'away' | null => {
    if (!scoreString) return null
    const { homeScore, awayScore, isForfeit } = parseScore(scoreString)
    if (!isForfeit) return null
    return parseInt(homeScore) === 0 ? 'home' : 'away'
  }

  // Helper function to get forfeit mode from score
  const getForfeitMode = (scoreString: string): boolean => {
    if (!scoreString) return false
    const { isForfeit } = parseScore(scoreString)
    return isForfeit
  }

  // Score input component
  const ScoreInput = ({ 
    match, 
    onUpdate, 
    calendar, 
    pouleIndex, 
    journeeIndex, 
    matchIndex 
  }: {
    match: any
    onUpdate: (field: string, value: string) => void
    calendar: Calendar
    pouleIndex: number
    journeeIndex: number
    matchIndex: number
  }) => {
    const homeScore = match.homeScore
    const awayScore = match.awayScore
    const isForfeit = false // Adjust forfeit logic as needed
    const forfeitTeam = ''
    const showForfeit = false
    
    // Local state to prevent re-rendering on every keystroke
    const [localHomeScore, setLocalHomeScore] = useState(homeScore?.toString() || '')
    const [localAwayScore, setLocalAwayScore] = useState(awayScore?.toString() || '')
    
    // Update local state when match score changes from parent
    useEffect(() => {
      setLocalHomeScore(homeScore?.toString() || '')
      setLocalAwayScore(awayScore?.toString() || '')
    }, [homeScore, awayScore])
    
    const handleScoreChange = (field: 'homeScore' | 'awayScore', value: string) => {
      // Handle number input - allow empty string or valid numbers
      let numValue = value
      if (value !== '') {
        // Remove any non-digit characters and ensure it's a valid number
        numValue = value.replace(/[^0-9]/g, '')
        // Limit to reasonable basketball scores (max 200)
        if (parseInt(numValue) > 200) {
          numValue = '200'
        }
      }
      
      // Update local state immediately
      if (field === 'homeScore') {
        setLocalHomeScore(numValue)
      } else {
        setLocalAwayScore(numValue)
      }
    }
    
    const handleScoreBlur = () => {
      // Update parent state with separate homeScore and awayScore fields
      onUpdate('homeScore', localHomeScore ? localHomeScore.toString() : '')
      onUpdate('awayScore', localAwayScore ? localAwayScore.toString() : '')
    }
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleScoreBlur()
      }
    }
    
    const toggleForfeit = () => {
      if (!showForfeit) {
        // Start forfeit mode - set scores to 0-20
        onUpdate('homeScore', '0')
        onUpdate('awayScore', '20')
      } else {
        // Cancel forfeit mode
        onUpdate('homeScore', '')
        onUpdate('awayScore', '')
      }
    }
    
    const handleForfeitTeamSelection = (team: 'home' | 'away') => {
      // Generate automatic forfeit score: 0-20 or 20-0
      if (team === 'home') {
        onUpdate('homeScore', '0')
        onUpdate('awayScore', '20')
      } else {
        onUpdate('homeScore', '20')
        onUpdate('awayScore', '0')
      }
    }
    
    const cancelForfeit = () => {
      onUpdate('homeScore', '')
      onUpdate('awayScore', '')
    }
    
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={localHomeScore}
          onChange={(e) => handleScoreChange('homeScore', e.target.value)}
          onBlur={handleScoreBlur}
          onKeyPress={handleKeyPress}
          className="w-16 bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm"
          placeholder="0"
          min="0"
          max="200"
        />
        <span className="text-gray-400 text-sm font-medium">-</span>
        <input
          type="number"
          value={localAwayScore}
          onChange={(e) => handleScoreChange('awayScore', e.target.value)}
          onBlur={handleScoreBlur}
          onKeyPress={handleKeyPress}
          className="w-16 bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm"
          placeholder="0"
          min="0"
          max="200"
        />
      </div>
    )
  }
  const getAllCategoryTeams = (calendar: Calendar, pouleIndex: number) => {
    return teams.filter(t => 
      t.category === calendar.category && 
      (!calendar.hasPoules || t.poule === calendar.poules![pouleIndex].name.replace('POULE ', '').trim())
    );
  }

  // Function to regenerate calendar with new exempt team assignment
  const regenerateCalendarWithNewExempt = (categoryName: string, pouleIndex: number, journeeIndex: number, newExemptTeam: string) => {
    const calendar = calendars.find(cal => cal.category === categoryName)
    if (!calendar) return
    
    // Get all teams for this poule
    const pouleTeams = getAllCategoryTeams(calendar, pouleIndex)
    const teamNames = pouleTeams.map(team => team.name)
    
    // Find the current exempt team in this journée
    const currentExempt = calendar.poules![pouleIndex].journées[journeeIndex].exempt
    
    // If no change, don't regenerate
    if (currentExempt === newExemptTeam) return
    
    // Create a new calendar structure with the modified exempt assignment
    const updatedCalendar = { ...calendar }
    
    // If we have an odd number of teams, we need to regenerate the entire round-robin
    // with the new exempt team positioned correctly
    if (teamNames.length % 2 === 1) {
      // Generate new round-robin schedule with all teams
      const newJournées = generateRoundRobin(teamNames)
      
      // Find the journée where the new exempt team should be placed
      // In the generated round-robin, each team will be exempt exactly once
      // We need to find which journée has this team as exempt and swap it with the current journée
      let targetJourneeIndex = -1
      let currentJourneeExempt = newJournées[journeeIndex].exempt
      
      // Find the journée where the new exempt team is currently assigned
      for (let i = 0; i < newJournées.length; i++) {
        if (newJournées[i].exempt === newExemptTeam) {
          targetJourneeIndex = i
          break
        }
      }
      
      // If we found the target journée, swap the exempt assignments
      if (targetJourneeIndex !== -1) {
        newJournées[journeeIndex].exempt = newExemptTeam
        newJournées[targetJourneeIndex].exempt = currentJourneeExempt
      } else {
        // If for some reason the team isn't found, just set it in the current journée
        newJournées[journeeIndex].exempt = newExemptTeam
      }
      
      // Replace the poule's journées with the new schedule
      updatedCalendar.poules![pouleIndex].journées = newJournées
    } else {
      // Even number of teams - just update the exempt status (shouldn't happen in proper tournament)
      updatedCalendar.poules![pouleIndex].journées[journeeIndex].exempt = newExemptTeam
    }
    
    updateGeneratedCalendar(categoryName, updatedCalendar)
  }

  // Function to regenerate calendar with new exempt team in edit mode
  const regenerateCalendarWithNewExemptInEdit = (pouleIndex: number, journeeIndex: number, newExemptTeam: string) => {
    if (!editingCalendar) return
    
    // Get all teams for this poule
    const pouleTeams = getAllCategoryTeams(editingCalendar, pouleIndex)
    const teamNames = pouleTeams.map(team => team.name)
    
    // Find the current exempt team in this journée
    const currentExempt = editingCalendar.poules![pouleIndex].journées[journeeIndex].exempt
    
    // If no change, don't regenerate
    if (currentExempt === newExemptTeam) return
    
    // Create a new calendar structure with the modified exempt assignment
    const updatedCalendar = { ...editingCalendar }
    
    // If we have an odd number of teams, we need to regenerate the entire round-robin
    // with the new exempt team positioned correctly
    if (teamNames.length % 2 === 1) {
      // Generate new round-robin schedule with all teams
      const newJournées = generateRoundRobin(teamNames)
      
      // Find the journée where the new exempt team should be placed
      // In the generated round-robin, each team will be exempt exactly once
      // We need to find which journée has this team as exempt and swap it with the current journée
      let targetJourneeIndex = -1
      let currentJourneeExempt = newJournées[journeeIndex].exempt
      
      // Find the journée where the new exempt team is currently assigned
      for (let i = 0; i < newJournées.length; i++) {
        if (newJournées[i].exempt === newExemptTeam) {
          targetJourneeIndex = i
          break
        }
      }
      
      // If we found the target journée, swap the exempt assignments
      if (targetJourneeIndex !== -1) {
        newJournées[journeeIndex].exempt = newExemptTeam
        newJournées[targetJourneeIndex].exempt = currentJourneeExempt
      } else {
        // If for some reason the team isn't found, just set it in the current journée
        newJournées[journeeIndex].exempt = newExemptTeam
      }
      
      // Replace the poule's journées with the new schedule
      updatedCalendar.poules![pouleIndex].journées = newJournées
    } else {
      // Even number of teams - just update the exempt status (shouldn't happen in proper tournament)
      updatedCalendar.poules![pouleIndex].journées[journeeIndex].exempt = newExemptTeam
    }
    
    setEditingCalendar(updatedCalendar)
  }

  // Function to update exempt team and adjust all journées
  const updateExemptTeam = (categoryName: string, pouleIndex: number, journeeIndex: number, newExemptTeam: string) => {
    const calendar = calendars.find(cal => cal.category === categoryName)
    if (!calendar) return
    
    const updatedCalendar = { ...calendar }
    const poule = updatedCalendar.poules![pouleIndex]
    const oldExemptTeam = poule.journées[journeeIndex].exempt
    
    // Update the exempt team for the current journée
    poule.journées[journeeIndex].exempt = newExemptTeam
    
    // If we're removing an exempt team (setting to empty), make sure they're not in any matches
    if (!newExemptTeam && oldExemptTeam) {
      // Remove the old exempt team from all matches in this journée
      poule.journées[journeeIndex].matches.forEach(match => {
        if (match.homeTeam === oldExemptTeam) match.homeTeam = ''
        if (match.awayTeam === oldExemptTeam) match.awayTeam = ''
      })
    }
    
    // If we're setting a new exempt team, remove them from any matches in this journée
    if (newExemptTeam) {
      poule.journées[journeeIndex].matches.forEach(match => {
        if (match.homeTeam === newExemptTeam) match.homeTeam = ''
        if (match.awayTeam === newExemptTeam) match.awayTeam = ''
      })
    }
    
    updateGeneratedCalendar(categoryName, updatedCalendar)
  }

  // Function to update exempt team in edit mode
  const updateExemptTeamInEdit = (pouleIndex: number, journeeIndex: number, newExemptTeam: string) => {
    if (!editingCalendar) return
    
    const updatedCalendar = { ...editingCalendar }
    const poule = updatedCalendar.poules![pouleIndex]
    const oldExemptTeam = poule.journées[journeeIndex].exempt
    
    // Update the exempt team for the current journée
    poule.journées[journeeIndex].exempt = newExemptTeam
    
    // If we're removing an exempt team (setting to empty), make sure they're not in any matches
    if (!newExemptTeam && oldExemptTeam) {
      // Remove the old exempt team from all matches in this journée
      poule.journées[journeeIndex].matches.forEach(match => {
        if (match.homeTeam === oldExemptTeam) match.homeTeam = ''
        if (match.awayTeam === oldExemptTeam) match.awayTeam = ''
      })
    }
    
    // If we're setting a new exempt team, remove them from any matches in this journée
    if (newExemptTeam) {
      poule.journées[journeeIndex].matches.forEach(match => {
        if (match.homeTeam === newExemptTeam) match.homeTeam = ''
        if (match.awayTeam === newExemptTeam) match.awayTeam = ''
      })
    }
    
    setEditingCalendar(updatedCalendar)
  }

  const updateMatchInCalendar = (pouleIndex: number, journeeIndex: number, matchIndex: number, field: 'homeTeam' | 'awayTeam' | 'homeScore' | 'awayScore', value: string) => {
    if (!editingCalendar) return
    
    const updatedCalendar = { ...editingCalendar }
    if (updatedCalendar.poules && updatedCalendar.poules[pouleIndex]) {
      const journee = updatedCalendar.poules[pouleIndex].journées[journeeIndex]
      const currentMatch = journee.matches[matchIndex]
      
      // Check for duplicate teams in the same journée
      if (field === 'homeTeam' || field === 'awayTeam') {
        const otherField = field === 'homeTeam' ? 'awayTeam' : 'homeTeam'
        const otherValue = currentMatch[otherField]
        
        // Prevent selecting the same team for both home and away
        if (value === otherValue) {
          toast.error('Une équipe ne peut pas jouer contre elle-même')
          return
        }
        
        // Check if this team is already used in another match in this journée
        const teamAlreadyUsed = journee.matches.some((match, idx) => {
          if (idx === matchIndex) return false // Skip current match
          return match.homeTeam === value || match.awayTeam === value
        })
        
        if (teamAlreadyUsed) {
          toast.error('Cette équipe est déjà utilisée dans cette journée')
          return
        }
        
        // Update exempt team logic - if a team is selected in a match, it shouldn't be exempt
        if (journee.exempt === value) {
          // Clear exempt if team is now playing
          updatedCalendar.poules[pouleIndex].journées[journeeIndex].exempt = ''
        }
      }
      
      // Use type-safe field assignment
      const match = updatedCalendar.poules[pouleIndex].journées[journeeIndex].matches[matchIndex]
      if (field === 'homeTeam') {
        match.homeTeam = value
      } else if (field === 'awayTeam') {
        match.awayTeam = value
      } else if (field === 'homeScore') {
        match.homeScore = value ? parseInt(value) : undefined
      } else if (field === 'awayScore') {
        match.awayScore = value ? parseInt(value) : undefined
      }
    }
    setEditingCalendar(updatedCalendar)
  }

  const updateMatchInGeneratedCalendar = (categoryName: string, pouleIndex: number, journeeIndex: number, matchIndex: number, field: 'homeTeam' | 'awayTeam' | 'homeScore' | 'awayScore', value: string) => {
    const calendar = calendars.find(cal => cal.category === categoryName)
    if (!calendar) return
    
    const updatedCalendar = { ...calendar }
    if (updatedCalendar.poules && updatedCalendar.poules[pouleIndex]) {
      const journee = updatedCalendar.poules[pouleIndex].journées[journeeIndex]
      const currentMatch = journee.matches[matchIndex]
      
      // Check for duplicate teams in the same journée
      if (field === 'homeTeam' || field === 'awayTeam') {
        const otherField = field === 'homeTeam' ? 'awayTeam' : 'homeTeam'
        const otherValue = currentMatch[otherField]
        
        // Prevent selecting the same team for both home and away
        if (value === otherValue) {
          toast.error('Une équipe ne peut pas jouer contre elle-même')
          return
        }
        
        // Check if this team is already used in another match in this journée
        const teamAlreadyUsed = journee.matches.some((match, idx) => {
          if (idx === matchIndex) return false // Skip current match
          return match.homeTeam === value || match.awayTeam === value
        })
        
        if (teamAlreadyUsed) {
          toast.error('Cette équipe est déjà utilisée dans cette journée')
          return
        }
        
        // Update exempt team logic - if a team is selected in a match, it shouldn't be exempt
        if (journee.exempt === value) {
          // Clear exempt if team is now playing
          updatedCalendar.poules[pouleIndex].journées[journeeIndex].exempt = ''
        }
      }
      
      // Use type-safe field assignment
      const match = updatedCalendar.poules[pouleIndex].journées[journeeIndex].matches[matchIndex]
      if (field === 'homeTeam') {
        match.homeTeam = value
      } else if (field === 'awayTeam') {
        match.awayTeam = value
      } else if (field === 'homeScore') {
        match.homeScore = value ? parseInt(value) : undefined
      } else if (field === 'awayScore') {
        match.awayScore = value ? parseInt(value) : undefined
      }
    }
    
    updateGeneratedCalendar(categoryName, updatedCalendar)
  }

  const updatePlayoffMatch = (categoryName: string, roundIndex: number, matchIndex: number, field: 'homeTeam' | 'awayTeam' | 'homeScore' | 'awayScore', value: string) => {
    const calendar = calendars.find(cal => cal.category === categoryName)
    if (!calendar) return
    
    const updatedCalendar = { ...calendar }
    if (updatedCalendar.playoffs && updatedCalendar.playoffs[roundIndex]) {
      // Use type-safe field assignment
      const match = updatedCalendar.playoffs[roundIndex].matches[matchIndex]
      if (field === 'homeTeam') {
        match.homeTeam = value
      } else if (field === 'awayTeam') {
        match.awayTeam = value
      } else if (field === 'homeScore') {
        match.homeScore = value ? parseInt(value) : undefined
      } else if (field === 'awayScore') {
        match.awayScore = value ? parseInt(value) : undefined
      }
    }
    
    updateGeneratedCalendar(categoryName, updatedCalendar)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-oswald tracking-wide uppercase">
            Générateur de Calendrier
          </h1>
          <p className="text-gray-400 font-outfit mt-1">
            Sélectionnez les catégories et générez les calendriers automatiquement
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={generateCalendars}
            disabled={generating || selectedCategories.size === 0}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <FiCalendar className="w-4 h-4" />
                <span>Générer ({selectedCategories.size})</span>
              </>
            )}
          </button>

          {calendars.length > 0 && (
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-white/5 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              <span>{previewMode ? 'Masquer' : 'Aperçu'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => {
          const stats = getCategoryStats(category)
          const isSelected = selectedCategories.has(category.name)
          
          return (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCategorySelection(category.name)}
              className={`glass rounded-xl p-6 border cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-red-500/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 transition-colors ${
                    isSelected ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {isSelected ? <FiCheckSquare className="w-5 h-5" /> : <FiSquare className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-400">
                      {stats.totalTeams} équipe{stats.totalTeams > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  category.isActive ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>

              {category.hasPoules && stats.poules.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium mb-2">Poules:</p>
                  {stats.poules.map(poule => (
                    <div key={poule.name} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Poule {poule.name}</span>
                      <span className="text-xs text-gray-500">{poule.teams} équipes</span>
                    </div>
                  ))}
                </div>
              )}

              {stats.totalTeams === 0 && (
                <div className="flex items-center text-amber-500 text-sm mt-2">
                  <FiAlertTriangle className="w-4 h-4 mr-2" />
                  Aucune équipe active
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Generated Calendars Preview */}
      <AnimatePresence>
        {previewMode && calendars.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Calendriers Générés - En Attente d'Approbation</h2>
              <button
                onClick={saveGeneratedCalendars}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Sauvegarder tous les calendriers
              </button>
            </div>
            
            {calendars.map((calendar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{calendar.category}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditingGeneratedCalendar(calendar)}
                        className="p-2 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Modifier"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportCalendar(calendar)}
                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Exporter"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => approveCalendar(calendar)}
                        className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                        title="Approuver et sauvegarder"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {calendar.poules?.map((poule, pouleIndex) => (
                    <div key={pouleIndex} className="mb-6 last:mb-0">
                      <h4 className="text-lg font-semibold text-white mb-3">{poule.name}</h4>
                      
                      <div className="space-y-4">
                        {poule.journées.map((journee, journeeIndex) => (
                          <div key={journeeIndex} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="text-md font-medium text-white">Journée {journee.n}</h5>
                              <div className="flex items-center gap-2">
                                <select
                                  value={journee.exempt || ''}
                                  onChange={(e) => updateExemptTeam(calendar.category, pouleIndex, journeeIndex, e.target.value)}
                                  className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm border border-amber-500/30 focus:border-amber-500/50 focus:outline-none"
                                >
                                  <option value="" className="bg-gray-900">Pas d'exempt</option>
                                  {getAllCategoryTeams(calendar, pouleIndex).map(team => (
                                    <option key={team._id} value={team.name} className="bg-gray-900">
                                      {team.name}
                                    </option>
                                  ))}
                                </select>
                                {journee.exempt && (
                                  <span className="text-sm bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">
                                    Exempt: {journee.exempt}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {journee.matches.map((match, matchIndex) => {
                                const homeTeams = getAvailableTeams(calendar, pouleIndex, journeeIndex, matchIndex, 'homeTeam');
                                const awayTeams = getAvailableTeams(calendar, pouleIndex, journeeIndex, matchIndex, 'awayTeam');
                                
                                return (
                                  <div key={matchIndex} className="flex items-center gap-3 bg-white/5 rounded p-2">
                                    <select
                                      value={match.homeTeam}
                                      onChange={(e) => updateMatchInGeneratedCalendar(calendar.category, pouleIndex, journeeIndex, matchIndex, 'homeTeam', e.target.value)}
                                      className="flex-1 bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-sm"
                                    >
                                      <option value="" className="bg-gray-900">Sélectionner équipe domicile</option>
                                      {homeTeams.map(team => (
                                        <option key={team._id} value={team.name} className="bg-gray-900">
                                          {team.name}
                                        </option>
                                      ))}
                                    </select>
                                    <span className="text-gray-400 text-sm font-medium">vs</span>
                                    <select
                                      value={match.awayTeam}
                                      onChange={(e) => updateMatchInGeneratedCalendar(calendar.category, pouleIndex, journeeIndex, matchIndex, 'awayTeam', e.target.value)}
                                      className="flex-1 bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-sm"
                                    >
                                      <option value="" className="bg-gray-900">Sélectionner équipe extérieur</option>
                                      {awayTeams.map(team => (
                                        <option key={team._id} value={team.name} className="bg-gray-900">
                                          {team.name}
                                        </option>
                                      ))}
                                    </select>
                                    <ScoreInput
                                      match={match}
                                      onUpdate={(field, value) => updateMatchInGeneratedCalendar(calendar.category, pouleIndex, journeeIndex, matchIndex, field as 'homeScore' | 'awayScore', value)}
                                      calendar={calendar}
                                      pouleIndex={pouleIndex}
                                      journeeIndex={journeeIndex}
                                      matchIndex={matchIndex}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {calendar.playoffs && calendar.playoffs.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-3">Phases Finales</h4>
                      <div className="space-y-3">
                        {calendar.playoffs.map((round, roundIndex) => (
                          <div key={roundIndex} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h5 className="text-md font-medium text-white mb-2">{round.name}</h5>
                            <div className="space-y-2">
                              {round.matches.map((match, matchIndex) => (
                                <div key={matchIndex} className="flex items-center gap-3 bg-white/5 rounded p-2">
                                  <select
                                    value={match.homeTeam}
                                    onChange={(e) => updatePlayoffMatch(calendar.category, roundIndex, matchIndex, 'homeTeam', e.target.value)}
                                    className="flex-1 bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-sm"
                                  >
                                    <option value="" className="bg-gray-900">Sélectionner équipe domicile</option>
                                    {teams.filter(t => t.category === calendar.category).map(team => (
                                      <option key={team._id} value={team.name} className="bg-gray-900">
                                        {team.name} {team.poule && `(Poule ${team.poule})`}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="text-gray-400 text-sm">vs</span>
                                  <select
                                    value={match.awayTeam}
                                    onChange={(e) => updatePlayoffMatch(calendar.category, roundIndex, matchIndex, 'awayTeam', e.target.value)}
                                    className="flex-1 bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-sm"
                                  >
                                    <option value="" className="bg-gray-900">Sélectionner équipe extérieur</option>
                                    {teams.filter(t => t.category === calendar.category).map(team => (
                                      <option key={team._id} value={team.name} className="bg-gray-900">
                                        {team.name} {team.poule && `(Poule ${team.poule})`}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    value={match.homeScore?.toString() || ''}
                                    onChange={(e) => updatePlayoffMatch(calendar.category, roundIndex, matchIndex, 'homeScore', e.target.value)}
                                    className="w-16 bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm"
                                    placeholder="H"
                                    min="0"
                                    max="200"
                                  />
                                  <span className="text-gray-400 text-sm">-</span>
                                  <input
                                    type="number"
                                    value={match.awayScore?.toString() || ''}
                                    onChange={(e) => updatePlayoffMatch(calendar.category, roundIndex, matchIndex, 'awayScore', e.target.value)}
                                    className="w-16 bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-center text-sm"
                                    placeholder="A"
                                    min="0"
                                    max="200"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Calendars Section */}
      {savedCalendars.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Calendriers Sauvegardés</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedCalendars.map((savedCalendar) => (
              <motion.div
                key={savedCalendar._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{savedCalendar.category}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditingCalendar(savedCalendar)}
                        className="p-2 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Modifier"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSavedCalendar(savedCalendar._id!)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {savedCalendar.poules?.map((poule, pouleIndex) => (
                      <div key={pouleIndex} className="space-y-2">
                        <h4 className="text-lg font-semibold text-white">{poule.name}</h4>
                        <div className="text-sm text-gray-400">
                          {poule.teams.length} équipes • {poule.journées.length} journées
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {poule.journées.slice(0, 2).map((journee, journeeIndex) => (
                            <div key={journeeIndex} className="bg-white/5 rounded p-2">
                              <div className="text-xs text-gray-500 mb-1">Journée {journee.n}</div>
                              <div className="space-y-1">
                                {journee.matches.slice(0, 2).map((match, matchIndex) => (
                                  <div key={matchIndex} className="text-xs text-gray-300">
                                    {match.homeTeam} vs {match.awayTeam}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Mode Modal */}
      <AnimatePresence>
        {editMode && editingCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl border border-white/10 max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Modifier le Calendrier - {editingCalendar.category}</h3>
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setEditingCalendar(null)
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {editingCalendar.poules?.map((poule, pouleIndex) => (
                  <div key={pouleIndex} className="mb-8 last:mb-0">
                    <h4 className="text-xl font-semibold text-white mb-4">{poule.name}</h4>
                    
                    <div className="space-y-6">
                      {poule.journées.map((journee, journeeIndex) => (
                        <div key={journeeIndex} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-medium text-white">Journée {journee.n}</h5>
                            <div className="flex items-center gap-2">
                              <select
                                value={journee.exempt || ''}
                                onChange={(e) => updateExemptTeamInEdit(pouleIndex, journeeIndex, e.target.value)}
                                className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm border border-amber-500/30 focus:border-amber-500/50 focus:outline-none"
                              >
                                <option value="" className="bg-gray-900">Pas d'exempt</option>
                                {getAllCategoryTeams(editingCalendar, pouleIndex).map(team => (
                                  <option key={team._id} value={team.name} className="bg-gray-900">
                                    {team.name}
                                  </option>
                                ))}
                              </select>
                              {journee.exempt && (
                                <span className="text-sm bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">
                                  Exempt: {journee.exempt}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {journee.matches.map((match, matchIndex) => {
                              const homeTeams = getAvailableTeams(editingCalendar, pouleIndex, journeeIndex, matchIndex, 'homeTeam');
                              const awayTeams = getAvailableTeams(editingCalendar, pouleIndex, journeeIndex, matchIndex, 'awayTeam');
                              
                              return (
                                <div key={matchIndex} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                                  <select
                                    value={match.homeTeam}
                                    onChange={(e) => updateMatchInCalendar(pouleIndex, journeeIndex, matchIndex, 'homeTeam', e.target.value)}
                                    className="flex-1 bg-white/10 text-white px-3 py-2 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none"
                                  >
                                    <option value="" className="bg-gray-900">Sélectionner équipe domicile</option>
                                    {homeTeams.map(team => (
                                      <option key={team._id} value={team.name} className="bg-gray-900">
                                        {team.name}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="text-gray-400 font-medium">vs</span>
                                  <select
                                    value={match.awayTeam}
                                    onChange={(e) => updateMatchInCalendar(pouleIndex, journeeIndex, matchIndex, 'awayTeam', e.target.value)}
                                    className="flex-1 bg-white/10 text-white px-3 py-2 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none"
                                  >
                                    <option value="" className="bg-gray-900">Sélectionner équipe extérieur</option>
                                    {awayTeams.map(team => (
                                      <option key={team._id} value={team.name} className="bg-gray-900">
                                        {team.name}
                                      </option>
                                    ))}
                                  </select>
                                  <ScoreInput
                                      match={match}
                                      onUpdate={(field, value) => updateMatchInCalendar(pouleIndex, journeeIndex, matchIndex, field as 'homeScore' | 'awayScore', value)}
                                      calendar={editingCalendar}
                                      pouleIndex={pouleIndex}
                                      journeeIndex={journeeIndex}
                                      matchIndex={matchIndex}
                                    />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-t border-white/5">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setEditingCalendar(null)
                    }}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                  {calendars.find(cal => cal.category === editingCalendar.category) ? (
                    <button
                      onClick={() => {
                        updateGeneratedCalendar(editingCalendar.category, editingCalendar)
                        setEditMode(false)
                        setEditingCalendar(null)
                        toast.success('Modifications sauvegardées')
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Sauvegarder les modifications
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const savedCalendar = savedCalendars.find(cal => cal.category === editingCalendar.category)
                        if (savedCalendar) {
                          updateSavedCalendar(savedCalendar._id!, editingCalendar)
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Sauvegarder les modifications
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {calendars.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8 border border-white/10 text-center"
        >
          <FiCalendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Prêt à générer vos calendriers ?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Sélectionnez les catégories avec les cases à cocher, puis cliquez sur "Générer" pour créer automatiquement 
            tous les matchs de la saison. Vous pourrez ensuite modifier les calendriers et les approuver pour les rendre visibles sur le site public.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="flex items-start space-x-3">
              <FiCheckSquare className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Sélection</p>
                <p className="text-gray-400 text-sm">Choisissez les catégories</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiCalendar className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Génération</p>
                <p className="text-gray-400 text-sm">Création automatique</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiEdit2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Modification</p>
                <p className="text-gray-400 text-sm">Ajustez les matchs</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Approbation</p>
                <p className="text-gray-400 text-sm">Visible sur le site</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
