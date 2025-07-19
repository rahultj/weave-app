'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageCircle, Trash2, Edit3 } from 'lucide-react'
import ChatModal from './ChatModal'
import EditScrapModal from './EditScrapModal'
import { Scrap, deleteScrap } from '@/lib/scraps'
import { ReactNode } from 'react'
import ErrorBoundary, { ChatErrorFallback, ModalErrorFallback } from './ErrorBoundary'

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

  // Extract year from created_at for museum-style display
  const getYear = () => {
    return new Date(scrap.created_at).getFullYear()
  }

  const ActionButtons = () => (
    <div className="flex items-center gap-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openEdit}
        className="w-6 h-6 bg-transparent hover:bg-neutral-bg-hover rounded-full flex items-center justify-center transition-colors"
        aria-label="Edit scrap"
      >
        <Edit3 size={12} className="text-neutral-text-muted hover:text-neutral-text-secondary transition-colors" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-6 h-6 bg-transparent hover:bg-red-50 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
        aria-label="Delete scrap"
      >
        <Trash2 size={12} className="text-neutral-text-muted hover:text-red-500 transition-colors" />
      </motion.button>
    </div>
  )

  if (!scrap) {
    return (
      <div className="bg-neutral-bg-card rounded-card p-6 border border-neutral-border">
        <p className="text-neutral-text-muted text-body">Loading artifact...</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative bg-neutral-bg-card rounded-card border border-neutral-border hover:shadow-card-hover transition-all duration-200"
      >
        <div className="p-6">
          {/* Museum Label Header */}
          <div className="mb-4">
            {/* Title, Year - Large Primary Typography */}
            <div className="mb-2">
              {scrap.title ? (
                <h2 className="text-h2 font-bold text-neutral-text-primary leading-tight">
                  {highlightedTitle ?? scrap.title}
                  <span className="text-neutral-text-muted font-normal">, {getYear()}</span>
                </h2>
              ) : (
                <h2 className="text-h2 font-bold text-neutral-text-muted leading-tight">
                  Untitled, {getYear()}
                </h2>
              )}
            </div>

            {/* Creator - Secondary Typography */}
            {scrap.creator && (
              <p className="text-h3 font-medium text-neutral-text-secondary mb-1">
                {highlightedCreator ?? scrap.creator}
              </p>
            )}

            {/* Medium - Technical Typography */}
            {scrap.medium && (
              <p className="text-body text-neutral-text-muted font-normal">
                {scrap.medium}
              </p>
            )}
          </div>

          {/* Artifact Content */}
          {scrap.type === 'image' && scrap.image_url && (
            <div className="mb-4">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-neutral-bg-hover">
                <Image
                  src={scrap.image_url}
                  alt={scrap.title || 'Cultural artifact'}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
              </div>
            </div>
          )}

          {/* Visual Separator */}
          {scrap.observations && (
            <div className="border-t border-neutral-border my-4"></div>
          )}

          {/* User's Observations */}
          {scrap.observations && (
            <div className="mb-4">
              <p className="text-body text-neutral-text-primary leading-relaxed">
                {highlightedContent ?? scrap.observations}
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between">
            <ActionButtons />
            
            {/* AI Chat Button - Rabbit icon equivalent */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openChat}
              className="w-8 h-8 bg-brand-primary hover:bg-brand-hover rounded-full flex items-center justify-center transition-colors shadow-sm"
              aria-label="Explore this artifact with AI"
            >
              <MessageCircle size={16} className="text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <ErrorBoundary FallbackComponent={ChatErrorFallback}>
        <ChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          scrap={scrap}
        />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ModalErrorFallback}>
        <EditScrapModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          scrap={scrap}
          onUpdate={onUpdate}
        />
      </ErrorBoundary>
    </>
  )
}