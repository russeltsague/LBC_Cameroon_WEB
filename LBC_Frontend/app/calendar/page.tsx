'use client'
import { CalendarSection } from '@/components/sections/Calendar'
import { Navbar } from '@/components/ui/Navbar'

export default function CalendarPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <CalendarSection />
      </main>
    </>
  )
} 