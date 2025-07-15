'use client'
import { useState, useEffect } from 'react'
import { Team, getTeams, deleteTeam, updateTeam, createTeam, getCategories, Category } from '@/app/lib/api'
import { FiEdit2, FiTrash, FiPlus } from 'react-icons/fi'

export function TeamManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPoule, setSelectedPoule] = useState<string>('A')
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Team>>({})
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState<Partial<Team>>({})

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
        
        // Set initial category
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].name)
          setCreateForm(prev => ({ ...prev, category: categoriesData[0].name }))
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    fetchCategories()
  }, [])

  // Get current category data
  const currentCategory = categories.find(cat => cat.name === selectedCategory)
  const hasPoules = currentCategory?.hasPoules || false
  const poules = currentCategory?.poules || []

  // Check if current category has poules for create form
  const createFormCategory = categories.find(cat => cat.name === createForm.category)
  const createFormHasPoules = createFormCategory?.hasPoules || false
  const createFormPoules = createFormCategory?.poules || []

  useEffect(() => {
    fetchTeams()
  }, [selectedCategory, selectedPoule])

  // Reset poule selection when category changes
  useEffect(() => {
    setSelectedPoule('A')
  }, [selectedCategory])

  const fetchTeams = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/teams?category=${encodeURIComponent(selectedCategory)}`
      
      // Add poule filter if the category has poules
      if (hasPoules) {
        url += `&poule=${selectedPoule}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }
      const data = await response.json()
      
      // Handle both old and new API response formats
      const teamsData = data.data || data
      setTeams(Array.isArray(teamsData) ? teamsData : [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      setTeams([])
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(id)
        setTeams(prev => prev.filter(t => t._id !== id))
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeamId(team._id)
    setEditForm(team)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeamId) return
    try {
      const updated = await updateTeam(editingTeamId, editForm)
      setTeams(prev => prev.map(t => (t._id === updated._id ? updated : t)))
      setEditingTeamId(null)
      setEditForm({})
    } catch (err) {
      console.error(err)
    }
  }

  // Create form handlers
  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCreateForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await createTeam(createForm)
      setTeams(prev => [...prev, created])
      setCreating(false)
      setCreateForm({ category: categories[0].name })
    } catch (err) {
      console.error(err)
    }
  }

  const filteredTeams = teams.filter(t => t.category === selectedCategory)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white">Team Management</h2>

      {/* Create Team Button */}
      <button
        onClick={() => setCreating(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 w-full sm:w-auto justify-center"
      >
        <FiPlus />
        Create Team
      </button>

      {/* Category Selector: Dropdown for small/medium, buttons for large+ */}
      <div className="mb-4">
        <div className="lg:hidden flex justify-center">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden lg:flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                selectedCategory === cat.name
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Poule Selection Buttons */}
      {hasPoules && (
        <div className="flex flex-wrap gap-2">
          {poules.map(poule => (
            <button
              key={poule}
              onClick={() => setSelectedPoule(poule)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                selectedPoule === poule
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Poule {poule}
            </button>
          ))}
        </div>
      )}

      {/* Current Selection Display */}
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          {selectedCategory}
          {hasPoules && (
            <span className="text-blue-400 ml-2">- Poule {selectedPoule}</span>
          )}
        </h3>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTeams.map(team => (
          <div
            key={team._id}
            className="rounded-2xl bg-gray-900 shadow-md overflow-hidden"
          >
            <div className="h-40 bg-black flex items-center justify-center text-white text-2xl font-bold">
              {team.name}
            </div>
            <div className="p-4 space-y-1">
              <h3 className="text-lg font-semibold text-white">{team.city}</h3>
              <p className="text-sm text-gray-400">Arena: {team.arena}</p>
              <p className="text-sm text-gray-400">Coach: {team.coach}</p>
              <p className="text-sm text-gray-400">Founded: {team.founded}</p>
              <p className="text-sm text-gray-400">Championships: {team.championships}</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => handleEdit(team)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(team._id)}
                  className="text-red-500 hover:text-red-400"
                >
                  <FiTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTeamId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4"
          >
            <h2 className="text-white text-xl font-bold">Edit Team</h2>

            {['name', 'city', 'arena', 'coach'].map(field => (
              <input
                key={field}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(editForm as any)[field] || ''}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            ))}

            {/* <input
              type="number"
              name="founded"
              placeholder="Founded"
              value={editForm.founded || ''}
              onChange={handleEditChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            /> */}
            <input
              type="number"
              name="championships"
              placeholder="Championships"
              value={editForm.championships || ''}
              onChange={handleEditChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
            <textarea
              name="about"
              placeholder="About"
              value={editForm.about || ''}
              onChange={handleEditChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />

            {/* Poule field for categories that have poules */}
            {(editForm.category === 'U18 GARCONS' || editForm.category === 'L2A MESSIEUR') && (
              <select
                name="poule"
                value={editForm.poule || ''}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              >
                <option value="">Select Poule</option>
                {editForm.category === 'U18 GARCONS' ? (
                  <>
                    <option value="A">Poule A</option>
                    <option value="B">Poule B</option>
                    <option value="C">Poule C</option>
                  </>
                ) : (
                  <>
                    <option value="A">Poule A</option>
                    <option value="B">Poule B</option>
                  </>
                )}
              </select>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingTeamId(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4"
          >
            <h2 className="text-white text-xl font-bold">Create Team</h2>

            <select
              name="category"
              value={createForm.category}
              onChange={handleCreateChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {['name', 'city', 'arena', 'coach'].map(field => (
              <input
                key={field}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(createForm as any)[field] || ''}
                onChange={handleCreateChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            ))}

            <input
              type="number"
              name="founded"
              placeholder="Founded"
              value={createForm.founded || ''}
              onChange={handleCreateChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              
            />
            <input
              type="number"
              name="championships"
              placeholder="Championships"
              value={createForm.championships ?? 0}  // Use nullish coalescing to default 0
              onChange={handleCreateChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
            <textarea
              name="about"
              placeholder="About"
              value={createForm.about || ''}
              onChange={handleCreateChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />

            {/* Poule field for categories that have poules */}
            {(createForm.category === 'U18 GARCONS' || createForm.category === 'L2A MESSIEUR') && (
              <select
                name="poule"
                value={createForm.poule || ''}
                onChange={handleCreateChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              >
                <option value="">Select Poule</option>
                {createForm.category === 'U18 GARCONS' ? (
                  <>
                    <option value="A">Poule A</option>
                    <option value="B">Poule B</option>
                    <option value="C">Poule C</option>
                  </>
                ) : (
                  <>
                    <option value="A">Poule A</option>
                    <option value="B">Poule B</option>
                  </>
                )}
              </select>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
