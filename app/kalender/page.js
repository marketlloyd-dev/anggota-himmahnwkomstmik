'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { id } from 'date-fns/locale'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'
import toast from 'react-hot-toast'

export default function KalenderPage() {
  const { profile } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ judul: '', deskripsi: '', tanggal_mulai: '', jam: '', lokasi: '' })

  useEffect(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    supabase
      .from('events')
      .select('*')
      .gte('tanggal_mulai', format(start, 'yyyy-MM-dd'))
      .lte('tanggal_mulai', format(end, 'yyyy-MM-dd'))
      .then(({ data }) => setEvents(data || []))
  }, [currentMonth])

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const handleCreateEvent = async () => {
    if (!form.judul || !form.tanggal_mulai) return toast.error('Judul dan tanggal wajib')
    const { error } = await supabase.from('events').insert({
      ...form,
      dibuat_oleh: profile.id
    })
    if (!error) {
      toast.success('Event ditambahkan')
      setShowForm(false)
      setForm({ judul: '', deskripsi: '', tanggal_mulai: '', jam: '', lokasi: '' })
      // Refresh events
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)
      const { data } = await supabase.from('events').select('*').gte('tanggal_mulai', format(start, 'yyyy-MM-dd')).lte('tanggal_mulai', format(end, 'yyyy-MM-dd'))
      setEvents(data || [])
    } else {
      toast.error('Gagal menambah event')
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h1 className="text-2xl font-bold text-white">Kalender Kegiatan</h1>
            <button onClick={() => setShowForm(true)} className="bg-himmah-accent px-4 py-2 rounded-lg text-white font-medium">
              + Tambah Event
            </button>
          </div>

          {/* Kalender */}
          <div className="bg-himmah-dark rounded-xl p-4 border border-himmah-medium mb-6">
            <div className="flex justify-between items-center mb-4 text-white">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="px-2 py-1 hover:bg-himmah-medium rounded">&lt;</button>
              <h2 className="text-lg font-semibold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: id })}</h2>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="px-2 py-1 hover:bg-himmah-medium rounded">&gt;</button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-400 mb-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map((day) => {
                const eventDay = events.filter(e => isSameDay(new Date(e.tanggal_mulai), day))
                return (
                  <motion.div
                    key={day.toString()}
                    whileHover={{ scale: 1.1 }}
                    className={`p-2 rounded text-sm text-white relative ${eventDay.length > 0 ? 'bg-himmah-accent font-bold' : 'hover:bg-himmah-medium'}`}
                  >
                    {format(day, 'd')}
                    {eventDay.length > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Daftar event */}
          <div className="space-y-3">
            {events.map(e => (
              <div key={e.id} className="bg-himmah-dark p-3 rounded-lg border border-himmah-medium text-white">
                <h3 className="font-medium">{e.judul}</h3>
                <p className="text-sm text-gray-400">{format(new Date(e.tanggal_mulai), 'dd MMM yyyy')} {e.jam && `- ${e.jam}`}</p>
                {e.deskripsi && <p className="text-xs text-gray-500 mt-1">{e.deskripsi}</p>}
              </div>
            ))}
          </div>

          {/* Modal form event */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                onClick={() => setShowForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-himmah-dark p-6 rounded-2xl w-full max-w-md border border-himmah-accent/30"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Tambah Event</h3>
                  <div className="space-y-3">
                    <input value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})} placeholder="Judul" className="w-full bg-himmah-medium text-white rounded px-3 py-2" />
                    <textarea value={form.deskripsi} onChange={(e) => setForm({...form, deskripsi: e.target.value})} placeholder="Deskripsi" className="w-full bg-himmah-medium text-white rounded px-3 py-2" />
                    <input type="date" value={form.tanggal_mulai} onChange={(e) => setForm({...form, tanggal_mulai: e.target.value})} className="w-full bg-himmah-medium text-white rounded px-3 py-2" />
                    <input type="time" value={form.jam} onChange={(e) => setForm({...form, jam: e.target.value})} className="w-full bg-himmah-medium text-white rounded px-3 py-2" />
                    <input value={form.lokasi} onChange={(e) => setForm({...form, lokasi: e.target.value})} placeholder="Lokasi" className="w-full bg-himmah-medium text-white rounded px-3 py-2" />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 rounded hover:bg-himmah-medium">Batal</button>
                    <button onClick={handleCreateEvent} className="px-4 py-2 bg-himmah-accent text-white rounded font-medium">Simpan</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}