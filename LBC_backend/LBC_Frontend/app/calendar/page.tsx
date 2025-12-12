'use client'
import dynamic from 'next/dynamic';

// Dynamically import the LeagueCalendar component with no SSR
const LeagueCalendar = dynamic(
  () => import('@/components/sections/LeagueCalendar'),
  { ssr: false }
);

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-600/20 to-transparent opacity-60" />
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <LeagueCalendar />
      </div>
    </main>
  )
}    