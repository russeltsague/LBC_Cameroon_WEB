'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit2, FiTrash, FiPlus, FiToggleLeft, FiToggleRight, FiCalendar, FiMail, FiPhone, FiGlobe } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { Sponsor, getAllSponsors, createSponsor, updateSponsor, deleteSponsor, toggleSponsorStatus } from '@/app/lib/api'

const SPONSORSHIP_LEVELS = [
  'Platinum',
  'Gold', 
  'Silver',
  'Bronze',
  'Partner'
]

export function SponsorManagement() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
    sponsorshipLevel: 'Partner',
    isActive: true,
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      const sponsorsData = await getAllSponsors()
      setSponsors(sponsorsData)
    } catch (error) {
      console.error('Error fetching sponsors:', error)
      toast.error('Failed to load sponsors')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSponsor) {
        await updateSponsor(editingSponsor._id, formData)
        toast.success('Sponsor updated successfully')
      } else {
        await createSponsor(formData)
        toast.success('Sponsor created successfully')
      }
      
      setIsModalOpen(false)
      setEditingSponsor(null)
      resetForm()
      fetchSponsors()
    } catch (error) {
      console.error('Error saving sponsor:', error)
      toast.error('Failed to save sponsor')
    }
  }

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor)
    setFormData({
      name: sponsor.name,
      description: sponsor.description || '',
      logoUrl: sponsor.logoUrl,
      websiteUrl: sponsor.websiteUrl || '',
      contactEmail: sponsor.contactEmail || '',
      contactPhone: sponsor.contactPhone || '',
      sponsorshipLevel: sponsor.sponsorshipLevel,
      isActive: sponsor.isActive,
      startDate: sponsor.startDate ? sponsor.startDate.split('T')[0] : '',
      endDate: sponsor.endDate ? sponsor.endDate.split('T')[0] : ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return
    
    try {
      await deleteSponsor(id)
      toast.success('Sponsor deleted successfully')
      fetchSponsors()
    } catch (error) {
      console.error('Error deleting sponsor:', error)
      toast.error('Failed to delete sponsor')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleSponsorStatus(id)
      toast.success('Sponsor status updated')
      fetchSponsors()
    } catch (error) {
      console.error('Error toggling sponsor status:', error)
      toast.error('Failed to update sponsor status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      contactEmail: '',
      contactPhone: '',
      sponsorshipLevel: 'Partner',
      isActive: true,
      startDate: '',
      endDate: ''
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-500/20 text-purple-400'
      case 'Gold': return 'bg-yellow-500/20 text-yellow-400'
      case 'Silver': return 'bg-gray-400/20 text-gray-300'
      case 'Bronze': return 'bg-orange-600/20 text-orange-400'
      default: return 'bg-blue-500/20 text-blue-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Sponsor Management</h2>
        <button
          onClick={() => {
            setEditingSponsor(null)
            resetForm()
            setIsModalOpen(true)
          }}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Sponsor</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading sponsors...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((sponsor) => (
            <motion.div
              key={sponsor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{sponsor.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(sponsor.sponsorshipLevel)}`}>
                      {sponsor.sponsorshipLevel}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sponsor.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {sponsor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {sponsor.description && (
                    <p className="text-gray-300 mb-3">{sponsor.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                    {sponsor.contactEmail && (
                      <div className="flex items-center space-x-2">
                        <FiMail className="w-4 h-4" />
                        <span>{sponsor.contactEmail}</span>
                      </div>
                    )}
                    {sponsor.contactPhone && (
                      <div className="flex items-center space-x-2">
                        <FiPhone className="w-4 h-4" />
                        <span>{sponsor.contactPhone}</span>
                      </div>
                    )}
                    {sponsor.websiteUrl && (
                      <div className="flex items-center space-x-2">
                        <FiGlobe className="w-4 h-4" />
                        <a 
                          href={sponsor.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {sponsor.websiteUrl}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>Created: {formatDate(sponsor.createdAt)}</span>
                    </div>
                  </div>
                  
                  {(sponsor.startDate || sponsor.endDate) && (
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-3">
                      {sponsor.startDate && (
                        <span>Start: {formatDate(sponsor.startDate)}</span>
                      )}
                      {sponsor.endDate && (
                        <span>End: {formatDate(sponsor.endDate)}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(sponsor._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      sponsor.isActive
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                    title={sponsor.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {sponsor.isActive ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(sponsor)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sponsor._id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <FiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    rows={3}
                    maxLength={500}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Logo URL *</label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="https://example.com/logo.png"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Sponsorship Level *</label>
                    <select
                      value={formData.sponsorshipLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, sponsorshipLevel: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      required
                    >
                      {SPONSORSHIP_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="contact@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300">
                    Active sponsor
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setEditingSponsor(null)
                      resetForm()
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingSponsor ? 'Update Sponsor' : 'Create Sponsor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 