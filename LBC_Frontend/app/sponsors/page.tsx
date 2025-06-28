'use client'
import { SponsorsSection } from '@/components/sections/Sponsors'
import { Navbar } from '@/components/ui/Navbar'

export default function SponsorsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <SponsorsSection />
      </main>
    </>
  )
} 