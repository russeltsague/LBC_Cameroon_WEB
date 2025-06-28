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

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export async function getTeams(): Promise<Team[]> {
  const res = await fetch(`${BASE}/api/teams`);
  if (!res.ok) throw new Error(`Failed to fetch teams: ${res.statusText}`);
  return res.json();
}

export async function fetchTeamById(id: string): Promise<Team> {
  const res = await fetch(`${BASE}/api/teams/${id}`);
  if (!res.ok) throw new Error(`Team not found: ${res.statusText}`);
  return res.json();
}

export async function createTeam(data: Partial<Team>): Promise<Team> {
  const res = await fetch(`${BASE}/api/teams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create team: ${await res.text()}`);
  return res.json();
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<Team> {
  const res = await fetch(`${BASE}/api/teams/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update team: ${await res.text()}`);
  return res.json();
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
  const res = await fetch(`${BASE}/api/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
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
  if (!res.ok) throw new Error(`Failed to delete sponsor: ${await res.text()}`);
}

export async function toggleSponsorStatus(id: string): Promise<Sponsor> {
  const res = await fetch(`${BASE}/api/sponsors/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to toggle sponsor status: ${await res.text()}`);
  const response = await res.json();
  return response.data;
}
