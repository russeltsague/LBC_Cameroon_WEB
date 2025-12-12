
'use client';

import { Team, Match, TeamMember } from '@/app/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import {
  ChevronLeft, Users, Trophy, Calendar, Clock, Award, BarChart2,
  UserCheck, Shirt, CalendarDays, ListChecks, TrendingUp, Activity, MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ExtendedTeam extends Team {
  upcomingMatches?: Match[];
  pastMatches?: Match[];
  ranking?: {
    position: number;
    totalTeams: number;
    points: number;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
  };
  classificationStats?: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    forfeits: number;
    points: number;
    pointsFor: number;
    pointsAgainst: number;
    goalDifference: number;
  };
}

interface TeamDetailsProps {
  team: ExtendedTeam;
}

// Helper function to format dates
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const TeamDetails = ({ team }: TeamDetailsProps) => {
  const router = useRouter();

  // Mock data - replace with actual API calls
  const [teamData, setTeamData] = useState<ExtendedTeam>(team);

  useEffect(() => {
    setTeamData(team);
  }, [team]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
      {/* Hero Section with Glassmorphism */}
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[var(--color-primary)]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Retour aux équipes</span>
          </Button>

          <motion.div
            className="glass rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-40 h-40 md:w-56 md:h-56 relative z-10 drop-shadow-2xl">
                  {teamData.logo ? (
                    <Image
                      src={teamData.logo}
                      alt={`${teamData.name} logo`}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-full border-4 border-gray-700">
                      <Shirt className="w-20 h-20 text-gray-500" />
                    </div>
                  )}
                </div>
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 bg-[var(--color-primary)]/30 blur-2xl rounded-full -z-10 scale-90 group-hover:scale-110 transition-transform duration-500" />
              </motion.div>

              <div className="flex-1 text-center md:text-left space-y-6">
                <div>
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-2">
                    <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-white drop-shadow-lg">
                      {teamData.name}
                    </h1>
                  </div>
                  <p className="text-xl text-gray-400 font-light flex items-center justify-center md:justify-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    {teamData.city}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-6 border-t border-white/10">
                  <InfoItem label="Catégorie" value={teamData.category} />
                  <InfoItem label="Fondé en" value={teamData.founded?.toString()} />
                  <InfoItem label="Entraîneur" value={teamData.coach} />
                  <InfoItem label="Salle" value={teamData.arena} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Trophy className="w-8 h-8" />}
            title="Championnats"
            value={teamData.championships?.toString() || '0'}
            subtitle={`Dernier titre: ${teamData.championships ? '2023' : '-'} `}
            delay={0.1}
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            title="Victoires"
            value={teamData.classificationStats?.wins.toString() || '0'}
            subtitle={`${teamData.classificationStats?.losses || 0} Défaites`}
            delay={0.2}
            highlight
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Effectif"
            value={`${teamData.players?.length || 0} `}
            subtitle="Joueurs actifs"
            delay={0.3}
          />
          <StatCard
            icon={<BarChart2 className="w-8 h-8" />}
            title="Points Moy."
            value={teamData.classificationStats && teamData.classificationStats.played > 0
              ? (teamData.classificationStats.pointsFor / teamData.classificationStats.played).toFixed(1)
              : '0'}
            subtitle="Par match"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Upcoming Matches */}
            <Section title="Prochains Matchs" icon={<CalendarDays className="w-6 h-6" />}>
              {teamData.upcomingMatches?.length ? (
                <div className="grid gap-4">
                  {teamData.upcomingMatches.map((match, idx) => (
                    <MatchCard key={match._id} match={match} teamName={teamData.name} index={idx} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucun match programmé" />
              )}
            </Section>

            {/* Squad */}
            <Section title="Effectif" icon={<Users className="w-6 h-6" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamData.players?.map((player, idx) => (
                  <PlayerCard key={player._id} player={player} index={idx} />
                ))}
              </div>
            </Section>

            {/* Staff */}
            <Section title="Staff Technique" icon={<UserCheck className="w-6 h-6" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamData.staff?.map((staff, idx) => (
                  <StaffCard key={staff._id} staff={staff} index={idx} />
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Recent Results */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[var(--color-primary)]" />
                Derniers Résultats
              </h3>
              <div className="space-y-4">
                {teamData.pastMatches?.length ? (
                  teamData.pastMatches.map((match, idx) => (
                    <ResultCard key={match._id} match={match} teamName={teamData.name} index={idx} />
                  ))
                ) : (
                  <EmptyState message="Aucun résultat récent" small />
                )}
              </div>
            </div>

            {/* Season Stats Detail */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[var(--color-primary)]" />
                Statistiques Saison
              </h3>
              {teamData.classificationStats ? (
                <div className="space-y-4">
                  <StatRow label="Points Marqués" value={teamData.classificationStats.pointsFor} />
                  <StatRow label="Points Encaissés" value={teamData.classificationStats.pointsAgainst} />
                  <StatRow
                    label="Différence"
                    value={teamData.classificationStats.goalDifference}
                    isPositive={teamData.classificationStats.goalDifference > 0}
                  />
                  <div className="pt-4 mt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Points Total</span>
                      <span className="text-2xl font-bold text-[var(--color-primary)]">{teamData.classificationStats.points}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState message="Stats non disponibles" small />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</span>
    <span className="text-white font-medium text-lg truncate">{value || '-'}</span>
  </div>
);

const StatCard = ({ icon, title, value, subtitle, delay, highlight }: any) => (
  <motion.div
    className={`relative overflow - hidden rounded - 2xl p - 6 border transition - all duration - 300 ${highlight
      ? 'bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border-[var(--color-primary)]/30'
      : 'glass border-white/5 hover:border-white/10'
      } `}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -5 }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p - 3 rounded - xl ${highlight ? 'bg-[var(--color-primary)] text-white' : 'bg-white/5 text-gray-300'} `}>
        {icon}
      </div>
      {highlight && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />}
    </div>
    <h3 className="text-3xl font-bold text-white mb-1 font-display">{value}</h3>
    <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </motion.div>
);

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        {icon}
      </div>
      <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
    </div>
    {children}
  </div>
);

const MatchCard = ({ match, teamName, index }: { match: Match; teamName: string; index: number }) => {
  const isHome = typeof match.homeTeam === 'string' ? match.homeTeam === teamName : match.homeTeam.name === teamName;
  const homeName = typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam.name;
  const awayName = typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam.name;

  return (
    <motion.div
      className="glass rounded-xl p-6 border border-white/5 hover:border-[var(--color-primary)]/30 transition-all duration-300 group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(match.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{match.time}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 flex-1 w-full md:w-auto">
          <div className={`text - right flex - 1 ${isHome ? 'font-bold text-[var(--color-primary)]' : 'text-white'} `}>
            <span className="text-lg md:text-xl font-display uppercase">{homeName}</span>
          </div>
          <div className="px-4 py-1 rounded bg-white/5 text-sm font-mono text-gray-400">VS</div>
          <div className={`text - left flex - 1 ${!isHome ? 'font-bold text-[var(--color-primary)]' : 'text-white'} `}>
            <span className="text-lg md:text-xl font-display uppercase">{awayName}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {match.venue || 'Lieu à définir'}
        </div>
      </div>
    </motion.div>
  );
};

const ResultCard = ({ match, teamName, index }: { match: Match; teamName: string; index: number }) => {
  const isHome = typeof match.homeTeam === 'string' ? match.homeTeam === teamName : match.homeTeam.name === teamName;
  const homeName = typeof match.homeTeam === 'string' ? match.homeTeam : match.homeTeam.name;
  const awayName = typeof match.awayTeam === 'string' ? match.awayTeam : match.awayTeam.name;

  const isWinner = match.status === 'completed' && match.homeScore !== undefined && match.awayScore !== undefined && (
    isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore
  );

  return (
    <motion.div
      className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
        <span>{formatDate(match.date)}</span>
        <span className={`px - 2 py - 0.5 rounded text - [10px] font - bold uppercase ${isWinner ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} `}>
          {isWinner ? 'Victoire' : 'Défaite'}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span className={`font - display ${isHome ? 'text-white font-bold' : 'text-gray-400'} `}>{homeName}</span>
          <span className={`font - display ${!isHome ? 'text-white font-bold' : 'text-gray-400'} `}>{awayName}</span>
        </div>
        <div className="flex flex-col gap-1 items-end font-mono font-bold">
          <span className={isHome ? 'text-[var(--color-primary)]' : 'text-gray-500'}>{match.homeScore}</span>
          <span className={!isHome ? 'text-[var(--color-primary)]' : 'text-gray-500'}>{match.awayScore}</span>
        </div>
      </div>
    </motion.div>
  );
};

const PlayerCard = ({ player, index }: { player: TeamMember; index: number }) => (
  <motion.div
    className="glass rounded-xl p-4 flex items-center gap-4 border border-white/5 hover:border-[var(--color-primary)]/30 hover:bg-white/5 transition-all duration-300 group"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
  >
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-lg font-bold text-white border border-white/10 group-hover:border-[var(--color-primary)]/50 transition-colors">
      {player.number}
    </div>
    <div>
      <h4 className="font-display font-bold text-lg text-white group-hover:text-[var(--color-primary)] transition-colors">{player.name}</h4>
      <p className="text-sm text-gray-400 uppercase tracking-wider">{player.position}</p>
    </div>
  </motion.div>
);

const StaffCard = ({ staff, index }: { staff: TeamMember; index: number }) => (
  <motion.div
    className="bg-white/5 rounded-xl p-4 border border-white/5"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05 }}
  >
    <h4 className="font-medium text-white">{staff.name}</h4>
    <p className="text-sm text-gray-400">{staff.role}</p>
  </motion.div>
);

const StatRow = ({ label, value, isPositive }: { label: string; value: number; isPositive?: boolean }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className={`font - mono font - bold ${isPositive === true ? 'text-green-400' :
      isPositive === false ? 'text-red-400' :
        'text-white'
      } `}>
      {isPositive && '+'}{value}
    </span>
  </div>
);

const EmptyState = ({ message, small }: { message: string; small?: boolean }) => (
  <div className={`text - center ${small ? 'py-4' : 'py-12'} rounded - xl border border - dashed border - white / 10 bg - white / 5`}>
    <p className="text-gray-500">{message}</p>
  </div>
);

export default TeamDetails;
