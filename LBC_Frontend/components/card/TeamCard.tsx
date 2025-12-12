import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface TeamCardProps {
  id: string
  name: string
  city: string
  logo: string
  category: string
  founded: number
}

export const TeamCard = ({ id, name, city, logo, category, founded }: TeamCardProps) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover="hover"
      initial="initial"
      className="group relative overflow-hidden rounded-xl sm:rounded-2xl glass p-4 sm:p-6 transition-all duration-300 hover:border-[var(--color-primary)]/30"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(243, 156, 18, 0.1), transparent 80%)`
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold tracking-wider rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
            {category}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Est. {founded}</span>
        </div>

        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <motion.div
            whileHover={{ y: -4, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mb-3 sm:mb-6 drop-shadow-lg"
          >
            <Image
              src={`/teams/${logo}`}
              alt={name}
              fill
              className="object-contain"
            />
          </motion.div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-center text-white mb-1 group-hover:text-[var(--color-primary)] transition-colors leading-tight">{name}</h3>
          <p className="text-gray-400 text-xs sm:text-sm font-medium">{city}</p>
        </div>

        <div className="flex justify-center">
          <Link href={`/teams/${id}`} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 transition-all duration-300"
            >
              Voir l'équipe
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}