'use client'
import { motion } from 'framer-motion'
import NotificationBell from '@/components/UI/NotificationBell'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { profile } = useAuth()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-himmah-dark border-b border-himmah-medium px-4 lg:px-6 py-3 flex justify-between items-center"
    >
      <div className="text-white font-semibold text-sm md:text-lg">
        Selamat datang, {profile?.nama_lengkap || 'Pengurus'}
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <NotificationBell />
        <div className="w-9 h-9 rounded-full bg-himmah-accent flex items-center justify-center text-white font-bold text-sm">
          {profile?.nama_lengkap?.charAt(0) || 'U'}
        </div>
      </div>
    </motion.nav>
  )
}