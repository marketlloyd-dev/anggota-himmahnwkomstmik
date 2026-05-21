'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'
import StatCard from '@/components/UI/StatCard'
import AttendanceChart from '@/components/UI/AttendanceChart'
import CalendarWidget from '@/components/UI/CalendarWidget'
import { HiUsers, HiCash, HiCalendar, HiDocumentText } from 'react-icons/hi'

export default function Dashboard() {
  const { profile } = useAuth()
  const [counts, setCounts] = useState({ anggota: 0, kas: '0', events: 0, laporan: 0 })
  const [attendanceData] = useState([
    { label: 'Hadir', value: 70 },
    { label: 'Izin', value: 20 },
    { label: 'Alpha', value: 10 }
  ])

  useEffect(() => {
    async function fetchStats() {
      const { count: anggota } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true })
      const { count: laporan } = await supabase.from('laporan').select('*', { count: 'exact', head: true })
      const { data: kasData } = await supabase.from('kas').select('jumlah')
      const totalKas = kasData?.reduce((acc, cur) => acc + Number(cur.jumlah), 0) || 0
      setCounts({
        anggota: anggota || 0,
        kas: `Rp ${totalKas.toLocaleString()}`,
        events: events || 0,
        laporan: laporan || 0
      })
    }
    fetchStats()
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Dashboard {profile?.role && `- ${profile.role}`}
          </motion.h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard icon={HiUsers} title="Total Anggota" value={counts.anggota} color="#319B72" delay={0} />
            <StatCard icon={HiCash} title="Kas Bulan Ini" value={counts.kas} color="#F59E0B" delay={0.1} />
            <StatCard icon={HiCalendar} title="Event Aktif" value={counts.events} color="#8B5CF6" delay={0.2} />
            <StatCard icon={HiDocumentText} title="Laporan Divisi" value={counts.laporan} color="#EF4444" delay={0.3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <AttendanceChart data={attendanceData} />
            <CalendarWidget />
          </div>
        </div>
      </main>
    </div>
  )
}