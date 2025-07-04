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
  const [content, setContent] = useState(scrap.content || '')
  const [source, setSource] = useState(scrap.source || '')
  const [isLoading, setIsLoading] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset form when scrap changes
  useEffect(() => {
    setTitle(scrap.title || '')
    setContent(scrap.content || '')
    setSource(scrap.source || '')
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
        content: content.trim(),
        source: source.trim() || undefined
      })
      
      onUpdate(updatedScrap)
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
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl bg-neutral-bg-main rounded-xl shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-border bg-neutral-bg-card rounded-t-xl">
              <button
                onClick={onClose}
                className="text-neutral-text-secondary hover:text-brand-primary transition-colors"
              >
                Cancel
              </button>
              <h2 className="text-lg font-semibold text-neutral-text-primary">
                Edit Scrap
              </h2>
              <button
                onClick={handleSave}
                disabled={!content.trim() || isLoading}
                className="flex items-center gap-2 px-3 py-1 bg-brand-primary text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Save size={14} />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-text-primary mb-2">
                  Title {scrap.type === 'text' ? '(optional)' : ''}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={scrap.type === 'text' ? 'Add a title...' : 'Enter title...'}
                  className="w-full px-4 py-3 bg-neutral-bg-card border border-neutral-border rounded-lg text-neutral-text-primary placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-text-primary mb-2">
                  {scrap.type === 'text' ? 'Quote or Thought' : 'Description'}
                </label>
                <textarea
                  ref={contentTextareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={scrap.type === 'text' ? 'What\'s on your mind?' : 'Describe this image...'}
                  className="w-full px-4 py-3 bg-neutral-bg-card border border-neutral-border rounded-lg text-neutral-text-primary placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[120px] max-h-60 resize-none"
                  rows={4}
                />
              </div>

              {/* Source Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-text-primary mb-2">
                  Source (optional)
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Author, book, website..."
                  className="w-full px-4 py-3 bg-neutral-bg-card border border-neutral-border rounded-lg text-neutral-text-primary placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer hint */}
            <div className="p-4 border-t border-neutral-border">
              <p className="text-xs text-neutral-text-muted text-center">
                Press Cmd/Ctrl + Enter to save quickly
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}