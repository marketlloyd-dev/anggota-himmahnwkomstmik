'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'

export default function AktivitasPage() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*, users!inner(nama_lengkap)')
      .order('created_at', { ascending: false })
      .limit(50)
    setLogs(data || [])
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Log Aktivitas Organisasi</h1>

          <div className="bg-himmah-dark rounded-xl border border-himmah-medium overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Belum ada aktivitas tercatat.</div>
            ) : (
              <div className="divide-y divide-himmah-medium">
                {logs.map((log) => (
                  <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 flex items-start gap-3">
                    <div className="w-2 h-2 bg-himmah-accent rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-medium">{log.users?.nama_lengkap}</span>{' '}
                        {log.aksi}
                      </p>
                      {log.deskripsi && <p className="text-gray-400 text-xs mt-1">{log.deskripsi}</p>}
                      <p className="text-gray-500 text-xs mt-1">{format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: id })}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}