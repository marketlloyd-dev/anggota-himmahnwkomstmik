'use client'
import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, title, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="bg-himmah-dark p-6 rounded-2xl border border-himmah-medium/50 shadow-lg hover:shadow-himmah-accent/20 transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon className="text-2xl" style={{ color }} />
        </div>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  )
}