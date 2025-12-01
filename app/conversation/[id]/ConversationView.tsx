'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Conversation, Artifact, ConversationMessage } from '@/lib/types/knowledge-graph'
import type { User } from '@supabase/supabase-js'
import { getTypeColor, getTypeIcon } from '@/lib/design'
import FormattedMessage from '@/components/FormattedMessage'
import BobbinIcon from '@/components/BobbinIcon'

interface ConversationViewProps {
  conversation: Conversation
  artifact: Artifact | null
  user: User
}

export default function ConversationView({ conversation, artifact, user }: ConversationViewProps) {
  const router = useRouter()

  const getInitials = () => {
    const email = user.email || ''
    return email.charAt(0).toUpperCase()
  }

  // Parse messages - handle both array and string formats
  const messages: ConversationMessage[] = Array.isArray(conversation.messages) 
    ? conversation.messages 
    : []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen max-w-[480px] mx-auto flex flex-col"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-[#E8E5E0] bg-[#FAF8F5]">
        <button
          className="p-2 bg-transparent border-none cursor-pointer text-[#2A2A2A] flex items-center"
          onClick={() => router.back()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-base font-medium" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            {conversation.title || 'Conversation'}
          </h1>
          <p className="text-xs text-[#888]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            {formatDate(conversation.created_at)}
          </p>
        </div>
        <div
          className="w-7 h-7 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[11px] font-medium"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          {getInitials()}
        </div>
      </header>

      {/* Saved Artifact Banner */}
      {artifact && (
        <div 
          className="mx-4 mt-4 p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors hover:bg-[#F0EDE8]"
          style={{ 
            backgroundColor: '#F7F5F1', 
            borderColor: getTypeColor(artifact.type) + '40'
          }}
          onClick={() => router.push('/feed')}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: getTypeColor(artifact.type) }}
          >
            {getTypeIcon(artifact.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#888] mb-0.5" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Saved from this conversation
            </p>
            <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {artifact.title}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#888]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              No messages in this conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isUser = message.sender === 'user'
              const isBobbin = !isUser
              
              return (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.25,
                    delay: index * 0.03, // Fast stagger for messages
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start gap-[10px]'}`}
                >
                  {isBobbin && (
                    <div className="flex-shrink-0">
                      <BobbinIcon size={72} />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-[18px] max-w-[80%] text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#2A2A2A] text-white rounded-br-[4px]'
                        : 'bg-[#F7F5F1] border border-[#E8E5E0] rounded-bl-[4px]'
                    }`}
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    {isBobbin ? (
                      <FormattedMessage content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-4 pb-6 pt-3 border-t border-[#E8E5E0] bg-[#FAF8F5]">
        <button
          className="w-full p-3 bg-[#F7F5F1] border border-[#E8E5E0] rounded-xl text-sm text-[#666] transition-colors hover:bg-[#F0EDE8]"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
          onClick={() => router.push('/weave-chat')}
        >
          Start a new conversation
        </button>
      </div>
    </motion.div>
  )
}

