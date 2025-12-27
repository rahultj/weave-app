'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getTypeColor, getTypeIcon } from '@/lib/design'
import type { Artifact } from '@/lib/types/knowledge-graph'

interface ArtifactCardProps {
  artifact: Artifact
  onClick?: () => void
  onViewConversation?: () => void
  onDelete?: (artifactId: string) => Promise<void>
}

export default function ArtifactCard({ artifact, onClick, onViewConversation, onDelete }: ArtifactCardProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const typeColor = getTypeColor(artifact.type)
  const typeIcon = getTypeIcon(artifact.type)
  
  const hasValidImage = artifact.image_url && !imageError

  const handleViewConversation = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsNavigating(true)
    onViewConversation?.()
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(artifact.id)
    } catch (error) {
      console.error('Error deleting artifact:', error)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  // Compact layout for artifacts without images
  if (!hasValidImage) {
    return (
      <article
        className="group bg-[#F7F5F1] rounded-xl border border-[#E8E5E0] p-4 hover:shadow-sm transition-all cursor-pointer relative"
        onClick={onClick}
      >
        {/* Delete button - top right */}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#E8E5E0] hover:bg-[#DDD] flex items-center justify-center text-[#888] hover:text-[#666] transition-colors opacity-0 group-hover:opacity-100"
            title="Delete artifact"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        )}

        {/* Delete confirmation overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 rounded-xl flex flex-col items-center justify-center p-4 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white text-sm text-center mb-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Delete this artifact?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          {/* Type badge */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
            style={{ backgroundColor: typeColor }}
          >
            {typeIcon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-[17px] font-medium mb-0.5" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {artifact.title}
            </h3>
            <p className="text-[13px] text-[#666] mb-2" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              {artifact.creator && `${artifact.creator} · `}
              {artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)}
              {artifact.year && ` · ${artifact.year}`}
            </p>
            {artifact.user_notes && (
              <p 
                className="text-sm text-[#555] leading-relaxed line-clamp-2"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                {artifact.user_notes}
              </p>
            )}
          </div>
        </div>
        
        {/* Footer with conversation link */}
        {artifact.discovered_via && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#E8E5E0]">
            <button
              className="flex items-center gap-1.5 text-xs transition-all duration-200 active:scale-95"
              style={{ 
                fontFamily: 'var(--font-dm-sans)', 
                color: '#888',
                opacity: isNavigating ? 0.6 : 1
              }}
              onClick={handleViewConversation}
              disabled={isNavigating}
            >
              {isNavigating ? (
                <div 
                  className="w-[14px] h-[14px] border-2 border-[#888] border-t-transparent rounded-full animate-spin"
                />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              )}
              {isNavigating ? 'Opening...' : `From conversation on ${new Date(artifact.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </button>
          </div>
        )}
      </article>
    )
  }

  // Full layout with image
  return (
    <article
      className="group bg-[#F7F5F1] rounded-xl overflow-hidden border border-[#E8E5E0] transition-all duration-200 hover:shadow-sm cursor-pointer"
      onClick={onClick}
    >
      {/* Image with type badge */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#E8E5E0]">
        {/* Loading shimmer */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#E8E5E0] via-[#F7F5F1] to-[#E8E5E0] animate-pulse" />
        )}
        <Image
          src={artifact.image_url!}
          alt={artifact.title}
          fill
          className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 768px) 100vw, 480px"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
        />

        {/* Type badge */}
        <div
          className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white shadow-md"
          style={{ backgroundColor: typeColor }}
        >
          {typeIcon}
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"
            title="Delete artifact"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        )}

        {/* Delete confirmation overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white text-sm text-center mb-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Delete this artifact?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4 pb-[18px]">
        {/* Title */}
        <h3 className="text-lg font-medium mb-1" style={{ fontFamily: 'var(--font-cormorant)' }}>
          {artifact.title}
        </h3>

        {/* Metadata */}
        <p className="text-[13px] text-[#666] mb-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          {artifact.creator && `${artifact.creator} · `}
          {artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)}
          {artifact.year && ` · ${artifact.year}`}
        </p>

        {/* Key insight */}
        {artifact.user_notes && (
          <p
            className="text-sm italic leading-relaxed mb-[14px] text-[#444] line-clamp-2"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            "{artifact.user_notes}"
          </p>
        )}

        {/* Conversation link */}
        {artifact.discovered_via && (
          <button
            className="flex items-center gap-[6px] text-xs transition-all duration-200 active:scale-95"
            style={{ 
              fontFamily: 'var(--font-dm-sans)', 
              color: typeColor,
              opacity: isNavigating ? 0.6 : 1
            }}
            onClick={handleViewConversation}
            disabled={isNavigating}
          >
            {isNavigating ? (
              <div 
                className="w-[14px] h-[14px] border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: typeColor, borderTopColor: 'transparent' }}
              />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            )}
            {isNavigating ? 'Opening...' : `From conversation on ${new Date(artifact.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </button>
        )}
      </div>
    </article>
  )
}
