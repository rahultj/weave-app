'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save } from 'lucide-react'
import { Scrap, updateScrap } from '@/lib/scraps'

interface EditScrapModalProps {
  isOpen: boolean
  onClose: () => void
  scrap: Scrap
  onUpdate: (updatedScrap: Scrap) => void
}

export default function EditScrapModal({ isOpen, onClose, scrap, onUpdate }: EditScrapModalProps) {
  const [title, setTitle] = useState(scrap.title || '')
  const [content, setContent] = useState(scrap.observations || '')
  const [creator, setCreator] = useState(scrap.creator || '')
  const [medium, setMedium] = useState(scrap.medium || '')
  const [isLoading, setIsLoading] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset form when scrap changes
  useEffect(() => {
    setTitle(scrap.title || '')
    setContent(scrap.observations || '')
    setCreator(scrap.creator || '')
    setMedium(scrap.medium || '')
  }, [scrap])

  // Auto-resize textarea
  useEffect(() => {
    if (contentTextareaRef.current) {
      contentTextareaRef.current.style.height = 'auto'
      contentTextareaRef.current.style.height = contentTextareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  const handleSave = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const updatedScrap = await updateScrap(scrap.id, {
        title: title.trim() || undefined,
        observations: content.trim(),
        creator: creator.trim() || undefined,
        medium: medium.trim() || undefined
      })
      
      onUpdate(updatedScrap as Scrap)
      onClose()
    } catch (error) {
      console.error('Failed to update scrap:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl bg-neutral-bg-main rounded-xl shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-border bg-neutral-bg-card rounded-t-xl">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="text-neutral-text-secondary hover:text-brand-primary transition-colors"
              >
                Cancel
              </motion.button>
              <h2 className="text-lg font-semibold text-neutral-text-primary">
                Edit Scrap
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={!content.trim() || isLoading}
                className="flex items-center gap-2 px-3 py-1 bg-brand-primary text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Save size={14} />
                {isLoading ? 'Saving...' : 'Save'}
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-text-secondary mb-2">
                  Title (Optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Name of the cultural artifact..."
                  className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-neutral-text-primary"
                  onKeyDown={handleKeyPress}
                />
              </div>

              {/* Creator Input */}
              <div>
                <label htmlFor="creator" className="block text-sm font-medium text-neutral-text-secondary mb-2">
                  Creator (Optional)
                </label>
                <input
                  id="creator"
                  type="text"
                  value={creator}
                  onChange={e => setCreator(e.target.value)}
                  placeholder="Author, artist, director, etc..."
                  className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-neutral-text-primary"
                  onKeyDown={handleKeyPress}
                />
              </div>

              {/* Medium Input */}
              <div>
                <label htmlFor="medium" className="block text-sm font-medium text-neutral-text-secondary mb-2">
                  Medium (Optional)
                </label>
                <input
                  id="medium"
                  type="text"
                  value={medium}
                  onChange={e => setMedium(e.target.value)}
                  placeholder="Book, film, artwork, etc..."
                  className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-neutral-text-primary"
                  onKeyDown={handleKeyPress}
                />
              </div>

              {/* Content Input (Scrap) */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-neutral-text-secondary mb-2">
                  Your Scrap
                </label>
                <textarea
                  ref={contentTextareaRef}
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share your thoughts and reflections..."
                  className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-neutral-text-primary resize-none min-h-[120px]"
                  required
                  onKeyDown={handleKeyPress}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}