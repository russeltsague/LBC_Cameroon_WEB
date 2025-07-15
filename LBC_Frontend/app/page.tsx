'use client'
import type { NextPage } from 'next'
import Head from 'next/head'
import { motion, useScroll, useTransform } from 'framer-motion'
import { HeroSection } from '@/components/sections/Hero'
// import { Navbar } from '@/components/ui/Navbar'

const Home: NextPage = () => {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  return (
    <>
      <Head>
        <title>LIGUE DE BASKETBALL DU CENTRE</title>
        <meta name="description" content="Official website of Cameroon's premier basketball competition" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <Navbar /> */}

      {/* Transparent overlay that fades on scroll */}
      <motion.div 
        style={{ opacity }} 
        className="fixed top-0 left-0 w-full h-screen pointer-events-none z-50 bg-gradient-to-b from-black/30 to-transparent" 
      />

      <main className="relative overflow-hidden pt-16">
        {/* 1. Hero Section - First impression */}
        <HeroSection />
      </main>
    </>
  )
}

export default Home