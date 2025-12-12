'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiSave, 
  FiRefreshCw,
  FiCheck,
  FiAlertTriangle,
  FiTrash2,
  FiPlus
} from 'react-icons/fi'
import { getCalendars, Calendar as CalendarType, createMatch, getVenues, Venue } from '@/app/lib/api'
import { Calendar } from '@/utils/calendarGenerator'
import { toast } from 'react-hot-toast'

interface ScheduledMatch {
  date: string
  time: string
  homeTeam: string
  awayTeam: string
  category: string
  venue: string
  journee: number
  poule?: string
  terrain?: string
}

interface ScheduleDay {
  date: string
  matches: ScheduledMatch[]
}

export const MatchScheduler = () => {
  const [savedCalendars, setSavedCalendars] = useState<CalendarType[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduling, setScheduling] = useState(false)
  const [selectedCalendar, setSelectedCalendar] = useState<string>('')
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [matchInterval, setMatchInterval] = useState<number>(90) // minutes between matches
  const [dailyStartTime, setDailyStartTime] = useState<string>('09:00')
  const [dailyEndTime, setDailyEndTime] = useState<string>('18:00')
  const [venuesPerDay, setVenuesPerDay] = useState<number>(2)
  const [scheduledMatches, setScheduledMatches] = useState<ScheduledMatch[]>([])
  const [editingMatch, setEditingMatch] = useState<ScheduledMatch | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [calendarsData, venuesData] = await Promise.all([
        getCalendars(),
        getVenues()
      ])
      setSavedCalendars(calendarsData)
      setVenues(venuesData)
      
      // Set default start date to next Saturday
      const nextSaturday = new Date()
      nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7))
      setStartDate(nextSaturday.toISOString().split('T')[0])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const generateSchedule = async () => {
    if (!selectedCalendar || !startDate) {
      toast.error('Veuillez sélectionner un calendrier et une date de début')
      return
    }

    const calendar = savedCalendars.find(cal => cal._id === selectedCalendar)
    if (!calendar) {
      toast.error('Calendrier non trouvé')
      return
    }

    setScheduling(true)
    try {
      const schedule = await generateMatchSchedule(calendar, startDate)
      setScheduleDays(schedule)
      toast.success(`Programme généré avec ${schedule.reduce((acc, day) => acc + day.matches.length, 0)} matchs`)
    } catch (error) {
      console.error('Error generating schedule:', error)
      toast.error('Erreur lors de la génération du programme')
    } finally {
      setScheduling(false)
    }
  }

  const generateMatchSchedule = async (calendar: CalendarType, startDateStr: string): Promise<ScheduleDay[]> => {
    const schedule: ScheduleDay[] = []
    const startDate = new Date(startDateStr)
    const allMatches: ScheduledMatch[] = []

    // Collect all matches from calendar
    if (calendar.poules) {
      calendar.poules.forEach((poule, pouleIndex) => {
        poule.journées.forEach((journee, journeeIndex) => {
          journee.matches.forEach((match, matchIndex) => {
            allMatches.push({
              date: '',
              time: '',
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              category: calendar.category,
              venue: '',
              journee: journee.n,
              poule: poule.name,
              terrain: ''
            })
          })
        })
      })
    }

    // Add playoff matches if they exist
    if (calendar.playoffs) {
      calendar.playoffs.forEach((round) => {
        round.matches.forEach((match, matchIndex) => {
          allMatches.push({
            date: '',
            time: '',
            homeTeam: match.homeTeam,
            awayTeam: (match as any).awayTeam || 'TBD', // Handle missing awayTeam in playoff matches
            category: calendar.category,
            venue: '',
            journee: 0, // Playoffs don't have journee numbers
            terrain: ''
          })
        })
      })
    }

    // Schedule matches respecting constraints
    const scheduledMatches = await scheduleMatchesWithConstraints(
      allMatches, 
      startDate, 
      venues.slice(0, venuesPerDay)
    )

    // Group by date
    const groupedByDate = scheduledMatches.reduce((acc: { [date: string]: ScheduledMatch[] }, match) => {
      if (!acc[match.date]) {
        acc[match.date] = []
      }
      acc[match.date].push(match)
      return acc
    }, {})

    // Convert to ScheduleDay format
    Object.keys(groupedByDate).sort().forEach(date => {
      schedule.push({
        date,
        matches: groupedByDate[date].sort((a, b) => a.time.localeCompare(b.time))
      })
    })

    return schedule
  }

  const scheduleMatchesWithConstraints = async (
    matches: ScheduledMatch[], 
    startDate: Date, 
    availableVenues: Venue[]
  ): Promise<ScheduledMatch[]> => {
    const scheduled: ScheduledMatch[] = []
    const currentDate = new Date(startDate)
    let venueIndex = 0

    // Group matches by category to avoid conflicts
    const matchesByCategory = matches.reduce((acc: { [category: string]: ScheduledMatch[] }, match) => {
      if (!acc[match.category]) {
        acc[match.category] = []
      }
      acc[match.category].push(match)
      return acc
    }, {})

    // Schedule each category separately
    for (const category of Object.keys(matchesByCategory)) {
      const categoryMatches = matchesByCategory[category]
      let matchDate = new Date(currentDate)
      let currentTime = dailyStartTime

      for (const match of categoryMatches) {
        let isScheduled = false
        let attempts = 0
        const maxAttempts = 30 // Try for 30 days max

        while (!isScheduled && attempts < maxAttempts) {
          // Find available venue and time slot
          const venue = availableVenues[venueIndex % availableVenues.length]
          
          // Check if team is already scheduled for this day
          const teamConflict = scheduled.some(scheduledMatch => 
            scheduledMatch.date === matchDate.toISOString().split('T')[0] &&
            scheduledMatch.category === category &&
            (scheduledMatch.homeTeam === match.homeTeam || 
             scheduledMatch.awayTeam === match.homeTeam ||
             scheduledMatch.homeTeam === match.awayTeam || 
             scheduledMatch.awayTeam === match.awayTeam)
          )

          if (!teamConflict && currentTime <= dailyEndTime) {
            // Schedule the match
            const scheduledMatch: ScheduledMatch = {
              ...match,
              date: matchDate.toISOString().split('T')[0],
              time: currentTime,
              venue: venue.name,
              terrain: `T${(venueIndex % availableVenues.length) + 1}`
            }
            
            scheduled.push(scheduledMatch)
            isScheduled = true

            // Increment time for next match
            const [hours, minutes] = currentTime.split(':').map(Number)
            const totalMinutes = hours * 60 + minutes + matchInterval
            const newHours = Math.floor(totalMinutes / 60)
            const newMinutes = totalMinutes % 60
            currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`

            // Move to next venue for next match
            venueIndex++

            // If we've used all venues for today, move to next day
            if (venueIndex >= availableVenues.length || currentTime > dailyEndTime) {
              matchDate.setDate(matchDate.getDate() + 1)
              // Skip Sundays
              if (matchDate.getDay() === 0) {
                matchDate.setDate(matchDate.getDate() + 1)
              }
              currentTime = dailyStartTime
              venueIndex = 0
            }
          } else {
            // Move to next day
            matchDate.setDate(matchDate.getDate() + 1)
            // Skip Sundays
            if (matchDate.getDay() === 0) {
              matchDate.setDate(matchDate.getDate() + 1)
            }
            currentTime = dailyStartTime
            venueIndex = 0
          }

          attempts++
        }

        if (!scheduled) {
          console.warn(`Could not schedule match: ${match.homeTeam} vs ${match.awayTeam}`)
        }
      }
    }

    return scheduled
  }

  const saveSchedule = async () => {
    if (scheduleDays.length === 0) {
      toast.error('Aucun programme à sauvegarder')
      return
    }

    try {
      const allMatches = scheduleDays.flatMap(day => day.matches)
      
      // Create matches in database
      for (const match of allMatches) {
        await createMatch({
          date: match.date,
          time: match.time,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          category: match.category,
          venue: match.venue,
          status: 'upcoming' as const,
          journee: match.journee,
          terrain: match.terrain,
          poule: match.poule
        })
      }

      toast.success(`${allMatches.length} matchs programmés avec succès`)
      setScheduleDays([])
      setScheduledMatches([])
    } catch (error) {
      console.error('Error saving schedule:', error)
      toast.error('Erreur lors de la sauvegarde du programme')
    }
  }

  const updateMatch = (dayIndex: number, matchIndex: number, field: keyof ScheduledMatch, value: string) => {
    const updatedSchedule = [...scheduleDays]
    updatedSchedule[dayIndex].matches[matchIndex] = {
      ...updatedSchedule[dayIndex].matches[matchIndex],
      [field]: value
    }
    setScheduleDays(updatedSchedule)
  }

  const deleteMatch = (dayIndex: number, matchIndex: number) => {
    const updatedSchedule = [...scheduleDays]
    updatedSchedule[dayIndex].matches.splice(matchIndex, 1)
    
    // Remove day if no matches left
    if (updatedSchedule[dayIndex].matches.length === 0) {
      updatedSchedule.splice(dayIndex, 1)
    }
    
    setScheduleDays(updatedSchedule)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).replace(/\b\w/g, l => l.toUpperCase())
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
            Programmation des Matchs
          </h1>
          <p className="text-gray-400 font-outfit mt-1">
            Générez automatiquement le programme des matchs à partir des calendriers approuvés
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={generateSchedule}
            disabled={scheduling || !selectedCalendar || !startDate}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scheduling ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <FiCalendar className="w-4 h-4" />
                <span>Générer Programme</span>
              </>
            )}
          </button>

          {scheduleDays.length > 0 && (
            <button
              onClick={saveSchedule}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-outfit text-sm font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <FiSave className="w-4 h-4" />
              <span>Sauvegarder</span>
            </button>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6">Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Calendrier</label>
            <select
              value={selectedCalendar}
              onChange={(e) => setSelectedCalendar(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-orange-500/50 focus:outline-none"
            >
              <option value="">Sélectionner un calendrier</option>
              {savedCalendars.map(calendar => (
                <option key={calendar._id} value={calendar._id}>
                  {calendar.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-orange-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Heure de début</label>
            <input
              type="time"
              value={dailyStartTime}
              onChange={(e) => setDailyStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-orange-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Heure de fin</label>
            <input
              type="time"
              value={dailyEndTime}
              onChange={(e) => setDailyEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-orange-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Intervalle (minutes)</label>
            <input
              type="number"
              value={matchInterval}
              onChange={(e) => setMatchInterval(Number(e.target.value))}
              min="30"
              max="180"
              step="15"
              className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-orange-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Terrains par jour</label>
            <input
              type="number"
              value={venuesPerDay}
              onChange={(e) => setVenuesPerDay(Number(e.target.value))}
              min="1"
              max={venues.length}
              className="w-full px-3 py-2 bg-white/5 text-white rounded-lg border border-white/10 focus:border-orange-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Generated Schedule */}
      {scheduleDays.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Programme Généré</h2>
          
          {scheduleDays.map((day, dayIndex) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="glass rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">{formatDate(day.date)}</h3>
                <p className="text-gray-400">{day.matches.length} matchs programmés</p>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Heure</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Match</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Lieu</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Terrain</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Journée</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.matches.map((match, matchIndex) => (
                        <tr key={matchIndex} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <input
                              type="time"
                              value={match.time}
                              onChange={(e) => updateMatch(dayIndex, matchIndex, 'time', e.target.value)}
                              className="bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-sm"
                            />
                          </td>
                          <td className="py-3 px-4 text-white">
                            <span className="font-medium">{match.homeTeam}</span>
                            <span className="text-gray-400 mx-2">vs</span>
                            <span className="font-medium">{match.awayTeam}</span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={match.venue}
                              onChange={(e) => updateMatch(dayIndex, matchIndex, 'venue', e.target.value)}
                              className="bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-sm"
                            >
                              {venues.map(venue => (
                                <option key={venue._id} value={venue.name}>{venue.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={match.terrain || ''}
                              onChange={(e) => updateMatch(dayIndex, matchIndex, 'terrain', e.target.value)}
                              placeholder="T1"
                              className="bg-white/10 text-white px-2 py-1 rounded border border-white/20 focus:border-orange-500/50 focus:outline-none text-sm w-16"
                            />
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {match.journee > 0 ? `J${match.journee}` : 'Playoff'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => deleteMatch(dayIndex, matchIndex)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {scheduleDays.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8 border border-white/10 text-center"
        >
          <FiCalendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Prêt à programmer les matchs ?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Sélectionnez un calendrier approuvé et configurez les paramètres pour générer automatiquement 
            le programme des matchs. Le système respectera les contraintes pour éviter qu'une équipe 
            ne joue deux fois le même jour dans la même catégorie.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Contraintes respectées</p>
                <p className="text-gray-400 text-sm">Pas de double programmation</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiClock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Gestion du temps</p>
                <p className="text-gray-400 text-sm">Intervalles configurables</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiMapPin className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Multiple terrains</p>
                <p className="text-gray-400 text-sm">Optimisation des lieux</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
