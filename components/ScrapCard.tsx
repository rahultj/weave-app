'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageCircle, Trash2, Edit3, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BobinChatDialog } from './BobinChatDialog'
import EditScrapModal from './EditScrapModal'
import { Scrap, deleteScrap } from '@/lib/scraps'
import { ReactNode } from 'react'
import ErrorBoundary, { ModalErrorFallback } from './ErrorBoundary'

// Format date for metadata display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

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
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openChat = () => {
    setIsChatOpen(true)
  }

  const openEdit = () => {
    setIsEditOpen(true)
  }

  const continueConversation = () => {
    if (scrap.type === 'conversation' && (scrap as any).conversation_id) {
      router.push(`/chat?conversation_id=${(scrap as any).conversation_id}`)
    }
  }

  // Parse conversation data for display
  const getConversationInfo = () => {
    if (scrap.type !== 'conversation') {
      return null
    }
    
    try {
      const content = (scrap as any).content
      if (!content) return null
      
      const conversationArray = JSON.parse(content)
      const messageCount = conversationArray.length
      const exchanges = Math.floor(messageCount / 2)
      const firstMessage = conversationArray[0]?.message || ''
      
      return {
        messageCount,
        exchanges,
        firstMessage: firstMessage.slice(0, 150) + (firstMessage.length > 150 ? '...' : ''),
        conversation_id: (scrap as any).conversation_id
      }
    } catch (error) {
      console.error('Error parsing conversation:', error)
      return null
    }
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
      <div className="bg-neutral-bg-card rounded-card p-6 border border-neutral-border">
        <p className="text-neutral-text-muted text-body">Loading artifact...</p>
      </div>
    )
  }

  return (
    <>
      {/* Substack-inspired clean card design */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group"
      >
        {/* Large hero image - much bigger like Substack */}
        {scrap.type === 'image' && scrap.image_url && (
          <div className="aspect-[16/10] overflow-hidden">
            <Image
              src={scrap.image_url}
              alt={scrap.title || 'Cultural artifact'}
              width={800}
              height={500}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized={true}
            />
          </div>
        )}

        {/* Content with better spacing */}
        <div className="p-6 space-y-4">
          {/* Title - larger, more prominent */}
          <h3 className="text-xl font-semibold text-gray-900 leading-tight line-clamp-2 text-content">
            {highlightedTitle ?? (scrap.title || 'Untitled')}
          </h3>

          {/* Conversation-specific content */}
          {scrap.type === 'conversation' && (() => {
            const conversationInfo = getConversationInfo()
            return conversationInfo ? (
              <div className="space-y-3">
                <p className="text-gray-600 text-base leading-relaxed line-clamp-3 text-content">
                  {conversationInfo.firstMessage}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {conversationInfo.exchanges > 0 
                      ? `${conversationInfo.exchanges} exchanges with Bobbin`
                      : `${conversationInfo.messageCount} message${conversationInfo.messageCount !== 1 ? 's' : ''}`
                    }
                  </span>
                  <button
                    onClick={continueConversation}
                    className="inline-flex items-center gap-1 text-sm text-brand-primary hover:text-brand-hover font-medium transition-colors"
                  >
                    Continue conversation
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : null
          })()}

          {/* Regular scrap content */}
          {scrap.type !== 'conversation' && (
            <>
              {/* Creator - if exists */}
              {scrap.creator && (
                <p className="text-base font-medium text-gray-700">
                  {highlightedCreator ?? scrap.creator}
                </p>
              )}

              {/* Description - more readable */}
              {scrap.observations && (
                <p className="text-gray-600 text-base leading-relaxed line-clamp-3 text-content">
                  {highlightedContent ?? scrap.observations}
                </p>
              )}

              {/* Medium - if exists */}
              {scrap.medium && (
                <p className="text-sm text-gray-500 font-medium">
                  {scrap.medium}
                </p>
              )}
            </>
          )}

          {/* Metadata row */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>{formatDate(scrap.created_at)}</span>
            </div>

            {/* Action buttons - much more subtle */}
            <div className="flex items-center space-x-2">
              {/* Only show edit/chat for non-conversation scraps */}
              {scrap.type !== 'conversation' && (
                <>
                  {/* Edit button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openEdit}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-lg"
                    aria-label="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>

                  {/* Chat button - minimal CTA */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openChat();
                    }}
                    className="text-[#C85A5A] hover:text-[#B64A4A] transition-colors p-2 hover:bg-red-50 rounded-lg"
                    title="Chat with Bobbin about this scrap"
                    aria-label="Open chat dialog"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </motion.button>
                </>
              )}

              {/* Delete button - show for all scrap types */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <BobinChatDialog
        scrap={scrap}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

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