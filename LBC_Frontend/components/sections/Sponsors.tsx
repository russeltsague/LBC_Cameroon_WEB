'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiGlobe, FiMail, FiPhone, FiAward } from 'react-icons/fi'
import { getActiveSponsors, Sponsor } from '@/app/lib/api'

export const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  const sponsorshipLevels = [
    'Platinum',
    'Gold',
    'Silver',
    'Bronze',
    'Partner' 
  ]

  useEffect(() => {
    // Restore last selected level from localStorage if available and valid
    const savedLevel = typeof window !== 'undefined' ? localStorage.getItem('sponsorLevel') : null;
    const validSaved = sponsorshipLevels.find(level => level === savedLevel);
    if (savedLevel && validSaved) {
      setSelectedLevel(savedLevel)
    } else if (sponsorshipLevels.length > 0) {
      setSelectedLevel('')
    }
  }, [sponsorshipLevels])

  useEffect(() => {
    if (selectedLevel !== undefined) {
      localStorage.setItem('sponsorLevel', selectedLevel)
      // fetch data here if needed
    }
  }, [selectedLevel])

  useEffect(() => {
    fetchSponsors()
  }, [selectedLevel])

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const sponsorsData = await getActiveSponsors(selectedLevel || undefined)
      setSponsors(sponsorsData)
    } catch (err) {
      console.error('Error fetching sponsors:', err)
      setError('Failed to load sponsors')
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'text-purple-400 border-purple-400'
      case 'Gold': return 'text-yellow-400 border-yellow-400'
      case 'Silver': return 'text-gray-400 border-gray-400'
      case 'Bronze': return 'text-orange-600 border-orange-600'
      default: return 'text-blue-400 border-blue-400'
    }
  }

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-500/10'
      case 'Gold': return 'bg-yellow-500/10'
      case 'Silver': return 'bg-gray-500/10'
      case 'Bronze': return 'bg-orange-600/10'
      default: return 'bg-blue-500/10'
    }
  }

  return (
    <section className="py-6 sm:py-16 md:py-20 bg-gray-950">
      <div className="container px-4 sm:px-6 md:px-8 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 md:mb-4">
            Nos <span className="text-orange-400">Sponsors</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-300 max-w-xl md:max-w-2xl mx-auto">
            Merci à nos partenaires pour leur soutien à la ligue
          </p>
        </motion.div>

        {/* Level Selector: Dropdown for small/medium, buttons for large+ */}
        <div className="mb-8">
          <div className="lg:hidden flex justify-center">
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All</option>
              {sponsorshipLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="hidden lg:flex flex-wrap justify-center gap-2 mt-4">
            <button
              onClick={() => setSelectedLevel("")}
              className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap text-sm ${
                selectedLevel === ""
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {sponsorshipLevels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap text-sm ${
                  selectedLevel === level
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading sponsors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : sponsors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-orange-500/50 transition-colors ${getLevelBgColor(sponsor.sponsorshipLevel)}`}
              >
                <div className="text-center mb-4">
                  <div className="relative h-20 w-full mb-4">
                    <Image 
                      src={sponsor.logoUrl} 
                      alt={sponsor.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{sponsor.name}</h3>
                  
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getLevelColor(sponsor.sponsorshipLevel)}`}>
                    {sponsor.sponsorshipLevel}
                  </span>
                </div>

                {sponsor.description && (
                  <p className="text-gray-300 text-sm mb-4 text-center">
                    {sponsor.description}
                  </p>
                )}

                <div className="space-y-2">
                  {sponsor.contactEmail && (
                    <div className="flex items-center text-sm text-gray-400">
                      <FiMail className="w-4 h-4 mr-2" />
                      <a 
                        href={`mailto:${sponsor.contactEmail}`}
                        className="hover:text-orange-400 transition-colors"
                      >
                        {sponsor.contactEmail}
                      </a>
                    </div>
                  )}
                  
                  {sponsor.contactPhone && (
                    <div className="flex items-center text-sm text-gray-400">
                      <FiPhone className="w-4 h-4 mr-2" />
                      <a 
                        href={`tel:${sponsor.contactPhone}`}
                        className="hover:text-orange-400 transition-colors"
                      >
                        {sponsor.contactPhone}
                      </a>
                    </div>
                  )}
                  
                  {sponsor.websiteUrl && (
                    <div className="flex items-center text-sm text-gray-400">
                      <FiGlobe className="w-4 h-4 mr-2" />
                      <a 
                        href={sponsor.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-orange-400 transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {(sponsor.startDate || sponsor.endDate) && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center text-sm text-gray-400">
                      <FiAward className="w-4 h-4 mr-2" />
                      <span>
                        {sponsor.startDate && new Date(sponsor.startDate).getFullYear()}
                        {sponsor.startDate && sponsor.endDate && ' - '}
                        {sponsor.endDate && new Date(sponsor.endDate).getFullYear()}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {selectedLevel 
              ? `No ${selectedLevel} sponsors found`
              : 'No sponsors available at the moment'
            }
          </div>
        )}
      </div>
    </section>
  )
}