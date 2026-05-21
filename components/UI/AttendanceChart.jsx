'use client'
import { motion } from 'framer-motion'

export default function AttendanceChart({ data }) {
  // data: array {label, value}
  return (
    <div className="bg-himmah-dark p-4 rounded-xl border border-himmah-medium">
      <h3 className="text-white font-medium mb-4">Statistik Kehadiran</h3>
      <div className="flex items-end gap-3 h-32">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${item.value}%` }}
              transition={{ duration: 1, delay: i * 0.2 }}
              className="w-full bg-himmah-accent rounded-t-lg"
            />
            <span className="text-xs text-gray-400 mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}