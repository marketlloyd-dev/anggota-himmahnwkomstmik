'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiBell } from 'react-icons/hi'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function NotificationBell() {
  const [notifCount, setNotifCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    fetchNotifs()
    const channel = supabase
      .channel('notif-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchNotifs()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  const fetchNotifs = async () => {
    const { data, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('dibaca', false)
    setNotifCount(count || 0)
    setNotifications(data || [])
  }

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ dibaca: true }).eq('id', id)
    fetchNotifs()
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-white">
        <HiBell className="text-2xl" />
        {notifCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center"
          >
            {notifCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-72 bg-himmah-dark border border-himmah-medium rounded-xl shadow-2xl z-50"
          >
            <div className="p-3 border-b border-himmah-medium text-white font-medium">Notifikasi</div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-400 p-4 text-sm text-center">Tidak ada notifikasi</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className="p-3 hover:bg-himmah-medium cursor-pointer border-b border-himmah-medium/50 text-white text-sm"
                  >
                    {n.pesan}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}