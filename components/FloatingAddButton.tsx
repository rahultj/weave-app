// components/FloatingAddButton.tsx
'use client'

import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface FloatingAddButtonProps {
  onClick: () => void
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-hover transition-colors flex items-center justify-center z-30"
    >
      <Plus size={24} />
    </motion.button>
  )
}