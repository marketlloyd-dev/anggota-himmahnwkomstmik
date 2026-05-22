'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'
import { HiCamera } from 'react-icons/hi'

export default function ProfilPage() {
  const { profile, refreshProfile, user } = useAuth()
  const [nama, setNama] = useState(profile?.nama_lengkap || '')
  const [email, setEmail] = useState(profile?.email || '')
  const [passwordSekarang, setPasswordSekarang] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setNama(profile.nama_lengkap)
      setEmail(profile.email)
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  // Upload avatar
  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!user) return

    setUploading(true)
    try {
      const filePath = `${user.id}/avatar.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Update kolom avatar_url di tabel users
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      toast.success('Foto profil diperbarui')
      refreshProfile()
    } catch (err) {
      toast.error('Gagal upload: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // Simpan perubahan nama, email, password (via API)
  const handleSimpan = async () => {
    if (!user) return
    setLoading(true)
    try {
      const payload = {
        userId: user.id,
        nama_lengkap: nama !== profile?.nama_lengkap ? nama : undefined,
      }

      // Hanya kirim email/password jika password sekarang diisi
      if (passwordSekarang) {
        payload.password_sekarang = passwordSekarang
        if (email !== profile?.email) payload.email = email
        if (passwordBaru) payload.password_baru = passwordBaru
      }

      const res = await fetch('/api/update-profil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui profil')

      toast.success('Profil diperbarui')
      setPasswordSekarang('')
      setPasswordBaru('')
      refreshProfile()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-white mb-8">Edit Profil</h1>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full bg-himmah-medium border-2 border-himmah-accent overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                    {profile?.nama_lengkap?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <HiCamera className="text-white text-2xl" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadAvatar}
            />
            <p className="text-gray-400 text-sm mt-2">
              {uploading ? 'Mengunggah...' : 'Klik untuk ganti foto'}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Nama Lengkap</label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2 border border-himmah-accent/30"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2 border border-himmah-accent/30"
              />
            </div>

            <hr className="border-himmah-medium my-4" />
            <p className="text-gray-400 text-sm">Untuk mengubah email atau password, isi password saat ini.</p>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password Saat Ini</label>
              <input
                type="password"
                value={passwordSekarang}
                onChange={(e) => setPasswordSekarang(e.target.value)}
                placeholder="Isi jika ingin ubah email/password"
                className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2 border border-himmah-accent/30"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password Baru (opsional)</label>
              <input
                type="password"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                placeholder="Min. 6 karakter"
                className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2 border border-himmah-accent/30"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSimpan}
              disabled={loading}
              className="w-full bg-himmah-accent text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-70 mt-4"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  )
}