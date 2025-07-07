'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, Trash2, MessageCircle } from 'lucide-react'
import { Scrap } from '@/lib/scraps'
import { useSwipe } from '@/lib/hooks/useSwipe'

interface ScrapCardProps {
  scrap: Scrap
  onUpdate: (scrap: Scrap) => void
  onDelete: (id: string) => void
  highlightedTitle?: React.ReactNode
  highlightedContent?: React.ReactNode
  highlightedSource?: React.ReactNode
  highlightedTags?: React.ReactNode[]
  onChatClick?: () => void
}

export default function ScrapCard({
  scrap,
  onUpdate,
  onDelete,
  highlightedTitle,
  highlightedContent,
  highlightedSource,
  highlightedTags,
  onChatClick
}: ScrapCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    // Add a small delay for animation
    await new Promise(resolve => setTimeout(resolve, 300))
    onDelete(scrap.id)
  }

  const { onTouchStart, onTouchMove, onTouchEnd, isSwiping, swipeDistance } = useSwipe({
    minSwipeDistance: 100,
    onSwipeLeft: handleDelete
  })

  const cardStyle = {
    transform: isSwiping ? `translateX(${-swipeDistance}px)` : 'none',
    transition: isSwiping ? 'none' : 'transform 0.3s ease'
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative bg-neutral-bg-card rounded-xl border border-neutral-border overflow-hidden ${
        isDeleting ? 'opacity-0 scale-95' : ''
      }`}
      style={cardStyle}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      transition={{ duration: 0.3 }}
    >
      {/* Delete indicator */}
      <div 
        className="absolute inset-y-0 right-0 bg-red-500 flex items-center px-6"
        style={{
          opacity: Math.min(swipeDistance / 100, 1),
          transform: `translateX(${Math.max(100 - swipeDistance, 0)}px)`
        }}
      >
        <Trash2 className="text-white" size={24} />
      </div>

      <div className="p-6">
        {scrap.type === 'text' ? (
          <div>
            <p className="text-neutral-text-primary text-lg mb-3 leading-relaxed selection:bg-brand-primary selection:text-white">
              {highlightedContent || scrap.content}
            </p>
            {scrap.source && (
              <p className="text-neutral-text-secondary text-sm">
                — {highlightedSource || scrap.source}
              </p>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-neutral-text-primary mb-2 selection:bg-brand-primary selection:text-white">
              {highlightedTitle || scrap.title}
            </h3>
            {scrap.content && (
              <p className="text-neutral-text-secondary mb-4 selection:bg-brand-primary selection:text-white">
                {highlightedContent || scrap.content}
              </p>
            )}
            {scrap.source && (
              <p className="text-neutral-text-muted text-sm selection:bg-brand-primary selection:text-white">
                {highlightedSource || scrap.source}
              </p>
            )}
          </div>
        )}

        {scrap.tags && scrap.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {(highlightedTags || scrap.tags).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-neutral-bg-hover text-neutral-text-secondary text-sm rounded selection:bg-brand-primary selection:text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-6 -mb-2">
          <button
            onClick={() => onUpdate(scrap)}
            className="flex items-center gap-2 px-4 py-3 text-neutral-text-secondary hover:text-brand-primary transition-colors min-w-[44px] min-h-[44px]"
          >
            <Edit3 size={18} />
            <span className="sr-only md:not-sr-only">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-3 text-neutral-text-secondary hover:text-red-500 transition-colors min-w-[44px] min-h-[44px]"
          >
            <Trash2 size={18} />
            <span className="sr-only md:not-sr-only">Delete</span>
          </button>
          <button
            onClick={onChatClick}
            className="flex items-center gap-2 px-4 py-3 text-neutral-text-secondary hover:text-brand-primary transition-colors min-w-[44px] min-h-[44px]"
          >
            <MessageCircle size={18} />
            <span className="sr-only md:not-sr-only">Chat</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}