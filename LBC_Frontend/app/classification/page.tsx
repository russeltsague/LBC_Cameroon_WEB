'use client'
import Classification from '@/components/sections/Classification'
import { Navbar } from '@/components/ui/Navbar'

export default function ClassificationPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <Classification />
      </main>
    </>
  )
} 