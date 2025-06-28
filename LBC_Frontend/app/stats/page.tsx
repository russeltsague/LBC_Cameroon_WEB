'use client'
import { StatsSection } from '@/components/sections/Stats'
import { Navbar } from '@/components/ui/Navbar'

export default function StatsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <StatsSection />
      </main>
    </>
  )
} 