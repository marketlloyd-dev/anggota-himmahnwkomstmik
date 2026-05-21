'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error) {
      toast.error('Login gagal: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="w-full max-w-md bg-himmah-dark/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-himmah-accent/30"
      >
        <div className="text-center mb-8">
          <motion.h1
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            className="text-4xl font-bold text-white"
          >
            HIMMAH NW
          </motion.h1>
          <p className="text-himmah-accent mt-2 font-light">Komisariat STMIK SZ NW Anjani</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-himmah-medium/50 text-white border border-himmah-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-himmah-accent placeholder-gray-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata Sandi"
            required
            className="w-full bg-himmah-medium/50 text-white border border-himmah-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-himmah-accent placeholder-gray-400"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-himmah-accent text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Memproses...
              </span>
            ) : 'Masuk'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}