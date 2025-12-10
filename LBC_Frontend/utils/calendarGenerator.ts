export interface Match {
  homeTeam: string
  awayTeam: string
  score?: string
  date?: string
  time?: string
  venue?: string
}

export interface Journee {
  n: number
  matches: Match[]
  exempt?: string
}

export interface Poule {
  name: string
  teams: string[]
  journées: Journee[]
}

export interface PlayoffRound {
  name: string
  matches: Match[]
}

export interface Calendar {
  category: string
  hasPoules: boolean
  poules?: Poule[]
  playoffs?: PlayoffRound[]
}

/**
 * Generate a round-robin tournament schedule
 */
export function generateRoundRobin(teams: string[]): Journee[] {
  if (teams.length < 2) {
    return []
  }

  const numTeams = teams.length
  const isOddNumber = numTeams % 2 === 1
  const effectiveNumTeams = isOddNumber ? numTeams + 1 : numTeams
  const numRounds = effectiveNumTeams - 1
  const matchesPerRound = Math.floor(effectiveNumTeams / 2)
  
  // Create a copy of teams array for rotation
  let teamList = [...teams]
  
  // If odd number of teams, add a dummy team for bye
  if (isOddNumber) {
    teamList.push('BYE')
  }

  const journées: Journee[] = []

  for (let round = 0; round < numRounds; round++) {
    const matches: Match[] = []
    let exemptTeam: string | undefined
    
    // Create matches for this round
    for (let i = 0; i < matchesPerRound; i++) {
      const homeTeam = teamList[i]
      const awayTeam = teamList[effectiveNumTeams - 1 - i]
      
      if (homeTeam !== 'BYE' && awayTeam !== 'BYE') {
        matches.push({
          homeTeam,
          awayTeam,
          score: '' // Will be filled later
        })
      } else {
        // One of the teams is BYE, so the other team is exempt
        exemptTeam = homeTeam === 'BYE' ? awayTeam : homeTeam
      }
    }

    journées.push({
      n: round + 1,
      matches,
      exempt: exemptTeam
    })

    // Rotate teams for next round (standard round-robin rotation)
    // Keep the first team fixed, rotate the rest
    if (effectiveNumTeams > 2) {
      const fixedTeam = teamList[0]
      const lastTeam = teamList[effectiveNumTeams - 1]
      
      // Shift all teams except the first one
      for (let i = effectiveNumTeams - 1; i > 1; i--) {
        teamList[i] = teamList[i - 1]
      }
      
      // Place the last team in position 1
      teamList[1] = lastTeam
    }
  }

  return journées
}

/**
 * Generate calendar structure only (no teams pre-filled)
 */
export function generateCalendarStructure(categoryName: string, teamsByPoule: Record<string, string[]>, hasPoules: boolean): Calendar {
  const calendar: Calendar = {
    category: categoryName,
    hasPoules
  }

  if (hasPoules) {
    // Generate calendar structure for each poule
    calendar.poules = []
    
    Object.entries(teamsByPoule).forEach(([pouleName, teams]) => {
      if (teams.length > 0) {
        const numTeams = teams.length
        const numRounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams
        const matchesPerRound = Math.floor(numTeams / 2)
        
        // Create empty journées structure
        const journées: Journee[] = []
        
        for (let round = 0; round < numRounds; round++) {
          const matches: Match[] = []
          
          // Create empty match slots
          for (let i = 0; i < matchesPerRound; i++) {
            matches.push({
              homeTeam: '',
              awayTeam: '',
              score: ''
            })
          }

          // Add exempt team if odd number of teams
          let exempt: string | undefined
          if (numTeams % 2 === 1) {
            // For structure generation, we'll leave exempt empty to be filled manually
            exempt = undefined
          }

          journées.push({
            n: round + 1,
            matches,
            exempt
          })
        }
        
        const poule: Poule = {
          name: `POULE ${pouleName.toUpperCase()}`,
          teams, // Keep the team list for reference
          journées
        }
        calendar.poules!.push(poule)
      }
    })
  } else {
    // Single group calendar structure
    const allTeams = Object.values(teamsByPoule).flat()
    if (allTeams.length > 0) {
      const numTeams = allTeams.length
      const numRounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams
      const matchesPerRound = Math.floor(numTeams / 2)
      
      // Create empty journées structure
      const journées: Journee[] = []
      
      for (let round = 0; round < numRounds; round++) {
        const matches: Match[] = []
        
        // Create empty match slots
        for (let i = 0; i < matchesPerRound; i++) {
          matches.push({
            homeTeam: '',
            awayTeam: '',
            score: ''
          })
        }

        // Add exempt team if odd number of teams
        let exempt: string | undefined
        if (numTeams % 2 === 1) {
          exempt = undefined
        }

        journées.push({
          n: round + 1,
          matches,
          exempt
        })
      }
      
      const poule: Poule = {
        name: 'PHASE DE GROUPE',
        teams: allTeams, // Keep the team list for reference
        journées
      }
      calendar.poules = [poule]
    }
  }

  return calendar
}

/**
 * Generate calendar for a category with teams
 */
export function generateCalendarForCategory(
  categoryName: string,
  teamsByPoule: Record<string, string[]>,
  hasPoules: boolean
): Calendar {
  const calendar: Calendar = {
    category: categoryName,
    hasPoules
  }

  if (hasPoules) {
    // Generate calendar for each poule
    calendar.poules = []
    
    Object.entries(teamsByPoule).forEach(([pouleName, teams]) => {
      if (teams.length > 0) {
        const poule: Poule = {
          name: `POULE ${pouleName.toUpperCase()}`,
          teams,
          journées: generateRoundRobin(teams)
        }
        calendar.poules!.push(poule)
      }
    })
  } else {
    // Single group calendar
    const allTeams = Object.values(teamsByPoule).flat()
    if (allTeams.length > 0) {
      const poule: Poule = {
        name: 'PHASE DE GROUPE',
        teams: allTeams,
        journées: generateRoundRobin(allTeams)
      }
      calendar.poules = [poule]
    }
  }

  // Add playoff structure if applicable
  if (calendar.poules && calendar.poules.length > 1) {
    calendar.playoffs = generatePlayoffs(calendar.poules)
  }

  return calendar
}

/**
 * Generate playoff bracket based on poule results
 */
export function generatePlayoffs(poules: Poule[]): PlayoffRound[] {
  const playoffs: PlayoffRound[] = []
  
  // Quarter finals
  const quarterFinals: Match[] = []
  if (poules.length >= 2) {
    const pouleA = poules[0]
    const pouleB = poules[1] || poules[0]
    
    // Assume top 4 teams from each poule qualify
    const topTeamsA = pouleA.teams.slice(0, 4)
    const topTeamsB = pouleB.teams.slice(0, 4)
    
    if (topTeamsA.length >= 4 && topTeamsB.length >= 4) {
      quarterFinals.push(
        { homeTeam: topTeamsA[0], awayTeam: topTeamsB[3], score: '' },
        { homeTeam: topTeamsA[1], awayTeam: topTeamsB[2], score: '' },
        { homeTeam: topTeamsB[0], awayTeam: topTeamsA[3], score: '' },
        { homeTeam: topTeamsB[1], awayTeam: topTeamsA[2], score: '' }
      )
    }
  }
  
  if (quarterFinals.length > 0) {
    playoffs.push({ name: '1/4 Finale', matches: quarterFinals })
    
    // Semi finals
    playoffs.push({
      name: '½ Finale',
      matches: [
        { homeTeam: 'Winner QF1', awayTeam: 'Winner QF2', score: '' },
        { homeTeam: 'Winner QF3', awayTeam: 'Winner QF4', score: '' }
      ]
    })
    
    // Final
    playoffs.push({
      name: 'Finale',
      matches: [
        { homeTeam: 'Winner SF1', awayTeam: 'Winner SF2', score: '' }
      ]
    })
  }
  
  return playoffs
}

/**
 * Group teams by poule based on their category and poule assignment
 */
export function groupTeamsByPoule(teams: any[], categoryName: string): Record<string, string[]> {
  const teamsByPoule: Record<string, string[]> = {}
  
  teams
    .filter(team => team.category === categoryName && team.isActive !== false)
    .forEach(team => {
      const poule = team.poule || 'A'
      if (!teamsByPoule[poule]) {
        teamsByPoule[poule] = []
      }
      teamsByPoule[poule].push(team.name)
    })
  
  return teamsByPoule
}

/**
 * Generate complete calendar structure for all categories (no teams pre-filled)
 */
export function generateCompleteCalendarStructure(categories: any[], teams: any[]): Calendar[] {
  const calendars: Calendar[] = []
  
  categories.forEach(category => {
    if (category.isActive !== false) {
      const teamsByPoule = groupTeamsByPoule(teams, category.name)
      const hasTeams = Object.values(teamsByPoule).some(teams => teams.length > 0)
      
      if (hasTeams) {
        const calendar = generateCalendarStructure(
          category.name,
          teamsByPoule,
          category.hasPoules || false
        )
        calendars.push(calendar)
      }
    }
  })
  
  return calendars
}

/**
 * Generate complete calendar for all categories
 */
export function generateCompleteCalendar(categories: any[], teams: any[]): Calendar[] {
  const calendars: Calendar[] = []
  
  categories.forEach(category => {
    if (category.isActive !== false) {
      const teamsByPoule = groupTeamsByPoule(teams, category.name)
      const hasTeams = Object.values(teamsByPoule).some(teams => teams.length > 0)
      
      if (hasTeams) {
        const calendar = generateCalendarForCategory(
          category.name,
          teamsByPoule,
          category.hasPoules || false
        )
        calendars.push(calendar)
      }
    }
  })
  
  return calendars
}
