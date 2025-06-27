'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit2, FiTrash, FiPlus, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  toggleCategoryStatus,
  Category 
} from '@/app/lib/api'

interface CategoryForm {
  name: string
  description: string
  hasPoules: boolean
  poules: string[]
}

const initialForm: CategoryForm = {
  name: '',
  description: '',
  hasPoules: false,
  poules: []
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await getAllCategories()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => ({
        ...prev,
        [name]: checked,
        // Clear poules if hasPoules is unchecked
        poules: name === 'hasPoules' && !checked ? [] : prev.poules
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handlePouleToggle = (poule: string) => {
    setForm(prev => ({
      ...prev,
      poules: prev.poules.includes(poule)
        ? prev.poules.filter(p => p !== poule)
        : [...prev.poules, poule].sort()
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingCategory(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setForm({
      name: category.name,
      description: category.description || '',
      hasPoules: category.hasPoules,
      poules: [...category.poules]
    })
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validation
      if (!form.name.trim()) {
        throw new Error('Category name is required')
      }

      if (form.hasPoules && form.poules.length === 0) {
        throw new Error('Please select at least one poule')
      }

      let data: Category
      
      if (editingCategory) {
        data = await updateCategory(editingCategory._id, form)
        setCategories(prev => prev.map(cat => 
          cat._id === editingCategory._id ? data : cat
        ))
        toast.success('Category updated successfully')
      } else {
        data = await createCategory(form)
        setCategories(prev => [...prev, data])
        toast.success('Category created successfully')
      }

      setIsModalOpen(false)
      resetForm()
    } catch (err) {
      console.error('Error saving category:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save category'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteCategory(category._id)
      setCategories(prev => prev.filter(cat => cat._id !== category._id))
      toast.success('Category deleted successfully')
    } catch (err) {
      console.error('Error deleting category:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category'
      toast.error(errorMessage)
    }
  }

  const handleToggleStatus = async (category: Category) => {
    try {
      const updatedCategory = await toggleCategoryStatus(category._id)
      setCategories(prev => prev.map(cat => 
        cat._id === category._id ? updatedCategory : cat
      ))
      toast.success(`Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      console.error('Error toggling category status:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle category status'
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading categories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Category Management</h2>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
        >
          <FiPlus />
          Create Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-orange-500/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-400 mb-2">{category.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.isActive 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {category.hasPoules && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                      Has Poules
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(category)}
                  className="text-gray-400 hover:text-yellow-400 p-1 rounded transition-colors"
                  title={category.isActive ? 'Deactivate' : 'Activate'}
                >
                  {category.isActive ? <FiEyeOff /> : <FiEye />}
                </button>
                <button
                  onClick={() => openEditModal(category)}
                  className="text-gray-400 hover:text-blue-400 p-1 rounded transition-colors"
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors"
                  title="Delete"
                >
                  <FiTrash />
                </button>
              </div>
            </div>

            {category.hasPoules && category.poules.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Poules:</p>
                <div className="flex flex-wrap gap-2">
                  {category.poules.map(poule => (
                    <span
                      key={poule}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
                    >
                      Poule {poule}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasPoules"
                    checked={form.hasPoules}
                    onChange={handleFormChange}
                    className="rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                  />
                  <label className="text-sm font-medium text-gray-300">
                    Has Poules
                  </label>
                </div>

                {form.hasPoules && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Poules
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map(poule => (
                        <button
                          key={poule}
                          type="button"
                          onClick={() => handlePouleToggle(poule)}
                          className={`flex items-center justify-center gap-2 p-2 rounded border transition-colors ${
                            form.poules.includes(poule)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-blue-500'
                          }`}
                        >
                          {form.poules.includes(poule) ? <FiCheck /> : <FiX />}
                          Poule {poule}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      resetForm()
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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