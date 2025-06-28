'use client'
import { FeaturedSection } from '@/components/sections/Featured'
import { Navbar } from '@/components/ui/Navbar'

export default function FeaturedPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <FeaturedSection />
      </main>
    </>
  )
} 