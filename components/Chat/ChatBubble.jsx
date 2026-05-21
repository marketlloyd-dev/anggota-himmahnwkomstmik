import { motion } from 'framer-motion'

export default function ChatBubble({ message, isMine, senderName, time }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isMine ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
    >
      {!isMine && <span className="text-xs text-gray-400 ml-2 mb-1">{senderName}</span>}
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl text-white ${
          isMine ? 'bg-himmah-accent rounded-br-none' : 'bg-himmah-medium rounded-bl-none'
        }`}
      >
        {message}
      </div>
      <span className="text-xs text-gray-500 mt-1">{time}</span>
    </motion.div>
  )
}