'use client'
import { NewsSection } from '@/components/sections/News'
import { Navbar } from '@/components/ui/Navbar'

export default function NewsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <NewsSection />
      </main>
    </>
  )
} 