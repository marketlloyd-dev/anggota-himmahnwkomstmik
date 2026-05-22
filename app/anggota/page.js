'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPencil, HiTrash, HiPlus } from 'react-icons/hi'
import toast from 'react-hot-toast'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'

export default function AnggotaPage() {
  const { profile } = useAuth()
  const [anggota, setAnggota] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)

  const canManage = profile?.role === 'ketua' || profile?.role === 'sekretaris'

  useEffect(() => {
    fetchAnggota()
  }, [])

  const fetchAnggota = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    setAnggota(data || [])
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus anggota ini?')) return
    await supabase.from('users').delete().eq('id', id)
    toast.success('Anggota dihapus')
    fetchAnggota()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Manajemen Anggota</h1>
            {canManage && (
              <button
                onClick={() => { setEditData(null); setShowForm(true) }}
                className="bg-himmah-accent px-4 py-2 rounded-lg flex items-center gap-2 text-white hover:bg-emerald-600 text-sm md:text-base"
              >
                <HiPlus /> Tambah
              </button>
            )}
          </div>

          <div className="bg-himmah-dark rounded-xl border border-himmah-medium overflow-x-auto">
            <table className="w-full text-white text-sm min-w-[600px]">
              <thead className="bg-himmah-medium">
                <tr>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Divisi</th>
                  <th className="p-3 text-left">Jabatan</th>
                  <th className="p-3 text-left">Role</th>
                  {canManage && <th className="p-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {anggota.map((a) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-himmah-medium hover:bg-himmah-medium/30"
                    >
                      <td className="p-3">{a.nama_lengkap}</td>
                      <td className="p-3">{a.email}</td>
                      <td className="p-3">{a.divisi}</td>
                      <td className="p-3">{a.jabatan}</td>
                      <td className="p-3 capitalize">{a.role}</td>
                      {canManage && (
                        <td className="p-3 flex justify-center gap-2">
                          <button onClick={() => { setEditData(a); setShowForm(true) }} className="text-blue-400 hover:text-blue-300"><HiPencil /></button>
                          <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-300"><HiTrash /></button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <AnimatePresence>
            {showForm && (
              <FormAnggota
                onClose={() => setShowForm(false)}
                onSuccess={fetchAnggota}
                initialData={editData}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function FormAnggota({ onClose, onSuccess, initialData }) {
  const [form, setForm] = useState({
    nama_lengkap: initialData?.nama_lengkap || '',
    email: initialData?.email || '',
    divisi: initialData?.divisi || '',
    jabatan: initialData?.jabatan || '',
    role: initialData?.role || 'anggota'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (initialData) {
      await supabase.from('users').update(form).eq('id', initialData.id)
      toast.success('Anggota diperbarui')
    } else {
      await supabase.from('users').insert(form)
      toast.success('Anggota ditambahkan')
    }
    onSuccess()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-himmah-dark p-6 rounded-2xl w-full max-w-md border border-himmah-accent/30"
      >
        <h2 className="text-xl font-bold text-white mb-4">{initialData ? 'Edit' : 'Tambah'} Anggota</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.nama_lengkap} onChange={(e) => setForm({...form, nama_lengkap: e.target.value})} placeholder="Nama Lengkap" className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2" required />
          <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Email" className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2" required />
          <select value={form.divisi} onChange={(e) => setForm({...form, divisi: e.target.value})} className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2">
            <option value="">Pilih Divisi</option>
            <option>Penguatan Ideologi</option>
            <option>Kehimmawatian</option>
            <option>Teknologi Informasi dan Media Sosial</option>
            <option>Pemberdayaan Ekonomi dan Bisnis</option>
            <option>Penelitian dan Pemberdayaan Civil Society</option>
          </select>
          <input value={form.jabatan} onChange={(e) => setForm({...form, jabatan: e.target.value})} placeholder="Jabatan" className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2" />
          <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2">
            <option value="anggota">Anggota</option>
            <option value="sekretaris">Sekretaris</option>
            <option value="bendahara">Bendahara</option>
            <option value="ketua">Ketua</option>
          </select>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-himmah-medium">Batal</button>
            <button type="submit" className="px-4 py-2 bg-himmah-accent text-white rounded-lg">Simpan</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}