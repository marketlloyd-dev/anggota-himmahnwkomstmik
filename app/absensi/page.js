'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'
import toast from 'react-hot-toast'

export default function AbsensiPage() {
  const { profile } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [anggota, setAnggota] = useState([])
  const [attendance, setAttendance] = useState({})

  useEffect(() => {
    fetchMeetings()
    fetchAnggota()
  }, [])

  const fetchMeetings = async () => {
    const { data } = await supabase.from('meetings').select('*').order('tanggal', { ascending: false })
    setMeetings(data || [])
  }

  const fetchAnggota = async () => {
    const { data } = await supabase.from('users').select('id, nama_lengkap, divisi')
    setAnggota(data || [])
  }

  const handleAbsen = async (userId, status) => {
    if (!selectedMeeting) return
    const { error } = await supabase.from('attendance').upsert({
      meeting_id: selectedMeeting.id,
      user_id: userId,
      status
    })
    if (!error) toast.success('Absen tercatat')
    else toast.error('Gagal')
    setAttendance(prev => ({ ...prev, [userId]: status }))
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Absensi Rapat</h1>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {meetings.map((m) => (
              <motion.div
                key={m.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl cursor-pointer border ${selectedMeeting?.id === m.id ? 'border-himmah-accent bg-himmah-medium' : 'border-himmah-medium bg-himmah-dark'}`}
                onClick={() => setSelectedMeeting(m)}
              >
                <h3 className="text-white font-medium">{m.judul}</h3>
                <p className="text-gray-400 text-sm">{format(new Date(m.tanggal), 'dd MMM yyyy')} - {m.jam}</p>
                <p className="text-gray-500 text-xs">{m.lokasi}</p>
              </motion.div>
            ))}
          </div>

          {selectedMeeting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-himmah-dark rounded-xl p-4 md:p-6 border border-himmah-accent/30"
            >
              <h2 className="text-xl text-white mb-4">Absensi: {selectedMeeting.judul}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-white min-w-[400px]">
                  <thead>
                    <tr className="text-left text-gray-300">
                      <th className="p-2">Nama</th>
                      <th className="p-2">Divisi</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anggota.map((a) => (
                      <tr key={a.id} className="border-b border-himmah-medium">
                        <td className="p-2">{a.nama_lengkap}</td>
                        <td className="p-2">{a.divisi}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${attendance[a.id] === 'hadir' ? 'bg-green-800' : attendance[a.id] === 'izin' ? 'bg-yellow-800' : 'bg-red-800'}`}>
                            {attendance[a.id] || 'Alpha'}
                          </span>
                        </td>
                        <td className="p-2 flex gap-1">
                          <button onClick={() => handleAbsen(a.id, 'hadir')} className="text-green-400 text-xs">Hadir</button>
                          <button onClick={() => handleAbsen(a.id, 'izin')} className="text-yellow-400 text-xs">Izin</button>
                          <button onClick={() => handleAbsen(a.id, 'alpha')} className="text-red-400 text-xs">Alpha</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}