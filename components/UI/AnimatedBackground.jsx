'use client'
import { motion } from 'framer-motion'

const shapes = [
  { cx: '10%', cy: '20%', delay: 0 },
  { cx: '90%', cy: '80%', delay: 1 },
  { cx: '50%', cy: '10%', delay: 2 },
  { cx: '80%', cy: '30%', delay: 0.5 },
  { cx: '20%', cy: '70%', delay: 1.5 },
]

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-himmah-darkest">
      <div className="absolute inset-0 bg-gradient-to-br from-himmah-accent/20 via-himmah-dark to-himmah-darkest animate-pulse" />
      
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {shapes.map((shape, i) => (
          <motion.circle
            key={i}
            cx={shape.cx}
            cy={shape.cy}
            r="15%"
            fill="none"
            stroke="rgba(49,155,114,0.15)"
            strokeWidth="2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: shape.delay,
              ease: 'easeInOut'
            }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(rgba(49,155,114,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(49,155,114,0.2)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
    </div>
  )
}