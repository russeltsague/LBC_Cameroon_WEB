import { fetchTeamById } from '@/app/lib/api';
import { notFound } from 'next/navigation';
import TeamDetails from '@/components/teams/TeamDetails';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await fetchTeamById(id);

  if (!team) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-20">
      <TeamDetails team={team} />
    </main>
  );
}
