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
      className="group relative overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:border-[var(--color-primary)]/30"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(243, 156, 18, 0.1), transparent 80%)`
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
            {category}
          </span>
          <span className="text-xs text-gray-400 font-medium">Est. {founded}</span>
        </div>

        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ y: -8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative w-32 h-32 mb-6 drop-shadow-2xl"
          >
            <Image
              src={`/teams/${logo}`}
              alt={name}
              fill
              className="object-contain"
            />
          </motion.div>
          <h3 className="text-2xl font-display font-bold text-center text-white mb-1 group-hover:text-[var(--color-primary)] transition-colors">{name}</h3>
          <p className="text-gray-400 text-sm font-medium">{city}</p>
        </div>

        <div className="flex justify-center">
          <Link href={`/teams/${id}`} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 transition-all duration-300"
            >
              Voir l'équipe
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}