'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'
import { HiPlus, HiReply } from 'react-icons/hi'

export default function ForumPage() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [komentar, setKomentar] = useState('')
  const [form, setForm] = useState({ judul: '', konten: '', kategori: 'Umum' })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, users!inner(nama_lengkap)')
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  const handleBuatPost = async () => {
    if (!form.judul.trim() || !form.konten.trim()) return toast.error('Judul dan konten wajib diisi')
    const { error } = await supabase.from('forum_posts').insert({
      ...form,
      created_by: profile.id
    })
    if (!error) {
      toast.success('Postingan dibuat')
      setShowForm(false)
      setForm({ judul: '', konten: '', kategori: 'Umum' })
      fetchPosts()
    }
  }

  const handleKomentar = async (postId) => {
    if (!komentar.trim()) return
    const { error } = await supabase.from('forum_comments').insert({
      post_id: postId,
      user_id: profile.id,
      konten: komentar
    })
    if (!error) {
      toast.success('Komentar ditambahkan')
      setKomentar('')
      fetchPosts() // Refresh untuk menampilkan komentar baru (sederhana)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Forum Diskusi</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-himmah-accent px-4 py-2 rounded-lg text-white flex items-center gap-2"
            >
              <HiPlus /> Buat Topik
            </button>
          </div>

          {/* Daftar Postingan */}
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-himmah-dark p-4 rounded-xl border border-himmah-medium cursor-pointer"
                onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs bg-himmah-accent/30 text-himmah-accent px-2 py-1 rounded">{post.kategori}</span>
                    <h3 className="text-white font-medium mt-2">{post.judul}</h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(post.created_at), 'dd MMM yyyy', { locale: id })}
                  </span>
                </div>
                <p className="text-gray-300 mt-2 text-sm line-clamp-2">{post.konten}</p>
                <p className="text-xs text-gray-500 mt-2">Oleh: {post.users?.nama_lengkap}</p>

                {/* Komentar Section */}
                <AnimatePresence>
                  {selectedPost?.id === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-himmah-medium"
                    >
                      <h4 className="text-white text-sm font-medium mb-2">Komentar</h4>
                      <div className="space-y-2 mb-3">
                        {post.komentars?.map((k, i) => (
                          <div key={i} className="bg-himmah-medium/30 p-2 rounded text-sm text-gray-300">
                            <span className="font-medium text-white">{k.users?.nama_lengkap}:</span> {k.konten}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={komentar}
                          onChange={(e) => setKomentar(e.target.value)}
                          placeholder="Tulis komentar..."
                          className="flex-1 bg-himmah-medium text-white rounded-lg px-3 py-2 text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleKomentar(post.id)}
                        />
                        <button
                          onClick={() => handleKomentar(post.id)}
                          className="bg-himmah-accent px-3 py-2 rounded-lg text-white text-sm"
                        >
                          <HiReply />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Modal Buat Topik */}
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
                  onClick={(e) => e.stopPropagation()}
                  className="bg-himmah-dark p-6 rounded-2xl w-full max-w-md border border-himmah-accent/30"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Buat Topik Baru</h3>
                  <div className="space-y-3">
                    <input
                      value={form.judul}
                      onChange={(e) => setForm({ ...form, judul: e.target.value })}
                      placeholder="Judul topik"
                      className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2"
                    />
                    <select
                      value={form.kategori}
                      onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                      className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2"
                    >
                      <option>Umum</option>
                      <option>Penguatan Ideologi</option>
                      <option>Kehimmawatian</option>
                      <option>Teknologi Informasi dan Media Sosial</option>
                      <option>Pemberdayaan Ekonomi dan Bisnis</option>
                      <option>Penelitian dan Pemberdayaan Civil Society</option>
                    </select>
                    <textarea
                      value={form.konten}
                      onChange={(e) => setForm({ ...form, konten: e.target.value })}
                      placeholder="Isi topik..."
                      rows={4}
                      className="w-full bg-himmah-medium text-white rounded-lg px-4 py-2 resize-y"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400">Batal</button>
                    <button onClick={handleBuatPost} className="px-4 py-2 bg-himmah-accent text-white rounded-lg">Posting</button>
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