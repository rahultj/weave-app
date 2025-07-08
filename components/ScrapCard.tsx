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
      <div className="bg-neutral-bg-card rounded-lg p-4 border border-neutral-border">
        <p className="text-neutral-text-muted">Loading scrap...</p>
      </div>
    )
  }

  const ActionButtons = () => (
    <div className="flex items-center gap-1.5">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openEdit}
        className="w-6 h-6 bg-neutral-bg-hover hover:bg-neutral-bg-hover/80 rounded-full flex items-center justify-center transition-colors group"
        aria-label="Edit scrap"
      >
        <Edit size={12} className="text-neutral-text-secondary group-hover:text-brand-primary transition-colors" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-6 h-6 bg-neutral-bg-hover hover:bg-red-50 rounded-full flex items-center justify-center transition-colors group disabled:opacity-50"
        aria-label="Delete scrap"
      >
        <Trash2 size={12} className="text-neutral-text-secondary group-hover:text-red-600 transition-colors" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openChat}
        className="w-6 h-6 bg-brand-primary hover:bg-brand-hover rounded-full flex items-center justify-center transition-colors group"
        aria-label="Explore this scrap"
      >
        <Rabbit size={12} className="text-white group-hover:scale-110 transition-transform" />
      </motion.button>
    </div>
  )

  return (
    <>
      <motion.div
        whileHover={{ y: -1 }}
        className={`group relative overflow-visible ${
          scrap.type === 'image'
            ? 'flex gap-3 bg-neutral-bg-card rounded-lg p-4 border border-neutral-border'
            : 'bg-neutral-bg-card rounded-lg p-4 border border-neutral-border border-l-4 border-l-brand-primary'
        }`}
      >
        {scrap.type === 'image' && scrap.image_url ? (
          <>
            {/* Left: Image thumbnail */}
            <div className="flex-shrink-0">
              <Image
                src={scrap.image_url}
                alt={scrap.title || 'Scrap image'}
                width={80}
                height={80}
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                unoptimized={true}
              />
            </div>
            
            {/* Right: Content */}
            <div className="flex-1 min-w-0">
              {scrap.title && (
                <h3 className="text-sm md:text-base font-semibold text-neutral-text-primary line-clamp-2 mb-2">
                  {highlightedTitle ?? scrap.title}
                </h3>
              )}
              
              {scrap.content && (
                <p className="text-xs md:text-sm text-neutral-text-secondary line-clamp-2 mb-2">
                  {highlightedContent ?? scrap.content}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-text-muted">
                  {new Date(scrap.created_at).toLocaleDateString()}
                </span>
                <ActionButtons />
              </div>
            </div>
          </>
        ) : (
          // Text Card Layout
          <>
            {scrap.title && (
              <h3 className="text-sm md:text-base font-semibold text-neutral-text-primary line-clamp-2 mb-2">
                {highlightedTitle ?? scrap.title}
              </h3>
            )}
            
            {scrap.content && (
              <p className="text-sm italic text-neutral-text-primary line-clamp-3 mb-2">
                "{highlightedContent ?? scrap.content}"
              </p>
            )}
            
            {scrap.source && (
              <p className="text-xs text-neutral-text-secondary italic mb-3">
                — {highlightedSource ?? scrap.source}
              </p>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-text-muted">
                {new Date(scrap.created_at).toLocaleDateString()}
              </span>
              <ActionButtons />
            </div>
          </>
        )}
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