'use client'
import type { NextPage } from 'next'
import Head from 'next/head'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HeroSection } from '@/components/sections/Hero'
import { FeaturedSection } from '@/components/sections/Featured'
import { StatsSection } from '@/components/sections/Stats'
import { NewsSection } from '@/components/sections/News'
import { CalendarSection } from '@/components/sections/Calendar'
import { ClassificationSection } from '@/components/sections/Classification'
import { ScheduleSection } from '@/components/sections/Schedule'
import { TeamsPreviewSection } from '@/components/sections/TeamPreview'
import { SponsorsSection } from '@/components/sections/Sponsors'
import { CtaSection } from '@/components/sections/Cta'

const Home: NextPage = () => {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  return (
    <>
      <Head>
        <title>Cameroon Basketball League | Elite Competition</title>
        <meta name="description" content="Official website of Cameroon's premier basketball competition" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Transparent overlay that fades on scroll */}
      <motion.div 
        style={{ opacity }} 
        className="fixed top-0 left-0 w-full h-screen pointer-events-none z-50 bg-gradient-to-b from-black/30 to-transparent" 
      />

      <main className="relative overflow-hidden">
        {/* 1. Hero Section - First impression */}
        <HeroSection />

        {/* 2. Featured Section - Highlights or important announcements */}
        <FeaturedSection />

        {/* 3. Stats Section - League statistics at a glance */}
        <StatsSection />

        {/* 4. Calendar Section - Upcoming matches */}
        <CalendarSection />

        {/* 5. Classification Section - Current standings */}
        <ClassificationSection />

        {/* 6. Schedule Section - Weekly matches */}
        <ScheduleSection />


        {/* 8. News Section - Latest updates */}
        <NewsSection />

        {/* 9. Sponsors Section - Partner recognition */}
        <SponsorsSection />

        {/* 10. Call-to-Action Section - Newsletter signup or social links */}
        <CtaSection />
      </main>
    </>
  )
}

export default Home