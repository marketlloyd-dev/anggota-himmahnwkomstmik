'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import {
  HiHome, HiUsers, HiClipboardList, HiCash,
  HiDocumentText, HiCalendar, HiChatAlt2, HiSpeakerphone,
  HiMenu, HiX, HiLogout, HiCollection, HiUser
} from 'react-icons/hi'

const allMenuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: HiHome, roles: ['ketua', 'sekretaris', 'bendahara', 'anggota'] },
  { label: 'Anggota', href: '/anggota', icon: HiUsers, roles: ['ketua', 'sekretaris'] },
  { label: 'Absensi', href: '/absensi', icon: HiClipboardList, roles: ['ketua', 'sekretaris', 'bendahara'] },
  { label: 'Keuangan', href: '/keuangan', icon: HiCash, roles: ['ketua', 'bendahara'] },
  { label: 'Laporan Divisi', href: '/laporan', icon: HiDocumentText, roles: ['ketua', 'sekretaris'] },
  { label: 'Kalender', href: '/kalender', icon: HiCalendar, roles: ['ketua', 'sekretaris', 'bendahara', 'anggota'] },
  { label: 'Pengumuman', href: '/pengumuman', icon: HiSpeakerphone, roles: ['ketua'] },
  { label: 'Forum', href: '/forum', icon: HiChatAlt2, roles: ['ketua', 'sekretaris', 'bendahara', 'anggota'] },
  { label: 'Aktivitas', href: '/aktivitas', icon: HiCollection, roles: ['ketua', 'sekretaris', 'bendahara', 'anggota'] },
  { label: 'Profil', href: '/profil', icon: HiUser, roles: ['ketua', 'sekretaris', 'bendahara', 'anggota'] },
]

export default function Sidebar() {
  const { profile, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const finalMenu = allMenuItems.filter(
    item => !item.roles || item.roles.includes(profile?.role)
  )

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-himmah-accent text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <HiX size={22} /> : <HiMenu size={22} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="lg:hidden fixed inset-0 bg-black z-40"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-himmah-darkest border-r border-himmah-medium
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:z-auto lg:flex lg:flex-col
        `}
      >
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-center mb-6 mt-4 lg:mt-0">
            <h1 className="text-xl font-bold text-white">HIMMAH NW</h1>
            <p className="text-xs text-himmah-accent">Komisariat STMIK SZ NW Anjani</p>
          </div>

          <nav className="space-y-1 flex-1">
            {finalMenu.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} onClick={closeSidebar}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-himmah-accent text-white shadow-lg shadow-himmah-accent/30'
                        : 'text-gray-300 hover:bg-himmah-medium hover:text-white'
                    }`}
                  >
                    <item.icon className="text-xl" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-himmah-medium">
          {profile && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-himmah-accent flex items-center justify-center text-white font-bold">
                {profile.nama_lengkap?.charAt(0) || 'U'}
              </div>
              <div className="text-white text-sm">
                <p className="font-medium">{profile.nama_lengkap}</p>
                <p className="text-xs text-gray-400 capitalize">{profile.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 px-4 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            <HiLogout /> Keluar
          </button>
        </div>
      </aside>
    </>
  )
}