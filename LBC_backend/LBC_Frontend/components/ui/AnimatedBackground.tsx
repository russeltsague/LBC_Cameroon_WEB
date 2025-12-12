'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

export const AnimatedBackground = () => {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  return (
    <motion.div 
      style={{ opacity }} 
      className="fixed top-0 left-0 w-full h-screen pointer-events-none z-50 bg-gradient-to-b from-black/30 to-transparent" 
    />
  )
}