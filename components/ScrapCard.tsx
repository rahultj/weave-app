'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Trash2, Rabbit } from 'lucide-react'
import { Scrap } from '@/lib/scraps'
import Image from 'next/image'

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
  const [imageError, setImageError] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scrap?')) {
      return
    }
    setIsDeleting(true)
    // Add a small delay for animation
    await new Promise(resolve => setTimeout(resolve, 300))
    onDelete(scrap.id)
  }

  return (
    <motion.div
      className={`bg-neutral-bg-card rounded-xl border border-neutral-border overflow-hidden ${
        isDeleting ? 'opacity-0 scale-95' : ''
      }`}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        {/* Image handling */}
        {scrap.type === 'image' && scrap.image_url && !imageError && (
          <div className="mb-4 flex justify-center">
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4] overflow-hidden rounded-lg">
              <Image
                src={scrap.image_url}
                alt={scrap.title || 'Scrap image'}
                fill
                className="object-cover rounded-lg"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={true}
              />
            </div>
          </div>
        )}

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
        <div className="flex items-center justify-end gap-2 mt-6 -mb-2">
          <button
            onClick={() => onUpdate(scrap)}
            className="flex items-center justify-center gap-2 px-4 py-3 text-neutral-text-secondary hover:text-brand-primary active:text-brand-hover transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
          >
            <Edit3 size={18} />
            <span className="sr-only md:not-sr-only">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-4 py-3 text-neutral-text-secondary hover:text-red-500 active:text-red-600 transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
          >
            <Trash2 size={18} />
            <span className="sr-only md:not-sr-only">Delete</span>
          </button>
          <button
            onClick={onChatClick}
            className="flex items-center justify-center gap-2 px-4 py-3 text-neutral-text-secondary hover:text-brand-primary active:text-brand-hover transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
          >
            <Rabbit size={18} />
            <span className="sr-only md:not-sr-only">Chat</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}