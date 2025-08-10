'use client'

import { motion } from 'framer-motion'

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-start mb-4"
    >
      <div className="flex items-center space-x-3">
        {/* Bobbin avatar */}
        <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">🐰</span>
        </div>
        
        {/* Typing bubble */}
        <div className="bg-neutral-bg-card border border-neutral-border rounded-2xl px-4 py-3 max-w-xs">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-neutral-text-muted rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  delay: 0 
                }}
              />
              <motion.div
                className="w-2 h-2 bg-neutral-text-muted rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  delay: 0.2 
                }}
              />
              <motion.div
                className="w-2 h-2 bg-neutral-text-muted rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  delay: 0.4 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}