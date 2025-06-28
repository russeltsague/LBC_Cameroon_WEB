'use client'
import { ScheduleSection } from '@/components/sections/schedule'
import { Navbar } from '@/components/ui/Navbar'

export default function SchedulePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <ScheduleSection />
      </main>
    </>
  )
} 