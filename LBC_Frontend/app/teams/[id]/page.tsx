// app/teams/[id]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { FiCalendar, FiMapPin, FiAward, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'
import { TeamRoster } from '@/components/team/TeamRoster'
import { TeamStats } from '@/components/team/TeamStats'
import { UpcomingMatches } from '@/components/team/UpcomingMatches'
import { PastMatches } from '@/components/team/PastMatches'

interface Team {
  id: string
  name: string
  city: string
  logo: string
  founded: number
  arena: string
  championships: number
  category: string
  coach: string
  about: string
}

interface PageProps {
  params: {
    id: string
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

async function getTeam(id: string): Promise<Team | null> {
  // Simulated database/data fetch
  const teams: Team[] = [
    {
      id: '1',
      name: 'FAP Basketball',
      city: 'Yaoundé',
      logo: '/teams/fap-basketball.png',
      founded: 1972,
      arena: 'Yaoundé Sports Complex',
      championships: 8,
      category: 'Elite Men',
      coach: 'Jean-Paul Akono',
      about: 'FAP Basketball Club is one of the most successful basketball teams in Cameroon, with multiple national championships.'
    }
  ]
  return teams.find(team => team.id === id) || null
}

export default async function TeamPage({ params }: PageProps) {
  const team = await getTeam(params.id)
  if (!team) return notFound()

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="relative h-64 bg-gradient-to-r from-blue-900/90 to-orange-900/80">
        <div className="absolute inset-0 bg-[url('/images/court-pattern.svg')] opacity-10" />
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-32 h-32 md:w-48 md:h-48 relative mr-0 md:mr-8 mb-4 md:mb-0">
              <Image
                src={team.logo}
                alt={team.name}
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <Link 
                href="/teams" 
                className="inline-flex items-center text-gray-300 hover:text-white mb-4"
              >
                <FiArrowLeft className="mr-2" /> Back to Teams
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {team.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center text-gray-300 gap-4">
                <span className="flex items-center">
                  <FiMapPin className="mr-2" /> {team.city}
                </span>
                <span className="flex items-center">
                  <FiAward className="mr-2" /> {team.championships} Championships
                </span>
                <span className="flex items-center">
                  <FiCalendar className="mr-2" /> Founded {team.founded}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                About the Team
              </h2>
              <p className="text-gray-300">{team.about}</p>
            </div>

            <TeamRoster teamId={team.id} />
            <TeamStats teamId={team.id} />
            <PastMatches teamId={team.id} />
          </div>

          <div className="space-y-8">
            <div className="bg-gray-900 rounded-xl p-6 sticky top-4">
              <h3 className="text-xl font-bold text-white mb-4">
                Team Information
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Category
                  </h4>
                  <p className="text-white">{team.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Head Coach
                  </h4>
                  <p className="text-white">{team.coach}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Home Arena
                  </h4>
                  <p className="text-white">{team.arena}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Championships
                  </h4>
                  <p className="text-white">{team.championships}</p>
                </div>
              </div>
            </div>

            <UpcomingMatches teamId={team.id} />
          </div>
        </div>
      </div>
    </div>
  )
}