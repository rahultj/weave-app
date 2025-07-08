'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-neutral-bg-card border border-neutral-border shadow-lg rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <span className="text-neutral-text-primary">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 