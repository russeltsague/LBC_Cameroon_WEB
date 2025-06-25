'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiLock, FiUser } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'cameroonBasketball2023') {
      localStorage.setItem('adminAuth', 'true')
      router.push('/admin')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-900 rounded-xl border border-gray-800 p-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Admin Login</h1>
        <p className="text-gray-400 text-center mb-6">Cameroon Basketball League</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  )
}