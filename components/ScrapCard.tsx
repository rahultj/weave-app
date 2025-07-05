'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import ChatModal from './ChatModal'
import EditScrapModal from './EditScrapModal'
import { Scrap, deleteScrap } from '@/lib/scraps'
import { Rabbit } from 'lucide-react';

interface ScrapCardProps {
  scrap: Scrap
  onUpdate: (updatedScrap: Scrap) => void
  onDelete: (scrapId: string) => void
}

export default function ScrapCard({ scrap, onUpdate, onDelete }: ScrapCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openChat = () => {
    setIsChatOpen(true)
    setIsMenuOpen(false)
  }

  const openEdit = () => {
    setIsEditOpen(true)
    setIsMenuOpen(false)
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
      setIsMenuOpen(false)
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
        className="bg-neutral-bg-card rounded-xl p-6 shadow-sm border border-neutral-border w-full max-w-md mx-auto relative group"
      >
        {/* Menu Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 bg-neutral-bg-main hover:bg-neutral-bg-hover rounded-full flex items-center justify-center transition-colors border border-neutral-border"
              aria-label="More options"
            >
              <MoreVertical size={16} className="text-neutral-text-secondary" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  
                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-10 bg-neutral-bg-main border border-neutral-border rounded-lg shadow-lg py-2 min-w-[120px] z-20"
                  >
                    <button
                      onClick={openEdit}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-text-primary hover:bg-neutral-bg-hover transition-colors"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {scrap.type === 'image' && scrap.image_url && (
          <div className="mb-4">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg">
              <Image
                src={scrap.image_url}
                alt={scrap.title || 'Scrap image'}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
          </div>
        )}

        {scrap.title && (
          <h3 className="text-lg font-semibold text-neutral-text-primary mb-3 pr-10 leading-tight">
            {scrap.title}
          </h3>
        )}

        {scrap.content && (
          <p className={`text-neutral-text-primary mb-4 ${
            scrap.type === 'text' ? 'italic text-base leading-relaxed' : 'text-sm leading-relaxed'
          }`}>
            {scrap.type === 'text' ? `"${scrap.content}"` : scrap.content}
          </p>
        )}

        {scrap.source && (
          <p className="text-sm text-neutral-text-secondary italic mb-4">
            — {scrap.source}
          </p>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-neutral-text-muted">
            {scrap.created_at ? new Date(scrap.created_at).toLocaleDateString() : 'Unknown date'}
          </div>
          <button
            onClick={openChat}
            className="w-8 h-8 bg-brand-primary hover:bg-brand-hover rounded-full flex items-center justify-center transition-colors group"
            aria-label="Explore this scrap"
          >
            <Rabbit size={16} className="text-white group-hover:scale-110 transition-transform" />
          </button>
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