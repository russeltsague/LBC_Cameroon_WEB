export interface Match {
  _id: string;
  date: string;
  time: string;
  homeTeam: Team | string;
  awayTeam: Team | string;
  homeScore?: number;
  awayScore?: number;
  category: string;
  venue: string;
  status: 'completed' | 'upcoming' | 'live';
  journee?: number;
  terrain?: string;
  poule?: string;
}

export interface TeamMember {
  _id?: string;
  name: string;
  number?: number;
  position?: string;
  role?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  nationality?: string;
  image?: string;
  type: 'player' | 'staff';
}

export interface Team {
  _id: string;
  name: string;
  city: string;
  logo: string;
  founded: number;
  arena: string;
  championships: number;
  category: string;
  coach: string;
  about: string;
  poule?: string;
  isActive?: boolean;
  players?: TeamMember[];
  staff?: TeamMember[];
  contactEmail?: string;
  contactPhone?: string;
  email?: string; // Alias for contactEmail
  phone?: string;  // Alias for contactPhone
  website?: string;
  facebook?: string; // Direct social media links
  twitter?: string;
  instagram?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  hasPoules: boolean;
  poules: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  _id: string;
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  sponsorshipLevel: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  _id: string;
  season: string;
  reportTitle: string;
  date: string;
  secretary: string;
  resultsA: Array<{
    day: string;
    matches: Array<{
      category: string;
      results: string[];
    }>;
  }>;
  decisionsB: string;
  sanctionsC: {
    heading: string;
    columns: string[];
    rows: string[][];
    note: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lbc-cameroon-web.onrender.com';

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  // For testing - don't include any auth headers
  return {
    'Content-Type': 'application/json'
  };
  
  /* Original auth logic - commented out for testing
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  */
}

export async function getTeams(): Promise<Team[]> {
  const res = await fetch(`${BASE}/api/teams`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch teams: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchTeamById(id: string): Promise<Team | null> {
  try {
    const res = await fetch(`${BASE}/api/teams/${id}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch team: ${res.statusText}`);
    }
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
}

export async function createTeam(data: Partial<Team>): Promise<Team> {
  const res = await fetch(`${BASE}/api/teams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create team: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<Team> {
  const res = await fetch(`${BASE}/api/teams/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update team: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/teams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete team: ${await res.text()}`);
}

// Category API functions
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/api/categories/active`)
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`)
  const data = await res.json()
  return data.data || []
}

export async function getAllCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/api/categories/active`)
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`)
  const data = await res.json()
  return data.data || []
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const res = await fetch(`${BASE}/api/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create category: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const res = await fetch(`${BASE}/api/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update category: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete category: ${await res.text()}`);
}

export async function toggleCategoryStatus(id: string): Promise<Category> {
  const res = await fetch(`${BASE}/api/categories/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to toggle category status: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

// News API functions
export async function getAllNews(): Promise<News[]> {
  const res = await fetch(`${BASE}/api/news/admin`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch news: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function getPublishedNews(limit = 10, page = 1, category?: string): Promise<{ data: News[], pagination: any }> {
  let url = `${BASE}/api/news?limit=${limit}&page=${page}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch news: ${res.statusText}`);
  const data = await res.json();
  return data;
}

export async function createNews(data: Partial<News>): Promise<News> {
  const res = await fetch(`${BASE}/api/news`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create news: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateNews(id: string, data: Partial<News>): Promise<News> {
  const res = await fetch(`${BASE}/api/news/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update news: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteNews(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/news/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete news: ${await res.text()}`);
}

export async function toggleNewsStatus(id: string): Promise<News> {
  const res = await fetch(`${BASE}/api/news/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to toggle news status: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

// Sponsor API functions
export async function getAllSponsors(): Promise<Sponsor[]> {
  const res = await fetch(`${BASE}/api/sponsors/admin`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch sponsors: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function getActiveSponsors(level?: string): Promise<Sponsor[]> {
  let url = `${BASE}/api/sponsors`;
  if (level) url += `?level=${encodeURIComponent(level)}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sponsors: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function createSponsor(data: Partial<Sponsor>): Promise<Sponsor> {
  const res = await fetch(`${BASE}/api/sponsors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create sponsor: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateSponsor(id: string, data: Partial<Sponsor>): Promise<Sponsor> {
  const res = await fetch(`${BASE}/api/sponsors/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update sponsor: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteSponsor(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/sponsors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to delete sponsor');
  }
}

export const toggleSponsorStatus = async (id: string): Promise<Sponsor> => {
  const response = await fetch(`${BASE}/api/sponsors/${id}/toggle-status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  return data.data;
};

/**
 * Fetch matches within a date range
 * @param query Query string with startDate and endDate in YYYY-MM-DD format
 * @returns Array of matches
 */
export const getMatches = async (query: string = ''): Promise<Match[]> => {
  try {
    const response = await fetch(`${BASE}/api/matches${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

export async function createMatch(data: Partial<Match>): Promise<Match> {
  const res = await fetch(`${BASE}/api/matches`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create match: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateMatch(id: string, data: Partial<Match>): Promise<Match> {
  const res = await fetch(`${BASE}/api/matches/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update match: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteMatch(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/matches/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete match: ${await res.text()}`);
}

// Calendar API functions
export interface Calendar {
  _id?: string;
  category: string;
  hasPoules: boolean;
  poules?: Array<{
    name: string;
    teams: string[];
    journées: Array<{
      n: number;
      matches: Array<{
        homeTeam: string;
        awayTeam: string;
        homeScore?: number;
        awayScore?: number;
      }>;
      exempt?: string;
    }>;
  }>;
  playoffs?: Array<{
    name: string;
    matches: Array<{
      homeTeam: string;
      awayTeam: string;
      homeScore?: number;
      awayScore?: number;
    }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Venue {
  _id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  isActive: boolean;
}

export async function getCalendars(): Promise<Calendar[]> {
  const res = await fetch(`${BASE}/api/calendar`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch calendars: ${await res.text()}`);
  const response = await res.json();
  return response.data || [];
}

export async function getCalendar(category: string): Promise<Calendar | null> {
  const res = await fetch(`${BASE}/api/calendar/${encodeURIComponent(category)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch calendar: ${await res.text()}`);
  }
  const response = await res.json();
  return response.data;
}

export async function createCalendar(calendar: Omit<Calendar, '_id' | 'createdAt' | 'updatedAt'>): Promise<Calendar> {
  const res = await fetch(`${BASE}/api/calendar`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(calendar),
  });
  if (!res.ok) throw new Error(`Failed to create calendar: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateCalendar(id: string, data: Partial<Calendar>): Promise<Calendar> {
  const res = await fetch(`${BASE}/api/calendar/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update calendar: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteCalendar(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/calendar/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete calendar: ${await res.text()}`);
}

export async function getVenues(): Promise<Venue[]> {
  // For now, return mock venues data
  return [
    {
      _id: '1',
      name: 'Palais des Sports',
      address: 'Yaoundé',
      city: 'Yaoundé',
      capacity: 5000,
      isActive: true
    },
    {
      _id: '2',
      name: 'Stade de Basketball',
      address: 'Douala',
      city: 'Douala',
      capacity: 3000,
      isActive: true
    },
    {
      _id: '3',
      name: 'Centre Sportif',
      address: 'Bafoussam',
      city: 'Bafoussam',
      capacity: 2000,
      isActive: true
    },
    {
      _id: '4',
      name: 'Complex Sportif',
      address: 'Garoua',
      city: 'Garoua',
      capacity: 1500,
      isActive: true
    }
  ];
}

// Weekly Schedule API functions
export interface WeeklyMatch {
  _id?: string;
  category: string;
  teams: string;
  groupNumber: string;
  terrain: string;
  journey: string;
  homeTeam: string;
  awayTeam: string;
}

export interface WeeklySchedule {
  _id?: string;
  date: string;
  venue: string;
  matches: WeeklyMatch[];
  isExpanded: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getWeeklySchedules(): Promise<WeeklySchedule[]> {
  const res = await fetch(`${BASE}/api/weekly-schedules`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch weekly schedules: ${res.statusText}`);
  const response = await res.json();
  return response.data || [];
}

export async function getWeeklySchedulesByDateRange(startDate: string, endDate: string): Promise<WeeklySchedule[]> {
  const res = await fetch(`${BASE}/api/weekly-schedules/range?startDate=${startDate}&endDate=${endDate}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch weekly schedules by date range: ${res.statusText}`);
  const response = await res.json();
  return response.data || [];
}

export async function createWeeklySchedule(data: Omit<WeeklySchedule, '_id' | 'createdAt' | 'updatedAt'>): Promise<WeeklySchedule> {
  const res = await fetch(`${BASE}/api/weekly-schedules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create weekly schedule: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateWeeklySchedule(id: string, data: Partial<WeeklySchedule>): Promise<WeeklySchedule> {
  const res = await fetch(`${BASE}/api/weekly-schedules/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update weekly schedule: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteWeeklySchedule(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/weekly-schedules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete weekly schedule: ${await res.text()}`);
}

export async function addMatchToSchedule(id: string, match: Omit<WeeklyMatch, '_id'>): Promise<WeeklySchedule> {
  const res = await fetch(`${BASE}/api/weekly-schedules/${id}/matches`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(match),
  });
  if (!res.ok) throw new Error(`Failed to add match to schedule: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateMatchInSchedule(id: string, matchId: string, match: Partial<WeeklyMatch>): Promise<WeeklySchedule> {
  const res = await fetch(`${BASE}/api/weekly-schedules/${id}/matches/${matchId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(match),
  });
  if (!res.ok) throw new Error(`Failed to update match in schedule: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function removeMatchFromSchedule(id: string, matchId: string): Promise<WeeklySchedule> {
  const res = await fetch(`${BASE}/api/weekly-schedules/${id}/matches/${matchId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to remove match from schedule: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function saveWeeklyScheduleAsMatches(id: string): Promise<{ createdCount: number; errorCount: number; errors?: string[] }> {
  const res = await fetch(`${BASE}/api/weekly-schedules/${id}/save-matches`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to save weekly schedule as matches: ${await res.text()}`);
  const response = await res.json();
  return {
    createdCount: response.data.createdCount,
    errorCount: response.data.errorCount,
    errors: response.data.errors
  };
}

export async function getMatchesByDateRange(startDate: string, endDate: string): Promise<Match[]> {
  const res = await fetch(`${BASE}/api/matches?startDate=${startDate}&endDate=${endDate}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function updateMatchStatus(id: string, status: 'upcoming' | 'live' | 'completed', homeScore?: number, awayScore?: number): Promise<Match> {
  const response = await fetch(`${BASE}/api/matches/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, homeScore, awayScore }),
  });

  if (!response.ok) {
    throw new Error('Failed to update match status');
  }

  return response.json();
}

export async function getWeeklySchedulesList(): Promise<any[]> {
  const res = await fetch(`${BASE}/api/weekly-schedules`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch weekly schedules: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function updateWeeklyScheduleDetails(id: string, data: Partial<any>): Promise<any> {
  const res = await fetch(`${BASE}/api/weekly-schedules/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update weekly schedule: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteWeeklyScheduleById(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/weekly-schedules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete weekly schedule: ${await res.text()}`);
}

export async function updateCalendarMatchScore(date: string, homeTeam: string, awayTeam: string, homeScore: number, awayScore: number, status: string): Promise<any> {
  const response = await fetch(`${BASE}/api/calendar/update-score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date, homeTeam, awayTeam, homeScore, awayScore, status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update calendar match score');
  }

  return response.json();
}

// Calendar-based classification
export async function getClassificationFromCalendar(category: string, poule?: string): Promise<any[]> {
  const url = new URL(`${BASE}/api/classifications/calendar`);
  url.searchParams.append('category', category);
  if (poule) {
    url.searchParams.append('poule', poule);
  }
  
  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch classification from calendar: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

// Report API functions
export async function getLatestReports(limit = 3): Promise<Report[]> {
  const res = await fetch(`${BASE}/api/reports/latest?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch latest reports: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function getAllReports(page = 1, limit = 10, season?: string, isActive?: boolean): Promise<{ data: Report[], pagination: any }> {
  let url = `${BASE}/api/reports?page=${page}&limit=${limit}`;
  if (season) url += `&season=${encodeURIComponent(season)}`;
  if (isActive !== undefined) url += `&isActive=${isActive}`;
  
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch reports: ${res.statusText}`);
  const data = await res.json();
  return data;
}

export async function getReportById(id: string): Promise<Report | null> {
  try {
    const res = await fetch(`${BASE}/api/reports/${id}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch report: ${res.statusText}`);
    }
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
}

export async function createReport(data: Partial<Report>): Promise<Report> {
  const res = await fetch(`${BASE}/api/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create report: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function updateReport(id: string, data: Partial<Report>): Promise<Report> {
  const res = await fetch(`${BASE}/api/reports/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update report: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}

export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/reports/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete report: ${await res.text()}`);
}

export async function toggleReportStatus(id: string): Promise<Report> {
  const res = await fetch(`${BASE}/api/reports/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to toggle report status: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}
