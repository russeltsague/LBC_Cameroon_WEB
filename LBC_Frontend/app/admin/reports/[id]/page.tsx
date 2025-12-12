'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiPrinter,
  FiDownload,
  FiCalendar,
  FiFileText,
  FiAward,
  FiEye,
  FiEyeOff,
  FiShare2
} from 'react-icons/fi'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthGuard } from '@/components/admin/AuthGuard'

interface MatchResult {
  day: string
  matches: {
    category: string
    results: string[]
  }[]
}

interface Sanction {
  date: string
  name: string
  teamNumber: string
  category: string
  sanction: string
  amount: string
  observation: string
}

interface Classification {
  title: string
  headers: string[]
  rows: string[][]
}

interface Report {
  id: number
  season: string
  reportTitle: string
  date: string
  secretary: string
  decisions: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  matchResults: MatchResult[]
  sanctions: Sanction[]
  classifications: Classification[]
}

export default async function ViewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<Report | null>(null)
  const [showFullContent, setShowFullContent] = useState(true)

  // Await params to get the id
  const { id } = await params

  useEffect(() => {
    // Simulate loading report data
    const mockReport: Report = {
      id: parseInt(id),
      season: 'Saison sportive 2024 – 2025',
      reportTitle: 'RAPPORT COMMISSION SPORTIVE N°12',
      date: 'Yaoundé, le 12 mai 2025',
      secretary: 'Le Secrétaire Général',
      decisions: 'Toutes les rencontres sont homologuées sous les scores acquis sur le terrain.',
      status: 'published',
      createdAt: '2025-05-12T10:00:00Z',
      updatedAt: '2025-05-12T10:00:00Z',
      matchResults: [
        {
          day: 'Samedi, 10 mai 2025',
          matches: [
            { category: 'U18 FILLES', results: ['SANTA B.  17 – 45  FUSEE'] },
            { category: 'L2A MESSIEURS', results: ['ALPH2   42 – 47  MENDONG', 'LENA   37 – 41  KLOES YD2'] },
            { category: 'L2B MESSIEURS', results: ['APEJES2  25 – 60  MBALMAYO', 'PHISLAMA  49 – 73  MBALMAYO'] },
            { category: 'DAMES', results: ['FAP2   38 – 26  MC NOAH'] },
            { category: 'L1 MESSIEURS', results: ['MC NOAH  71 – 58  NYBA'] }
          ]
        },
        {
          day: 'Dimanche, 11 mai 2025',
          matches: [
            { category: 'L2B MESSIEURS', results: ['MBOA BB  20 – 00  SANTA B.', 'PHISLAMA  52 – 59  HAND OF GOD'] },
            { category: 'L2A MESSIEURS', results: ['MESSASSI  71 – 73  AS KEEP', 'ALL SPORT  49 – 37  BOFIA', 'SEED EXP.  29 – 50  FUSEE', 'MARY JO  51 – 70  APEJES'] },
            { category: 'DAMES', results: ['ONYX   41 – 65  OVERDOSE', 'LENA   24 – 32  AS KEEP2'] },
            { category: 'L1 MESSIEURS', results: ['ETOUDI  61 – 79  WILDCATS', 'FALCONS  67 – 78  ANGELS'] }
          ]
        }
      ],
      sanctions: [
        {
          date: '10/05/25',
          name: 'ESSENA L.',
          teamNumber: '11',
          category: 'MC NOAH',
          sanction: 'DAMES Antisportive (U2)',
          amount: '2 000',
          observation: 'IMPAYÉ'
        },
        {
          date: '10/05/25',
          name: 'ANGO D.',
          teamNumber: '12',
          category: 'MC NOAH',
          sanction: 'MESSIEURS L1 Antisportive (U2)',
          amount: '2 000',
          observation: 'IMPAYÉ'
        },
        {
          date: '11/05/25',
          name: 'NGONO C.',
          teamNumber: '12',
          category: 'SEED EXP.',
          sanction: 'MESSIEURS L2A Antisportive (U2)',
          amount: '2 000',
          observation: 'IMPAYÉ'
        }
      ],
      classifications: [
        {
          title: 'CATEGORIE U18 FILLES',
          headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
          rows: [
            ['1er', 'LENA', '7', '6', '1', '13', '270', '155', '+115'],
            ['2e', 'FAP', '5', '5', '0', '10', '281', '156', '+125'],
            ['3e', 'FX VOGT', '5', '4', '1', '9', '200', '105', '+95'],
            ['4e', 'MARIK KLOES', '5', '4', '1', '9', '197', '115', '+82'],
            ['5e', 'FUSEE', '6', '3', '3', '9', '250', '231', '+19']
          ]
        },
        {
          title: 'CATEGORIE L1 MESSIEURS',
          headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
          rows: [
            ['1er', 'BEAC', '7', '7', '0', '14', '569', '278', '+291'],
            ['2e', 'FAP', '7', '7', '0', '14', '475', '233', '+242'],
            ['3e', 'MC NOAH', '8', '6', '2', '14', '491', '394', '+97'],
            ['4e', '512 SA', '8', '5', '3', '13', '462', '481', '-19']
          ]
        }
      ]
    }

    setTimeout(() => {
      setReport(mockReport)
      setLoading(false)
    }, 500)
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Here you would implement PDF generation or download functionality
    console.log('Downloading report:', report?.reportTitle)
  }

  const handleShare = () => {
    // Here you would implement share functionality
    if (navigator.share) {
      navigator.share({
        title: report?.reportTitle,
        text: `Rapport de la commission sportive - ${report?.date}`,
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papiers!')
    }
  }

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

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!report) {
    return (
      <AuthGuard>
        <AdminLayout>
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Rapport non trouvé</h2>
              <p className="text-gray-400 mb-6">Le rapport demandé n'existe pas ou a été supprimé.</p>
              <button
                onClick={() => router.push('/admin/reports')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
              >
                Retour aux rapports
              </button>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/reports')}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{report.reportTitle}</h1>
                <p className="text-gray-400">{report.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[report.status]}`}>
                {statusLabels[report.status]}
              </span>
              
              <button
                onClick={() => router.push(`/admin/reports/${report.id}/edit`)}
                className="flex items-center px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
              >
                <FiEdit2 className="mr-2" />
                Modifier
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
              >
                <FiPrinter className="mr-2" />
                Imprimer
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
              >
                <FiDownload className="mr-2" />
                Télécharger
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
              >
                <FiShare2 className="mr-2" />
                Partager
              </button>
            </div>
          </motion.div>

          {/* Federation Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center p-8 bg-gradient-to-br from-orange-500/10 to-red-600/10 rounded-2xl border border-orange-500/20"
          >
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600 mb-2">
              FEDERATION CAMEROUNAISE DE BASKETBALL
            </h1>
            <p className="text-lg md:text-xl text-white font-medium tracking-wide">LIGUE DE BASKETBALL DU CENTRE</p>
            <div className="mt-4 text-sm md:text-base text-gray-400 space-y-1">
              <p>1er Étage face carrefour régie – BP 1107 YAOUNDE</p>
              <p>(+237) 690 450 998 / 651 196 152</p>
              <p className="text-orange-400">liguedebasketducentre@gmail.com</p>
            </div>
          </motion.div>

          {/* Report Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-2">{report.season}</p>
                <h2 className="text-2xl font-bold text-white mb-4">{report.reportTitle}</h2>
                <div className="flex items-center space-x-4 text-gray-300">
                  <span className="font-medium">{report.date}</span>
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  <span className="font-bold">{report.secretary}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Créé le {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p>Modifié le {new Date(report.updatedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Toggle Content View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="flex items-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
            >
              {showFullContent ? <FiEyeOff className="mr-2" /> : <FiEye className="mr-2" />}
              {showFullContent ? 'Masquer le contenu' : 'Afficher le contenu'}
            </button>
          </motion.div>

          {showFullContent && (
            <>
              {/* Match Results Section */}
              {report.matchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex items-center mb-6">
                    <FiCalendar className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-white">RÉSULTATS DES RENCONTRES</h2>
                  </div>

                  {report.matchResults.map((day, dayIndex) => (
                    <motion.div
                      key={dayIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + dayIndex * 0.1 }}
                      className="bg-white/5 rounded-2xl overflow-hidden border border-white/10"
                    >
                      <div className="p-6 pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                              <FiCalendar className="h-5 w-5 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white capitalize">{day.day}</h3>
                          </div>
                          <span className="px-3 py-1 text-xs font-medium bg-white/5 text-orange-400 rounded-full border border-white/10">
                            {day.matches.reduce((sum, match) => sum + match.results.length, 0)} matchs
                          </span>
                        </div>

                        <div className="space-y-4">
                          {day.matches.map((match, matchIndex) => (
                            <div key={matchIndex} className="bg-white/5 rounded-xl overflow-hidden border border-white/5">
                              <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex items-center">
                                <div className="h-2 w-2 rounded-full bg-orange-500 mr-3"></div>
                                <h4 className="text-sm font-bold text-white tracking-wider">{match.category}</h4>
                                <span className="ml-auto text-xs text-gray-400">{match.results.length} match{match.results.length > 1 ? 's' : ''}</span>
                              </div>
                              <div className="divide-y divide-white/5">
                                {match.results.map((result, resultIndex) => (
                                  <div key={resultIndex} className="px-5 py-4">
                                    <div className="flex items-center w-full">
                                      <div className="flex-1 text-right pr-4">
                                        <div className="text-sm font-medium text-gray-300">
                                          {result.split('–')[0]?.trim()}
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0 mx-2">
                                        <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                                          <span className="w-8 text-center text-base font-bold text-orange-500">
                                            {result.match(/(\d+)\s*–/)?.[1]}
                                          </span>
                                          <span className="text-gray-500 text-xs">-</span>
                                          <span className="w-8 text-center text-base font-bold text-white">
                                            {result.match(/–\s*(\d+)/)?.[1]}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex-1 pl-4">
                                        <div className="text-sm font-medium text-gray-300">
                                          {result.split('–')[1]?.trim()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Decisions Section */}
              {report.decisions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/5 rounded-2xl p-8 border border-white/10"
                >
                  <div className="flex items-center mb-6">
                    <FiAward className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-white">DÉCISIONS</h2>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border-l-4 border-orange-500">
                    <p className="text-gray-200 text-lg leading-relaxed">{report.decisions}</p>
                  </div>
                </motion.div>
              )}

              {/* Sanctions Section */}
              {report.sanctions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-6"
                >
                  <div className="flex items-center mb-6">
                    <FiAward className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-white">RECAPITULATIF DES SANCTIONS</h2>
                  </div>

                  <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-black/40">
                          <tr>
                            <th className="px-4 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">DATES</th>
                            <th className="px-4 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">NOMS</th>
                            <th className="px-4 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">N° EQUIPES</th>
                            <th className="px-4 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">CATEGORIES</th>
                            <th className="px-4 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">SANCTIONS</th>
                            <th className="px-4 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">MONTANTS</th>
                            <th className="px-4 py-4 text-left text-xs font-bold text-orange-400 uppercase tracking-wider">OBSERVATION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {report.sanctions.map((sanction, index) => (
                            <tr key={index} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-4 text-gray-300">{sanction.date}</td>
                              <td className="px-4 py-4 text-gray-300">{sanction.name}</td>
                              <td className="px-4 py-4 text-gray-300">{sanction.teamNumber}</td>
                              <td className="px-4 py-4 text-gray-300">{sanction.category}</td>
                              <td className="px-4 py-4 text-gray-300">{sanction.sanction}</td>
                              <td className="px-4 py-4 text-gray-300">{sanction.amount}</td>
                              <td className="px-4 py-4 text-gray-300">{sanction.observation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-6 py-3 bg-black/20 border-t border-white/5">
                      <p className="text-xs text-gray-500">
                        NB : AUCUN(E) N'EQUIPE/JOUEUR NE JOUERA SANS S'ETRE ACQUITTE DE TOUTES SES SANCTIONS.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Classifications Section */}
              {report.classifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-6"
                >
                  <div className="flex items-center mb-6">
                    <FiAward className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-white">CLASSEMENTS</h2>
                  </div>

                  {report.classifications.map((classification, classIndex) => (
                    <motion.div
                      key={classIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + classIndex * 0.1 }}
                      className="bg-white/5 rounded-2xl p-6 border border-white/10"
                    >
                      <div className="mb-4 flex items-center space-x-2">
                        <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                        <h3 className="text-lg font-bold text-white">{classification.title}</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                          <thead className="bg-black/40">
                            <tr>
                              {classification.headers.map((header, idx) => (
                                <th
                                  key={idx}
                                  scope="col"
                                  className={`px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider ${idx > 0 ? 'text-center' : ''}`}
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 bg-white/5">
                            {classification.rows.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className={`transition-colors duration-200 hover:bg-white/10 ${rowIdx < 4 ? 'bg-orange-500/5' : ''}`}
                              >
                                {row.map((cell, cellIdx) => (
                                  <td
                                    key={cellIdx}
                                    className={`px-3 py-3 whitespace-nowrap text-sm ${cellIdx === 0
                                        ? rowIdx === 0 ? 'text-orange-500 font-bold text-base' : 'text-gray-500 font-medium'
                                        : 'text-gray-300 text-center font-medium'
                                      }`}
                                  >
                                    {cell}
                                    {cellIdx === 0 && rowIdx < 4 && (
                                      <span className="ml-1 text-xs opacity-80">
                                        {rowIdx === 0 ? '🏆' : rowIdx === 1 ? '🥈' : rowIdx === 2 ? '🥉' : ''}
                                      </span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
