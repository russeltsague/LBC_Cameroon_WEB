'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ReportSection } from '@/components/sections/ReportSection';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const reportRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-background)]">
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: y1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[var(--color-secondary)] to-[var(--color-primary-dark)] opacity-40" />
          <div className="absolute inset-0 bg-[url('/images/court-texture.png')] opacity-5 mix-blend-overlay" />

          {/* Abstract shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[var(--color-primary)] blur-[120px] opacity-20 animate-float" />
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[var(--color-accent)] blur-[120px] opacity-10 animate-float" style={{ animationDelay: '2s' }} />
          </div>
        </motion.div>

        {/* Floating basketball */}
        {/* <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 opacity-20 pointer-events-none"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/images/basketball.png"
            alt="Basketball"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </motion.div> */}

        <motion.div
          className="relative z-10 container px-4 sm:px-6 mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ opacity }}
        >
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <span className="inline-block px-4 py-1.5 sm:px-6 sm:py-2 bg-white/5 backdrop-blur-md border border-white/10 text-[var(--color-primary)] rounded-full text-xs sm:text-sm md:text-base font-bold tracking-widest shadow-lg uppercase">
              Saison 2025-2026
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-display font-extrabold text-white mb-6 sm:mb-8 leading-tight tracking-tight"
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              LIGUE DE BASKETBALL
            </span>
            <span className="block text-[var(--color-primary)] drop-shadow-lg">
              DU CENTRE
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-xl sm:max-w-2xl md:max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed font-light"
          >
            Le sommet de la compétition avec les meilleures équipes du Cameroun.
            <span className="text-white font-medium"> Passion, Talent, Gloire.</span>
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link href="/teams" className="group w-full sm:w-auto">
              <button
                className="w-full sm:w-auto relative px-6 py-3 sm:px-8 sm:py-4 bg-[var(--color-primary)] text-white font-bold rounded-lg sm:rounded-xl shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center justify-center">
                  EXPLORER
                  <ArrowRightIcon className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            <Link href="/schedule" className="group w-full sm:w-auto">
              <button
                className="w-full sm:w-auto relative px-6 py-3 sm:px-8 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-bold rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base"
              >
                <span className="relative z-10 flex items-center justify-center">
                  CALENDRIER
                  <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <span className="text-xs uppercase tracking-widest mb-3">Découvrir</span>
          <motion.div
            className="w-6 h-10 border-2 border-[var(--color-primary)]/50 rounded-full flex justify-center p-1"
          >
            <motion.div
              className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"
              animate={{
                y: [0, 12, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Report Section */}
      <div ref={reportRef} className="relative z-10 bg-[var(--color-background)]">
        <ReportSection />
      </div>
    </>
  );
};

export { HeroSection };
