'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiCalendar, 
  FiFileText, 
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUpload
} from 'react-icons/fi'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthGuard } from '@/components/admin/AuthGuard'

interface Report {
  id: number
  season: string
  reportTitle: string
  date: string
  secretary: string
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
  matchCount: number
  hasSanctions: boolean
  hasClassifications: boolean
}

const mockReports: Report[] = [
  {
    id: 1,
    season: 'Saison sportive 2024 – 2025',
    reportTitle: 'RAPPORT COMMISSION SPORTIVE N°12',
    date: 'Yaoundé, le 12 mai 2025',
    secretary: 'Le Secrétaire Général',
    status: 'published',
    createdAt: '2025-05-12T10:00:00Z',
    updatedAt: '2025-05-12T10:00:00Z',
    matchCount: 12,
    hasSanctions: true,
    hasClassifications: true
  },
  {
    id: 2,
    season: 'Saison sportive 2024 – 2025',
    reportTitle: 'RAPPORT COMMISSION SPORTIVE N°11',
    date: 'Yaoundé, le 5 mai 2025',
    secretary: 'Le Secrétaire Général',
    status: 'published',
    createdAt: '2025-05-05T10:00:00Z',
    updatedAt: '2025-05-05T10:00:00Z',
    matchCount: 8,
    hasSanctions: false,
    hasClassifications: false
  },
  {
    id: 3,
    season: 'Saison sportive 2024 – 2025',
    reportTitle: 'RAPPORT COMMISSION SPORTIVE N°10',
    date: 'Yaoundé, le 28 avril 2025',
    secretary: 'Le Secrétaire Général',
    status: 'published',
    createdAt: '2025-04-28T10:00:00Z',
    updatedAt: '2025-04-28T10:00:00Z',
    matchCount: 15,
    hasSanctions: true,
    hasClassifications: true
  },
  {
    id: 4,
    season: 'Saison sportive 2024 – 2025',
    reportTitle: 'RAPPORT COMMISSION SPORTIVE N°9',
    date: 'Yaoundé, le 21 avril 2025',
    secretary: 'Le Secrétaire Général',
    status: 'draft',
    createdAt: '2025-04-21T10:00:00Z',
    updatedAt: '2025-04-22T15:30:00Z',
    matchCount: 10,
    hasSanctions: false,
    hasClassifications: false
  }
]

const statusColors = {
  published: 'bg-green-500/10 text-green-400 border-green-500/20',
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

const statusLabels = {
  published: 'Publié',
  draft: 'Brouillon',
  archived: 'Archivé'
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.season.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDeleteReport = (report: Report) => {
    setReportToDelete(report)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (reportToDelete) {
      setReports(reports.filter(r => r.id !== reportToDelete.id))
      setShowDeleteModal(false)
      setReportToDelete(null)
    }
  }

  const handlePublishReport = (reportId: number) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'published' as const, updatedAt: new Date().toISOString() }
        : report
    ))
  }

  const handleArchiveReport = (reportId: number) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'archived' as const, updatedAt: new Date().toISOString() }
        : report
    ))
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestion des Rapports</h1>
              <p className="text-gray-400">Créez et gérez les rapports de la commission sportive</p>
            </div>
            <button
              onClick={() => router.push('/admin/reports/create')}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-orange-500/20"
            >
              <FiPlus className="mr-2" />
              Nouveau Rapport
            </button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total Rapports</p>
                  <p className="text-2xl font-bold text-white mt-1">{reports.length}</p>
                </div>
                <FiFileText className="text-blue-400 text-xl" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Publiés</p>
                  <p className="text-2xl font-bold text-white mt-1">{reports.filter(r => r.status === 'published').length}</p>
                </div>
                <FiEye className="text-green-400 text-xl" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Brouillons</p>
                  <p className="text-2xl font-bold text-white mt-1">{reports.filter(r => r.status === 'draft').length}</p>
                </div>
                <FiEdit2 className="text-yellow-400 text-xl" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">Total Matchs</p>
                  <p className="text-2xl font-bold text-white mt-1">{reports.reduce((sum, r) => sum + r.matchCount, 0)}</p>
                </div>
                <FiCalendar className="text-purple-400 text-xl" />
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un rapport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    statusFilter === status
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {status === 'all' ? 'Tous' : statusLabels[status]}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Reports Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rapport</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Saison</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Matchs</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contenu</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{report.reportTitle}</p>
                          <p className="text-gray-400 text-sm mt-1">Créé le {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{report.season}</td>
                      <td className="px-6 py-4 text-gray-300">{report.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[report.status]}`}>
                          {statusLabels[report.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{report.matchCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {report.hasSanctions && (
                            <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs border border-red-500/20">Sanctions</span>
                          )}
                          {report.hasClassifications && (
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20">Classements</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/reports/${report.id}`)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Voir"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/reports/${report.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          {report.status === 'draft' && (
                            <button
                              onClick={() => handlePublishReport(report.id)}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                              title="Publier"
                            >
                              <FiUpload className="w-4 h-4" />
                            </button>
                          )}
                          {report.status === 'published' && (
                            <button
                              onClick={() => handleArchiveReport(report.id)}
                              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                              title="Archiver"
                            >
                              <FiDownload className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReport(report)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <FiFileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Aucun rapport trouvé</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres de recherche' 
                  : 'Commencez par créer votre premier rapport'
                }
              </p>
            </motion.div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && reportToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirmer la suppression</h3>
              <p className="text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer le rapport "{reportToDelete.reportTitle}" ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AdminLayout>
    </AuthGuard>
  )
}
