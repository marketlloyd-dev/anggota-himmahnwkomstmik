'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'

export default function PengumumanPage() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm] = useState({ judul: '', konten: '' })

  if (profile?.role !== 'ketua') {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 text-white flex items-center justify-center">
          <div className="bg-himmah-dark p-6 rounded-xl border border-red-500 text-center">
            <h1 className="text-xl font-bold mb-2">Akses Ditolak</h1>
            <p>Hanya Ketua yang dapat mengelola pengumuman.</p>
          </div>
        </main>
      </div>
    )
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnnouncements(data || [])
  }

  const handleCreate = async () => {
    if (!form.judul.trim()) return toast.error('Judul wajib diisi')
    const { error } = await supabase.from('announcements').insert({
      ...form,
      created_by: profile.id
    })
    if (!error) {
      // Kirim notifikasi ke semua user
      const { data: users } = await supabase.from('users').select('id')
      if (users) {
        const notifs = users.map(u => ({ user_id: u.id, pesan: `Pengumuman baru: ${form.judul}` }))
        await supabase.from('notifications').insert(notifs)
      }
      // Log aktivitas
      await supabase.from('activity_logs').insert({
        user_id: profile.id,
        aksi: 'mempublikasikan pengumuman',
        deskripsi: `Pengumuman: ${form.judul}`
      })
      toast.success('Pengumuman dipublikasikan')
      setForm({ judul: '', konten: '' })
      fetchAnnouncements()
    } else {
      toast.error('Gagal mempublikasikan')
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Pengumuman</h1>

          <div className="bg-himmah-dark p-4 rounded-xl mb-6 border border-himmah-medium space-y-3">
            <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="Judul Pengumuman" className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2" />
            <textarea value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} placeholder="Isi pengumuman..." rows={4} className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2 resize-y" />
            <div className="flex justify-end">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleCreate} className="bg-himmah-accent px-6 py-2 rounded-lg text-white font-medium">Publikasikan</motion.button>
            </div>
          </div>

          <div className="space-y-4">
            {announcements.map((a) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-himmah-dark p-5 rounded-xl border border-himmah-accent/30">
                <h3 className="text-white font-bold text-lg">{a.judul}</h3>
                <p className="text-gray-300 mt-2 whitespace-pre-wrap">{a.konten}</p>
                <p className="text-xs text-gray-500 mt-3">{new Date(a.created_at).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}