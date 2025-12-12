'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FiSave, 
  FiX, 
  FiPlus, 
  FiTrash2, 
  FiCalendar,
  FiFileText,
  FiAward,
  FiChevronDown,
  FiChevronUp
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

export default function CreateReportPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'basic' | 'matches' | 'sanctions' | 'classifications'>('basic')
  const [expandedDays, setExpandedDays] = useState<number[]>([])

  // Basic Report Info
  const [reportData, setReportData] = useState({
    season: 'Saison sportive 2024 – 2025',
    reportTitle: '',
    date: '',
    secretary: 'Le Secrétaire Général',
    decisions: '',
    status: 'draft' as 'draft' | 'published'
  })

  // Match Results
  const [matchResults, setMatchResults] = useState<MatchResult[]>([
    {
      day: '',
      matches: [
        { category: '', results: [''] }
      ]
    }
  ])

  // Sanctions
  const [sanctions, setSanctions] = useState<Sanction[]>([
    {
      date: '',
      name: '',
      teamNumber: '',
      category: '',
      sanction: '',
      amount: '',
      observation: ''
    }
  ])

  // Classifications
  const [classifications, setClassifications] = useState<Classification[]>([
    {
      title: '',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points'],
      rows: [['', '', '', '', '', '']]
    }
  ])

  const categories = [
    'U18 FILLES', 'U18 GARCONS', 'L2B MESSIEURS', 'L2A MESSIEURS', 
    'DAMES', 'L1 MESSIEURS', 'CORPORATES'
  ]

  const toggleDayExpansion = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(i => i !== dayIndex)
        : [...prev, dayIndex]
    )
  }

  const addDay = () => {
    setMatchResults([...matchResults, {
      day: '',
      matches: [{ category: '', results: [''] }]
    }])
  }

  const removeDay = (dayIndex: number) => {
    setMatchResults(matchResults.filter((_, i) => i !== dayIndex))
  }

  const addMatch = (dayIndex: number) => {
    const newResults = [...matchResults]
    newResults[dayIndex].matches.push({ category: '', results: [''] })
    setMatchResults(newResults)
  }

  const removeMatch = (dayIndex: number, matchIndex: number) => {
    const newResults = [...matchResults]
    newResults[dayIndex].matches.splice(matchIndex, 1)
    setMatchResults(newResults)
  }

  const addResult = (dayIndex: number, matchIndex: number) => {
    const newResults = [...matchResults]
    newResults[dayIndex].matches[matchIndex].results.push('')
    setMatchResults(newResults)
  }

  const removeResult = (dayIndex: number, matchIndex: number, resultIndex: number) => {
    const newResults = [...matchResults]
    newResults[dayIndex].matches[matchIndex].results.splice(resultIndex, 1)
    setMatchResults(newResults)
  }

  const addSanction = () => {
    setSanctions([...sanctions, {
      date: '',
      name: '',
      teamNumber: '',
      category: '',
      sanction: '',
      amount: '',
      observation: ''
    }])
  }

  const removeSanction = (index: number) => {
    setSanctions(sanctions.filter((_, i) => i !== index))
  }

  const addClassification = () => {
    setClassifications([...classifications, {
      title: '',
      headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points'],
      rows: [['', '', '', '', '', '']]
    }])
  }

  const removeClassification = (index: number) => {
    setClassifications(classifications.filter((_, i) => i !== index))
  }

  const addClassificationRow = (classIndex: number) => {
    const newClassifications = [...classifications]
    const headers = newClassifications[classIndex].headers
    newClassifications[classIndex].rows.push(Array(headers.length).fill(''))
    setClassifications(newClassifications)
  }

  const removeClassificationRow = (classIndex: number, rowIndex: number) => {
    const newClassifications = [...classifications]
    newClassifications[classIndex].rows.splice(rowIndex, 1)
    setClassifications(newClassifications)
  }

  const handleSave = () => {
    // Here you would save the report to your backend
    console.log('Saving report:', {
      ...reportData,
      matchResults,
      sanctions,
      classifications
    })
    router.push('/admin/reports')
  }

  const sections = [
    { id: 'basic', name: 'Informations de base', icon: FiFileText },
    { id: 'matches', name: 'Résultats des matchs', icon: FiCalendar },
    { id: 'sanctions', name: 'Sanctions', icon: FiAward },
    { id: 'classifications', name: 'Classements', icon: FiAward }
  ]

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Créer un Nouveau Rapport</h1>
              <p className="text-gray-400">Remplissez les informations pour créer un rapport de commission sportive</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/reports')}
                className="flex items-center px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all"
              >
                <FiX className="mr-2" />
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
              >
                <FiSave className="mr-2" />
                Enregistrer
              </button>
            </div>
          </motion.div>

          {/* Section Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10"
          >
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{section.name}</span>
                </button>
              )
            })}
          </motion.div>

          {/* Basic Information Section */}
          {activeSection === 'basic' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiFileText className="mr-3 text-orange-500" />
                Informations de base
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Saison</label>
                  <input
                    type="text"
                    value={reportData.season}
                    onChange={(e) => setReportData({...reportData, season: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Titre du rapport</label>
                  <input
                    type="text"
                    value={reportData.reportTitle}
                    onChange={(e) => setReportData({...reportData, reportTitle: e.target.value})}
                    placeholder="ex: RAPPORT COMMISSION SPORTIVE N°13"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="text"
                    value={reportData.date}
                    onChange={(e) => setReportData({...reportData, date: e.target.value})}
                    placeholder="ex: Yaoundé, le 19 mai 2025"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secrétaire</label>
                  <input
                    type="text"
                    value={reportData.secretary}
                    onChange={(e) => setReportData({...reportData, secretary: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Décisions</label>
                <textarea
                  value={reportData.decisions}
                  onChange={(e) => setReportData({...reportData, decisions: e.target.value})}
                  placeholder="Toutes les rencontres sont homologuées sous les scores acquis sur le terrain."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all resize-none"
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                <div className="flex gap-3">
                  {(['draft', 'published'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setReportData({...reportData, status})}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        reportData.status === status
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-white/10 text-gray-400 border border-white/20 hover:bg-white/15'
                      }`}
                    >
                      {status === 'draft' ? 'Brouillon' : 'Publié'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Match Results Section */}
          {activeSection === 'matches' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FiCalendar className="mr-3 text-orange-500" />
                  Résultats des matchs
                </h2>
                <button
                  onClick={addDay}
                  className="flex items-center px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all border border-orange-500/30"
                >
                  <FiPlus className="mr-2" />
                  Ajouter un jour
                </button>
              </div>

              {matchResults.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + dayIndex * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                >
                  <div 
                    className="flex items-center justify-between p-4 bg-black/20 cursor-pointer hover:bg-black/30 transition-colors"
                    onClick={() => toggleDayExpansion(dayIndex)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedDays.includes(dayIndex) ? <FiChevronUp /> : <FiChevronDown />}
                      <input
                        type="text"
                        value={day.day}
                        onChange={(e) => {
                          const newResults = [...matchResults]
                          newResults[dayIndex].day = e.target.value
                          setMatchResults(newResults)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="ex: Samedi, 17 mai 2025"
                        className="bg-transparent text-white font-medium placeholder-gray-400 focus:outline-none focus:bg-white/10 px-2 py-1 rounded"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeDay(dayIndex)
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {expandedDays.includes(dayIndex) && (
                    <div className="p-4 space-y-3">
                      {day.matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <select
                              value={match.category}
                              onChange={(e) => {
                                const newResults = [...matchResults]
                                newResults[dayIndex].matches[matchIndex].category = e.target.value
                                setMatchResults(newResults)
                              }}
                              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-orange-500/50"
                            >
                              <option value="">Sélectionner une catégorie</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeMatch(dayIndex, matchIndex)}
                              className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-all"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {match.results.map((result, resultIndex) => (
                              <div key={resultIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={result}
                                  onChange={(e) => {
                                    const newResults = [...matchResults]
                                    newResults[dayIndex].matches[matchIndex].results[resultIndex] = e.target.value
                                    setMatchResults(newResults)
                                  }}
                                  placeholder="ex: EQUIPE A 45 – 38 EQUIPE B"
                                  className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm"
                                />
                                <button
                                  onClick={() => removeResult(dayIndex, matchIndex, resultIndex)}
                                  className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-all"
                                >
                                  <FiTrash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addResult(dayIndex, matchIndex)}
                              className="flex items-center px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-all text-sm"
                            >
                              <FiPlus className="w-3 h-3 mr-1" />
                              Ajouter un résultat
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => addMatch(dayIndex)}
                        className="flex items-center px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all text-sm"
                      >
                        <FiPlus className="w-3 h-3 mr-2" />
                        Ajouter une catégorie
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Sanctions Section */}
          {activeSection === 'sanctions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FiAward className="mr-3 text-orange-500" />
                  Sanctions
                </h2>
                <button
                  onClick={addSanction}
                  className="flex items-center px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all border border-orange-500/30"
                >
                  <FiPlus className="mr-2" />
                  Ajouter une sanction
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-sm font-medium text-gray-400 pb-3">Date</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-3">Nom</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-3">N° Équipe</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-3">Catégorie</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-3">Sanction</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-3">Montant</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-3">Observation</th>
                        <th className="text-left text-sm font-medium text-gray-400 pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sanctions.map((sanction, index) => (
                        <tr key={index} className="border-b border-white/5">
                          <td className="py-3">
                            <input
                              type="text"
                              value={sanction.date}
                              onChange={(e) => {
                                const newSanctions = [...sanctions]
                                newSanctions[index].date = e.target.value
                                setSanctions(newSanctions)
                              }}
                              placeholder="19/05/25"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm"
                            />
                          </td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={sanction.name}
                              onChange={(e) => {
                                const newSanctions = [...sanctions]
                                newSanctions[index].name = e.target.value
                                setSanctions(newSanctions)
                              }}
                              placeholder="Nom du joueur"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm"
                            />
                          </td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={sanction.teamNumber}
                              onChange={(e) => {
                                const newSanctions = [...sanctions]
                                newSanctions[index].teamNumber = e.target.value
                                setSanctions(newSanctions)
                              }}
                              placeholder="12"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm"
                            />
                          </td>
                          <td className="py-3">
                            <select
                              value={sanction.category}
                              onChange={(e) => {
                                const newSanctions = [...sanctions]
                                newSanctions[index].category = e.target.value
                                setSanctions(newSanctions)
                              }}
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-orange-500/50 text-sm"
                            >
                              <option value="">Sélectionner</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={sanction.sanction}
                              onChange={(e) => {
                                const newSanctions = [...sanctions]
                                newSanctions[index].sanction = e.target.value
                                setSanctions(newSanctions)
                              }}
                              placeholder="Antisportive (U2)"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm"
                            />
                          </td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={sanction.amount}
                              onChange={(e) => {
                                const newSanctions = [...sanctions]
                                newSanctions[index].amount = e.target.value
                                setSanctions(newSanctions)
                              }}
                              placeholder="2 000"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm"
                            />
                          </td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={sanction.observation}
                              onChange={(e) => {
                                const newSanctions = [...sanctions]
                                newSanctions[index].observation = e.target.value
                                setSanctions(newSanctions)
                              }}
                              placeholder="IMPAYÉ"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm"
                            />
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => removeSanction(index)}
                              className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-all"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Classifications Section */}
          {activeSection === 'classifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FiAward className="mr-3 text-orange-500" />
                  Classements
                </h2>
                <button
                  onClick={addClassification}
                  className="flex items-center px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all border border-orange-500/30"
                >
                  <FiPlus className="mr-2" />
                  Ajouter un classement
                </button>
              </div>

              {classifications.map((classification, classIndex) => (
                <motion.div
                  key={classIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + classIndex * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={classification.title}
                      onChange={(e) => {
                        const newClassifications = [...classifications]
                        newClassifications[classIndex].title = e.target.value
                        setClassifications(newClassifications)
                      }}
                      placeholder="ex: CATEGORIE U18 FILLES"
                      className="bg-transparent text-lg font-medium text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => removeClassification(classIndex)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          {classification.headers.map((header, headerIndex) => (
                            <th key={headerIndex} className="text-left text-sm font-medium text-gray-400 pb-3">
                              <input
                                type="text"
                                value={header}
                                onChange={(e) => {
                                  const newClassifications = [...classifications]
                                  newClassifications[classIndex].headers[headerIndex] = e.target.value
                                  setClassifications(newClassifications)
                                }}
                                className="bg-transparent text-gray-400 placeholder-gray-500 focus:outline-none focus:bg-white/10 px-2 py-1 rounded w-full"
                              />
                            </th>
                          ))}
                          <th className="pb-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {classification.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b border-white/5">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="py-2">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => {
                                    const newClassifications = [...classifications]
                                    newClassifications[classIndex].rows[rowIndex][cellIndex] = e.target.value
                                    setClassifications(newClassifications)
                                  }}
                                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 text-sm"
                                />
                              </td>
                            ))}
                            <td className="py-2">
                              <button
                                onClick={() => removeClassificationRow(classIndex, rowIndex)}
                                className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-all"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => addClassificationRow(classIndex)}
                    className="mt-4 flex items-center px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all text-sm"
                  >
                    <FiPlus className="w-3 h-3 mr-2" />
                    Ajouter une ligne
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
