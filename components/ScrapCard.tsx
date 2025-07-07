'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Trash2, Rabbit } from 'lucide-react'
import ChatModal from './ChatModal'
import EditScrapModal from './EditScrapModal'
import { Scrap, deleteScrap } from '@/lib/scraps'
import { ReactNode } from 'react'

interface ScrapCardProps {
  scrap: Scrap
  onUpdate: (updatedScrap: Scrap) => void
  onDelete: (scrapId: string) => void
  highlightedTitle?: ReactNode
  highlightedContent?: ReactNode
  highlightedSource?: ReactNode
  highlightedTags?: ReactNode[]
}

export default function ScrapCard({ scrap, onUpdate, onDelete, highlightedTitle, highlightedContent, highlightedSource, highlightedTags }: ScrapCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openChat = () => {
    setIsChatOpen(true)
  }

  const openEdit = () => {
    setIsEditOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scrap? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteScrap(scrap.id)
      onDelete(scrap.id)
    } catch (error) {
      console.error('Failed to delete scrap:', error)
      alert('Failed to delete scrap. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!scrap) {
    return (
      <div className="bg-neutral-bg-card rounded-xl p-6 shadow-sm border border-neutral-border w-full max-w-md mx-auto">
        <p className="text-neutral-text-muted">Loading scrap...</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-neutral-bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-neutral-border w-full max-w-md mx-auto relative group overflow-visible mb-2"
      >
        {scrap.type === 'image' && scrap.image_url && (
          <div className="mb-4 flex justify-center">
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4] overflow-hidden rounded-lg">
              <Image
                src={scrap.image_url}
                alt={scrap.title || 'Scrap image'}
                fill
                className="object-cover rounded-lg"
                unoptimized={true}
              />
            </div>
          </div>
        )}

        {scrap.title && (
          <h3 className="text-lg font-semibold text-neutral-text-primary mb-3 leading-tight">
            {highlightedTitle ?? scrap.title}
          </h3>
        )}

        {scrap.content && (
          <p className={`text-neutral-text-primary mb-4 ${
            scrap.type === 'text' ? 'italic text-base leading-relaxed' : 'text-sm leading-relaxed'
          }`}>
            {scrap.type === 'text'
              ? `"${highlightedContent ?? scrap.content}"`
              : highlightedContent ?? scrap.content}
          </p>
        )}

        {scrap.source && (
          <p className="text-sm text-neutral-text-secondary italic mb-4">
            — {highlightedSource ?? scrap.source}
          </p>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between border-t border-neutral-border mt-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-text-muted">
              {scrap.created_at ? new Date(scrap.created_at).toLocaleDateString() : 'Unknown date'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openEdit}
              className="w-8 h-8 bg-neutral-bg-hover hover:bg-neutral-bg-hover/80 rounded-full flex items-center justify-center transition-colors group"
              aria-label="Edit scrap"
            >
              <Edit size={15} className="text-neutral-text-secondary group-hover:text-brand-primary transition-colors" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-8 h-8 bg-neutral-bg-hover hover:bg-red-50 rounded-full flex items-center justify-center transition-colors group disabled:opacity-50"
              aria-label="Delete scrap"
            >
              <Trash2 size={15} className="text-neutral-text-secondary group-hover:text-red-600 transition-colors" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openChat}
              className="w-8 h-8 bg-brand-primary hover:bg-brand-hover rounded-full flex items-center justify-center transition-colors group"
              aria-label="Explore this scrap"
            >
              <Rabbit size={15} className="text-white group-hover:scale-110 transition-transform" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        scrap={scrap}
      />

      <EditScrapModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        scrap={scrap}
        onUpdate={onUpdate}
      />
    </>
  )
}