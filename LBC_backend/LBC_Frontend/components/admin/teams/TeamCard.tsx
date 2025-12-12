'use client'

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiUsers, FiMapPin } from 'react-icons/fi'
import Image from 'next/image'
import { Team } from '@/app/lib/api'

interface TeamCardProps {
  team: Team
  onEdit: (team: Team) => void
  onDelete: (teamId: string) => void
  onToggleStatus?: (teamId: string) => void
}

export const TeamCard = ({ team, onEdit, onDelete, onToggleStatus }: TeamCardProps) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleStatus) {
      onToggleStatus(team._id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(team)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(team._id)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  return (
    <motion.div
      layout
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:border-[var(--color-primary)]/30 border border-white/10"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(243, 156, 18, 0.1), transparent 80%)`
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {team.category && (
              <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                {team.category}
              </span>
            )}
            {team.poule && (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-white/5 text-gray-300 border border-white/10">
                Poule {team.poule}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {onToggleStatus && (
              <button
                onClick={handleStatusToggle}
                className={`p-1.5 rounded-md transition-colors ${
                  team.isActive !== false
                    ? 'text-green-500 hover:bg-green-500/10'
                    : 'text-gray-500 hover:bg-gray-500/10'
                }`}
                title={team.isActive !== false ? 'Désactiver' : 'Activer'}
              >
                {team.isActive !== false ? (
                  <FiToggleRight className="w-4 h-4" />
                ) : (
                  <FiToggleLeft className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center mb-6">
          <motion.div
            whileHover={{ y: -4, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative w-20 h-20 mb-4 bg-white/5 rounded-full flex items-center justify-center border border-white/10 overflow-hidden"
          >
            {team.logo ? (
              <Image
                src={team.logo}
                alt={team.name}
                width={64}
                height={64}
                className="object-contain w-3/4 h-3/4"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-500">{team.name.charAt(0)}</span>
            )}
          </motion.div>
          <h3 className="text-xl font-bold text-center text-white mb-1 group-hover:text-[var(--color-primary)] transition-colors">
            {team.name}
          </h3>
          
          {(team.city || team.coach) && (
            <div className="mt-2 text-sm text-gray-400 text-center space-y-1">
              {team.city && (
                <div className="flex items-center justify-center">
                  <FiMapPin className="w-3.5 h-3.5 mr-1" />
                  <span>{team.city}</span>
                </div>
              )}
              {team.coach && (
                <div className="flex items-center justify-center">
                  <FiUsers className="w-3.5 h-3.5 mr-1" />
                  <span>{team.coach}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-2">
          <button
            onClick={handleEdit}
            className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors flex items-center space-x-2"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Modifier</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center space-x-2"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
