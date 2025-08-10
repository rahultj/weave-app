'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, RotateCcw } from 'lucide-react'

interface ErrorBannerProps {
  message: string | null;
  onRetry?: () => void;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-red-50 border-b border-red-200 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800">{message}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {onRetry && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}