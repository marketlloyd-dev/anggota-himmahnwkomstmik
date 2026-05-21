'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import ChatBubble from '@/components/Chat/ChatBubble'
import Sidebar from '@/components/Layout/Sidebar'
import Navbar from '@/components/Layout/Navbar'

export default function ChatDivisiPage() {
  const { divisi } = useParams()
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [roomId, setRoomId] = useState(null)
  const chatEndRef = useRef(null)

  const divisiName = decodeURIComponent(divisi).replace(/-/g, ' ')

  useEffect(() => {
    if (!profile) return
    const init = async () => {
      let { data: room } = await supabase.from('chat_rooms').select('*').eq('divisi', divisiName).single()
      if (!room) {
        const { data: newRoom } = await supabase.from('chat_rooms').insert({ divisi: divisiName }).select().single()
        room = newRoom
      }
      setRoomId(room.id)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*, users!inner(nama_lengkap)')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true })
      setMessages(msgs || [])

      const channel = supabase
        .channel(`room-${room.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
          (payload) => {
            setMessages(prev => [...prev, payload.new])
          }
        )
        .subscribe()

      return () => supabase.removeChannel(channel)
    }
    init()
  }, [profile, divisiName])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !roomId) return
    await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: user.id,
      pesan: text
    })
    setText('')
  }

  const getUserName = (senderId) => {
    const msg = messages.find(m => m.sender_id === senderId)
    return msg?.users?.nama_lengkap || 'Unknown'
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-4 flex flex-col bg-himmah-darkest">
          <div className="bg-himmah-dark p-3 rounded-t-xl border border-himmah-medium text-white font-medium">
            Chat Divisi: {divisiName}
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-himmah-dark/50 space-y-4 border-x border-himmah-medium">
            <AnimatePresence>
              {messages.map((msg, i) => {
                const isMine = msg.sender_id === user.id
                return (
                  <ChatBubble
                    key={msg.id || i}
                    message={msg.pesan}
                    isMine={isMine}
                    senderName={isMine ? 'Anda' : getUserName(msg.sender_id)}
                    time={format(new Date(msg.created_at), 'HH:mm')}
                  />
                )
              })}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSend} className="bg-himmah-dark p-3 rounded-b-xl border border-himmah-medium flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 bg-himmah-medium text-white rounded-lg px-4 py-2 border border-himmah-accent/30 focus:outline-none"
            />
            <motion.button whileTap={{ scale: 0.9 }} type="submit" className="bg-himmah-accent px-6 py-2 rounded-lg text-white font-semibold">
              Kirim
            </motion.button>
          </form>
        </div>
      </main>
    </div>
  )
}