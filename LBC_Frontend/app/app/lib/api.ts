// src/utils/api.ts (you can create this file)
export async function fetchTeams() {
    const res = await fetch('http://localhost:5000/api/teams') // Your backend URL
    if (!res.ok) throw new Error('Failed to fetch teams')
    return res.json()
  }
  
  export async function fetchTeamById(id: string) {
    const res = await fetch(`http://localhost:5000/api/teams/${id}`)
    if (!res.ok) throw new Error('Team not found')
    return res.json()
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
  }
  
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  export async function getTeams(): Promise<Team[]> {
    const res = await fetch(`${BASE}/api/teams`);
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
  }
  
  export async function createTeam(data: Partial<Team>): Promise<Team> {
    const res = await fetch(`${BASE}/api/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create team');
    return res.json();
  }
  export async function updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const res = await fetch(`/api/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  
  export async function deleteTeam(id: string): Promise<void> {
    const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
  }
  