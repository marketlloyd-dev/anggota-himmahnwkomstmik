'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'

export default function KeuanganPage() {
  const { profile } = useAuth()
  const [kasList, setKasList] = useState([])
  const [anggota, setAnggota] = useState([])
  const [form, setForm] = useState({ user_id: '', jumlah: '', bulan: '' })

  if (profile?.role !== 'ketua' && profile?.role !== 'bendahara') {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 text-white flex items-center justify-center">
          <div className="bg-himmah-dark p-6 rounded-xl border border-red-500 text-center">
            <h1 className="text-xl font-bold mb-2">Akses Ditolak</h1>
            <p>Hanya Ketua dan Bendahara yang dapat mengakses halaman ini.</p>
          </div>
        </main>
      </div>
    )
  }

  useEffect(() => {
    fetchKas()
    fetchAnggota()
  }, [])

  const fetchKas = async () => {
    const { data } = await supabase.from('kas').select('*, users!inner(nama_lengkap)').order('bulan', { ascending: false })
    setKasList(data || [])
  }

  const fetchAnggota = async () => {
    const { data } = await supabase.from('users').select('id, nama_lengkap')
    setAnggota(data || [])
  }

  const handleBayar = async () => {
    if (!form.user_id || !form.jumlah || !form.bulan) return toast.error('Lengkapi semua field')
    const { error } = await supabase.from('kas').upsert({
      user_id: form.user_id,
      jumlah: parseFloat(form.jumlah),
      bulan: form.bulan,
      status_pembayaran: 'lunas'
    })
    if (!error) {
      toast.success('Pembayaran dicatat')
      fetchKas()
      setForm({ user_id: '', jumlah: '', bulan: '' })
    } else {
      toast.error('Gagal menyimpan')
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Manajemen Keuangan Kas</h1>

          {/* Form Input */}
          <div className="bg-himmah-dark p-4 rounded-xl mb-6 border border-himmah-medium grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <select
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="bg-himmah-medium text-white rounded-lg px-3 py-2 w-full"
            >
              <option value="">Pilih Anggota</option>
              {anggota.map((a) => (
                <option key={a.id} value={a.id}>{a.nama_lengkap}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Jumlah"
              value={form.jumlah}
              onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
              className="bg-himmah-medium text-white rounded-lg px-3 py-2 w-full"
            />
            <input
              type="month"
              value={form.bulan}
              onChange={(e) => setForm({ ...form, bulan: e.target.value })}
              className="bg-himmah-medium text-white rounded-lg px-3 py-2 w-full"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBayar}
              className="bg-himmah-accent text-white py-2 px-4 rounded-lg font-medium w-full"
            >
              Catat Pembayaran
            </motion.button>
          </div>

          {/* Tabel Kas */}
          <div className="bg-himmah-dark rounded-xl overflow-hidden border border-himmah-medium overflow-x-auto">
            <table className="w-full text-sm text-white min-w-[500px]">
              <thead className="bg-himmah-medium">
                <tr>
                  <th className="p-3 text-left">Anggota</th>
                  <th className="p-3 text-left">Bulan</th>
                  <th className="p-3 text-left">Jumlah</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {kasList.map((k) => (
                  <tr key={k.id} className="border-b border-himmah-medium hover:bg-himmah-medium/20">
                    <td className="p-3">{k.users?.nama_lengkap}</td>
                    <td className="p-3">{k.bulan}</td>
                    <td className="p-3">Rp {Number(k.jumlah).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${k.status_pembayaran === 'lunas' ? 'bg-green-800' : 'bg-red-800'}`}>
                        {k.status_pembayaran}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}