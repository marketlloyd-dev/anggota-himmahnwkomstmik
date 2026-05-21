'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' atau 'daftar'
  const [loading, setLoading] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [namaLengkap, setNamaLengkap] = useState('')
  const [divisi, setDivisi] = useState('')
  const [jabatan, setJabatan] = useState('')

  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Email dan password wajib diisi')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      toast.error('Login gagal: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDaftar = async (e) => {
    e.preventDefault()
    if (!email || !password || !namaLengkap || !divisi) {
      return toast.error('Email, password, nama, dan divisi wajib diisi')
    }
    setLoading(true)
    try {
      // 1. Daftarkan user ke Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nama_lengkap: namaLengkap,
            divisi: divisi,
            jabatan: jabatan || 'Anggota',
          },
        },
      })
      if (error) throw error

      // 2. Masukkan data profil ke public.users (role default = anggota)
      if (data.user) {
        const { error: profilError } = await supabase.from('users').insert({
          id: data.user.id,
          email: email,
          nama_lengkap: namaLengkap,
          divisi: divisi,
          jabatan: jabatan || 'Anggota',
          role: 'anggota', // default
        })
        if (profilError) throw profilError
      }

      toast.success('Akun berhasil dibuat! Silakan login.')
      setMode('login')
      setEmail('')
      setPassword('')
      setNamaLengkap('')
      setDivisi('')
      setJabatan('')
    } catch (err) {
      toast.error('Gagal mendaftar: ' + err.message)
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

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
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
                {loading ? 'Memproses...' : 'Masuk'}
              </motion.button>
              <p className="text-center text-gray-400 text-sm">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('daftar')}
                  className="text-himmah-accent hover:underline font-medium"
                >
                  Daftar dulu
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="daftar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleDaftar}
              className="space-y-4"
            >
              <input
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama Lengkap"
                required
                className="w-full bg-himmah-medium/50 text-white border border-himmah-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-himmah-accent placeholder-gray-400"
              />
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
                placeholder="Password (min. 6 karakter)"
                required
                minLength={6}
                className="w-full bg-himmah-medium/50 text-white border border-himmah-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-himmah-accent placeholder-gray-400"
              />
              <select
                value={divisi}
                onChange={(e) => setDivisi(e.target.value)}
                required
                className="w-full bg-himmah-medium/50 text-white border border-himmah-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-himmah-accent"
              >
                <option value="">Pilih Divisi</option>
                <option>Penguatan Ideologi</option>
                <option>Kehimmawatian</option>
                <option>Teknologi Informasi dan Media Sosial</option>
                <option>Pemberdayaan Ekonomi dan Bisnis</option>
                <option>Penelitian dan Pemberdayaan Civil Society</option>
              </select>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Jabatan (opsional, default: Anggota)"
                className="w-full bg-himmah-medium/50 text-white border border-himmah-accent/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-himmah-accent placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-himmah-accent text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar'}
              </motion.button>
              <p className="text-center text-gray-400 text-sm">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-himmah-accent hover:underline font-medium"
                >
                  Login
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}