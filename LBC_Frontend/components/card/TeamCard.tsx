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
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover="hover"
      initial="initial"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 p-6 shadow-xl"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.15), transparent 80%)`
        }}
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 }
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-orange-500/20 text-orange-300">
            {category}
          </span>
          <span className="text-xs text-gray-400">Est. {founded}</span>
        </div>
        
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="relative w-32 h-32 mb-4"
          >
            <Image
              src={`/teams/${logo}`}
              alt={name}
              fill
              className="object-contain"
            />
          </motion.div>
          <h3 className="text-2xl font-bold text-center text-white">{name}</h3>
          <p className="text-gray-400">{city}</p>
        </div>
        
        <div className="flex justify-center">
          <Link href={`/teams/${id}`} passHref>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium text-sm shadow-lg shadow-orange-500/20"
            >
              Team Details
            </motion.a>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}