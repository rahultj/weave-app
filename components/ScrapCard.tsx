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
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openEdit}
        className="w-7 h-7 bg-neutral-bg-hover hover:bg-neutral-bg-hover/80 rounded-full flex items-center justify-center transition-colors group"
        aria-label="Edit scrap"
      >
        <Edit size={14} className="text-neutral-text-secondary group-hover:text-brand-primary transition-colors" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-7 h-7 bg-neutral-bg-hover hover:bg-red-50 rounded-full flex items-center justify-center transition-colors group disabled:opacity-50"
        aria-label="Delete scrap"
      >
        <Trash2 size={14} className="text-neutral-text-secondary group-hover:text-red-600 transition-colors" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openChat}
        className="w-7 h-7 bg-brand-primary hover:bg-brand-hover rounded-full flex items-center justify-center transition-colors group"
        aria-label="Explore this scrap"
      >
        <Rabbit size={14} className="text-white group-hover:scale-110 transition-transform" />
      </motion.button>
    </div>
  )

  return (
    <>
      <motion.div
        whileHover={{ y: -1 }}
        className="group relative overflow-visible bg-neutral-bg-card rounded-lg border border-neutral-border"
      >
        {scrap.type === 'image' && scrap.image_url ? (
          <div className="flex flex-col">
            {/* Image Container */}
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <Image
                src={scrap.image_url}
                alt={scrap.title || 'Scrap image'}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            
            {/* Content Container */}
            <div className="p-3 flex flex-col">
              {scrap.title && (
                <h3 className="text-sm font-semibold text-neutral-text-primary line-clamp-2 mb-2">
                  {highlightedTitle ?? scrap.title}
                </h3>
              )}
              
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xs text-neutral-text-muted">
                  {new Date(scrap.created_at).toLocaleDateString()}
                </span>
                <ActionButtons />
              </div>
            </div>
          </div>
        ) : (
          // Text Card Layout
          <div className="p-4 border-l-4 border-l-brand-primary">
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
          </div>
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