'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'

export default function LaporanPage() {
  const { profile } = useAuth()
  const [laporan, setLaporan] = useState([])
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')

  useEffect(() => {
    fetchLaporan()
  }, [])

  const fetchLaporan = async () => {
    const { data } = await supabase
      .from('laporan')
      .select('*, users!inner(nama_lengkap)')
      .order('created_at', { ascending: false })
    setLaporan(data || [])
  }

  const handleKirim = async () => {
    if (!judul.trim()) return toast.error('Judul wajib diisi')
    const { error } = await supabase.from('laporan').insert({
      divisi: profile.divisi,
      judul,
      deskripsi,
      created_by: profile.id,
      status_notif: false
    })
    if (!error) {
      // Kirim notifikasi ke semua ketua
      const { data: ketuas } = await supabase.from('users').select('id').eq('role', 'ketua')
      if (ketuas) {
        const notifs = ketuas.map(k => ({ user_id: k.id, pesan: `Laporan baru dari divisi ${profile.divisi}: ${judul}` }))
        await supabase.from('notifications').insert(notifs)
      }
      // Log aktivitas
      await supabase.from('activity_logs').insert({
        user_id: profile.id,
        aksi: 'membuat laporan baru',
        deskripsi: `Laporan: ${judul} (${profile.divisi})`
      })
      toast.success('Laporan terkirim, ketua telah diberi notifikasi')
      setJudul('')
      setDeskripsi('')
      fetchLaporan()
    } else {
      toast.error('Gagal mengirim laporan')
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Laporan Divisi</h1>

          <div className="bg-himmah-dark p-4 rounded-xl mb-6 border border-himmah-medium space-y-3">
            <input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul Laporan" className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2" />
            <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi laporan..." rows={3} className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2 resize-y" />
            <div className="flex justify-end">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleKirim} className="bg-himmah-accent px-6 py-2 rounded-lg text-white font-medium">
                Kirim Laporan
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            {laporan.map((l) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-himmah-dark p-4 rounded-xl border border-himmah-medium">
                <div className="flex flex-col sm:flex-row justify-between">
                  <h3 className="text-white font-medium">{l.judul}</h3>
                  <span className="text-xs text-gray-400">{l.divisi} - {l.users?.nama_lengkap}</span>
                </div>
                <p className="text-gray-300 mt-2">{l.deskripsi}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(l.created_at).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}