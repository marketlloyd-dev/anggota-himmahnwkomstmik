'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

export default function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState([])

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

  return (
    <div className="bg-himmah-dark p-4 rounded-xl border border-himmah-medium">
      <div className="flex justify-between items-center mb-4 text-white">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>&lt;</button>
        <h3 className="font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-400 mb-1">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const hasEvent = events.some(e => isSameDay(new Date(e.tanggal_mulai), day))
          return (
            <motion.div
              key={day.toString()}
              whileHover={{ scale: 1.2 }}
              className={`p-1 rounded text-sm text-center ${hasEvent ? 'bg-himmah-accent text-white font-bold' : 'text-gray-300 hover:bg-himmah-medium'}`}
            >
              {format(day, 'd')}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}