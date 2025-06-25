'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit2, FiTrash, FiPlus, FiEye, FiEyeOff, FiCalendar, FiUser, FiTag, FiCheckSquare, FiSquare } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { News, getAllNews, createNews, updateNews, deleteNews, toggleNewsStatus } from '@/app/lib/api'

const NEWS_CATEGORIES = [
  'Match Report',
  'Team News', 
  'League News',
  'Player Spotlight',
  'General'
]

export function NewsManagement() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<News>>({})
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState<Partial<News>>({})
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const newsData = await getAllNews()
      setNews(Array.isArray(newsData) ? newsData : [])
    } catch (error) {
      console.error('Error fetching news:', error)
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingNewsId) {
        await updateNews(editingNewsId, editForm)
        toast.success('News updated successfully')
      } else {
        await createNews(createForm)
        toast.success('News created successfully')
      }
      
      setIsModalOpen(false)
      setEditingNewsId(null)
      setEditForm({})
      setCreateForm({})
      fetchNews()
    } catch (error) {
      console.error('Error saving news:', error)
      toast.error('Failed to save news')
    }
  }

  const handleEdit = (article: News) => {
    setEditingNewsId(article._id)
    setEditForm(article)
    setCreating(true)
  }

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const isTags = name === 'tags'
    setEditForm(prev => ({ ...prev, [name]: isTags ? value.split(',').map(tag => tag.trim()) : value }))
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this news article?')) {
      try {
        await deleteNews(id)
        setNews(prev => prev.filter(n => n._id !== id))
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleTogglePublished = async (id: string) => {
    try {
      const updated = await toggleNewsStatus(id)
      setNews(prev => prev.map(n => (n._id === updated._id ? updated : n)))
    } catch (err) {
      console.error('Failed to toggle published state', err)
    }
  }

  const resetForm = () => {
    setEditForm({})
    setCreateForm({})
    setTagInput('')
  }

  const addTag = () => {
    if (tagInput.trim() && !createForm.tags?.includes(tagInput.trim())) {
      setCreateForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCreateForm(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openCreateModal = () => {
    setEditingNewsId(null)
    setEditForm({})
    setCreateForm({})
    setCreating(true)
  }

  const closeModal = () => {
    setCreating(false)
    setEditingNewsId(null)
  }

  const currentForm = editingNewsId ? editForm : createForm
  const handleChange = editingNewsId ? handleEditChange : handleEditChange

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleEditChange(e);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">News Management</h2>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Create News</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading news...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {news.map((article) => (
            <motion.div
              key={article._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{article.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      article.isPublished 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {article.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {article.category}
                    </span>
                  </div>
                  
                  {article.summary && (
                    <p className="text-gray-300 mb-3">{article.summary}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FiUser className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                    {article.publishedAt && (
                      <div className="flex items-center space-x-1">
                        <FiEye className="w-4 h-4" />
                        <span>Published: {formatDate(article.publishedAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      <FiTag className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(article._id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete"
                  >
                    <FiTrash className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleTogglePublished(article._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      article.isPublished
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                    title={article.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {article.isPublished ? <FiCheckSquare className="w-4 h-4" /> : <FiSquare className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {editingNewsId ? 'Edit News' : 'Add News'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={currentForm.title || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Summary</label>
                  <textarea
                    name="summary"
                    value={currentForm.summary || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    rows={3}
                    maxLength={500}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Content *</label>
                  <textarea
                    name="content"
                    value={currentForm.content || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    rows={8}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Author *</label>
                    <input
                      type="text"
                      name="author"
                      value={currentForm.author || ''}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
                    <select
                      name="category"
                      value={currentForm.category || ''}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      required
                    >
                      {NEWS_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={currentForm.imageUrl || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      name="tags"
                      value={(currentForm.tags || []).join(',')}
                      onChange={handleChange}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(currentForm.tags || []).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={currentForm.isPublished}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isPublished" className="text-sm text-gray-300">
                    Publish immediately
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingNewsId ? 'Update News' : 'Create News'}
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