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

  if (!scrap) {
    return (
      <div className="bg-neutral-bg-card rounded-lg p-4 border border-neutral-border">
        <p className="text-neutral-text-muted">Loading scrap...</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -1 }}
        className="group relative overflow-visible bg-neutral-bg-card rounded-lg border border-neutral-border hover:border-neutral-border/80 transition-colors"
      >
        {scrap.type === 'image' ? (
          // Image Card Layout (Horizontal)
          <div className="flex gap-3 p-4">
            {/* Image Container */}
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={scrap.image_url || '/placeholder.jpg'}
                alt={scrap.title || 'Scrap image'}
                fill
                className="object-cover rounded-lg"
                unoptimized={true}
              />
            </div>
            
            {/* Content Container */}
            <div className="flex-1 min-w-0">
              {/* Title - Priority 1 */}
              {scrap.title && (
                <h3 className="text-sm font-semibold text-neutral-text-primary mb-2 line-clamp-2">
                  {highlightedTitle ?? scrap.title}
                </h3>
              )}
              
              {/* Description - Priority 2 */}
              {scrap.content && (
                <p className="text-xs text-neutral-text-secondary mb-2 line-clamp-3 leading-relaxed">
                  {highlightedContent ?? scrap.content}
                </p>
              )}
              
              {/* Source - Priority 3 */}
              {scrap.source && (
                <p className="text-xs text-neutral-text-secondary font-medium mb-2">
                  {highlightedSource ?? scrap.source}
                </p>
              )}
              
              {/* Meta + Actions - Priority 4 */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-text-muted">
                  {new Date(scrap.created_at).toLocaleDateString()}
                </span>
                <ActionButtons />
              </div>
            </div>
          </div>
        ) : (
          // Text Card Layout (Vertical Compact)
          <div className="p-4 border-l-4 border-l-brand-primary">
            {/* Title - Priority 1 */}
            {scrap.title && (
              <h3 className="text-sm font-semibold text-neutral-text-primary mb-2 line-clamp-2">
                {highlightedTitle ?? scrap.title}
              </h3>
            )}
            
            {/* Quote - Priority 2 */}
            {scrap.content && (
              <div className="relative mb-3">
                <p className="text-sm italic text-neutral-text-primary leading-relaxed line-clamp-3 pl-4">
                  <span className="absolute left-0 top-0 text-neutral-text-muted">"</span>
                  {highlightedContent ?? scrap.content}
                  <span className="text-neutral-text-muted">"</span>
                </p>
              </div>
            )}
            
            {/* Attribution - Priority 3 */}
            {scrap.source && (
              <p className="text-xs text-neutral-text-secondary font-medium mb-2 pl-4">
                <span className="text-neutral-text-muted">— </span>
                {highlightedSource ?? scrap.source}
              </p>
            )}
            
            {/* Meta + Actions - Priority 4 */}
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