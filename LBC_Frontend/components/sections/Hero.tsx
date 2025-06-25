// components/HeroSection.tsx
'use client'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

export const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  }

  return (
    <section className="relative h-[110vh] min-h-[800px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-orange-900/80 z-0">
        {/* <Image
          src="/images/hero-court.jpg"
          alt="Terrain de basket"
          fill
          className="object-cover mix-blend-overlay"
          priority
          quality={100}
        /> */}
      </div>

      <motion.div
        className="relative z-10 container px-6 mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-block px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full text-sm font-semibold tracking-wider">
            SAISON 2024-2025
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">LIGUE DU CENTRE</span><br />
          DE BASKET DU CAMEROUN
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-10">
          Le sommet de la compétition de basket-ball avec les meilleures équipes du pays
        </motion.p>

        <motion.div variants={itemVariants}>
          <button
            className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold text-white rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-amber-600 hover:to-amber-700 transition-all duration-300"
            onClick={() => {
              const calendarElement = document.getElementById('calendar');
              if (calendarElement) {
                const yOffset = -80;
                const y = calendarElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
          >
            <span className="relative z-10">EXPLORER LA LIGUE</span>
            <ArrowRightIcon className="ml-3 w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}