'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageCircle, Trash2, Edit3 } from 'lucide-react'
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
  highlightedCreator?: ReactNode
  highlightedTags?: ReactNode[]
}

export default function ScrapCard({ 
  scrap, 
  onUpdate, 
  onDelete, 
  highlightedTitle, 
  highlightedContent, 
  highlightedCreator, 
}: ScrapCardProps) {
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
        <Edit3 size={14} className="text-neutral-text-secondary group-hover:text-brand-primary transition-colors" />
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
        <MessageCircle size={14} className="text-white group-hover:scale-110 transition-transform" />
      </motion.button>
    </div>
  )

  if (!scrap) {
    return (
      <div className="bg-neutral-bg-card rounded-lg p-4 border border-neutral-border">
        <p className="text-neutral-text-muted">Loading observation...</p>
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
          // Image Card Layout (Vertical with large image)
          <div className="flex flex-col">
            {/* Image Container */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-lg">
              <Image
                src={scrap.image_url || '/placeholder.jpg'}
                alt={scrap.title || 'Cultural artifact image'}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            
            {/* Content Container */}
            <div className="p-4">
              {/* Title (Cultural Artifact Name) - Priority 1 */}
              {scrap.title && (
                <h3 className="text-sm font-semibold text-neutral-text-primary mb-2 line-clamp-2">
                  {highlightedTitle ?? scrap.title}
                </h3>
              )}
              
              {/* Medium - Priority 2 */}
              {scrap.medium && (
                <p className="text-xs text-neutral-text-muted mb-2">
                  {scrap.medium}
                </p>
              )}
              
              {/* Observation - Priority 3 */}
              {scrap.content && (
                <p className="text-xs text-neutral-text-secondary mb-2 line-clamp-3 leading-relaxed">
                  {highlightedContent ?? scrap.content}
                </p>
              )}
              
              {/* Creator - Priority 4 */}
              {scrap.creator && (
                <p className="text-xs text-neutral-text-secondary font-medium mb-2">
                  by {highlightedCreator ?? scrap.creator}
                </p>
              )}
              
              {/* Meta + Actions - Priority 5 */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-text-muted">
                  {new Date(scrap.created_at).toLocaleDateString()}
                </span>
                <ActionButtons />
              </div>
            </div>
          </div>
        ) : (
          // Text Card Layout (Vertical with proper padding)
          <div className="p-5">
            {/* Title (Cultural Artifact Name) - Priority 1 */}
            {scrap.title && (
              <h3 className="text-base font-semibold text-neutral-text-primary mb-2 line-clamp-2">
                {highlightedTitle ?? scrap.title}
              </h3>
            )}
            
            {/* Medium - Priority 2 */}
            {scrap.medium && (
              <p className="text-sm text-neutral-text-muted mb-3">
                {scrap.medium}
              </p>
            )}
            
            {/* Observation - Priority 3 */}
            {scrap.content && (
              <div className="mb-4">
                <p className="text-base text-neutral-text-primary leading-relaxed line-clamp-3">
                  {highlightedContent ?? scrap.content}
                </p>
              </div>
            )}
            
            {/* Creator - Priority 4 */}
            {scrap.creator && (
              <p className="text-sm text-neutral-text-secondary font-medium mb-3">
                by {highlightedCreator ?? scrap.creator}
              </p>
            )}
            
            {/* Meta + Actions - Priority 5 */}
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