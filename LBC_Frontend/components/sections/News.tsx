'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiClock, FiCalendar, FiUser, FiTag } from 'react-icons/fi'
import { getPublishedNews, News } from '@/app/lib/api'

export const NewsSection = () => {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = [
    'Match Report',
    'Team News',
    'League News',
    'Player Spotlight',
    'General'
  ]

  useEffect(() => {
    fetchNews()
  }, [selectedCategory, currentPage])

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getPublishedNews(6, currentPage, selectedCategory || undefined)
      setNews(response.data)
      setTotalPages(response.pagination.pages)
    } catch (err) {
      console.error('Error fetching news:', err)
      setError('Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Match Report': return 'bg-green-500'
      case 'Team News': return 'bg-blue-500'
      case 'League News': return 'bg-orange-500'
      case 'Player Spotlight': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <section className="py-20 bg-gray-950">
      <div className="container px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Latest <span className="text-orange-400">News</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stay updated with the latest from Cameroon Basketball League
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-gray-800 p-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedCategory === '' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === category 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading news...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((newsItem, index) => (
                <motion.article
                  key={newsItem._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    {newsItem.imageUrl ? (
                      <Image
                        src={newsItem.imageUrl}
                        alt={newsItem.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">LBC</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full text-white ${getCategoryColor(newsItem.category)}`}>
                        {newsItem.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <FiCalendar className="mr-1" />
                      {formatDate(newsItem.publishedAt || newsItem.createdAt)}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{newsItem.title}</h3>
                    {newsItem.summary && (
                      <p className="text-gray-400 mb-4">{newsItem.summary}</p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <FiUser className="mr-1" />
                        {newsItem.author}
                      </div>
                    </div>

                    {newsItem.tags && newsItem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {newsItem.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <button className="text-orange-400 hover:text-orange-300 font-medium flex items-center">
                      Read More
                      <FiClock className="ml-2" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (  
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {selectedCategory 
              ? `No news found for ${selectedCategory}`
              : 'No news available at the moment'
            }
          </div>
        )}
      </div>
    </section>
  )
}