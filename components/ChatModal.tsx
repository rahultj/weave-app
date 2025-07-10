'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scrap } from '@/lib/scraps'
import { useAuth } from '@/contexts/AuthContext'
import { getChatHistory, saveChatHistory, deleteChatHistory } from '@/lib/chat-history'
import { SkeletonMessage } from './Skeleton'
import EmptyState from './EmptyState'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  scrap: Scrap
}

function StreamingMessage({ message }: { message: Message }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-1"
    >
      <div className="text-xs uppercase tracking-wide text-neutral-text-muted">
        {message.sender === 'ai' ? 'BOBBIN' : 'YOU'}
      </div>
      <div className={`text-neutral-text-primary ${
        message.sender === 'user' ? 'text-brand-primary font-medium' : ''
      }`}>
        {message.content}
      </div>
      <div className="text-xs text-neutral-text-muted">
        {message.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </motion.div>
  )
}

export default function ChatModal({ isOpen, onClose, scrap }: ChatModalProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hasLoadedInitialHistory, setHasLoadedInitialHistory] = useState(false)

  // Load chat history when modal opens or user changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user || !scrap.id) return
      
      setIsLoadingHistory(true)
      try {
        const history = await getChatHistory(scrap.id, user.id)
        if (history) {
          console.log('Loaded chat history:', history.messages.length, 'messages')
          setMessages(history.messages)
        } else {
          console.log('No existing chat history found')
          setMessages([])
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
        setMessages([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    if (user && scrap.id && isOpen && !hasLoadedInitialHistory) {
      console.log('Loading chat history for scrap:', scrap.id)
      loadChatHistory()
      setHasLoadedInitialHistory(true)
    }
  }, [user, scrap.id, isOpen, hasLoadedInitialHistory])

  // Reset hasLoadedInitialHistory when modal closes (but keep messages)
  useEffect(() => {
    if (!isOpen) {
      setHasLoadedInitialHistory(false)
      // Don't clear messages - they should persist when modal is closed and reopened
    }
  }, [isOpen])

  // Reset history when user changes
  useEffect(() => {
    console.log('User changed:', user?.id)
    setHasLoadedInitialHistory(false)
    setMessages([]) // Clear messages when user changes
  }, [user?.id])

  // Debug logging for important state changes
  useEffect(() => {
    if (isOpen) {
      console.log('ChatModal opened:', { 
        userId: user?.id, 
        scrapId: scrap.id, 
        hasLoadedInitialHistory,
        messageCount: messages.length 
      })
    }
  }, [isOpen, user?.id, scrap.id, hasLoadedInitialHistory, messages.length])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [currentMessage])

  const clearChatHistory = async () => {
    if (!user || !scrap.id) return
    
    try {
      await deleteChatHistory(scrap.id, user.id)
      setMessages([])
      setShowClearConfirm(false)
    } catch (error) {
      console.error('Error clearing chat history:', error)
      alert('Failed to clear chat history. Please try again.')
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return
    
    if (!user) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Please sign in to continue the conversation.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    // Create the messages array with the new user message for API call
    const messagesWithUserMessage = [...messages, userMessage]
    
    // Update UI immediately with user message
    setMessages(messagesWithUserMessage)
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          scrap: scrap,
          chatHistory: messagesWithUserMessage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from chat API')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process chat request')
      }

      // Create AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      }

      // Update UI with AI response
      const updatedMessages = [...messagesWithUserMessage, aiMessage]
      setMessages(updatedMessages)

      // Save to database in the background
      if (user && scrap.id) {
        try {
          console.log('Saving chat history with', updatedMessages.length, 'messages')
          await saveChatHistory(scrap.id, user.id, updatedMessages)
          console.log('Chat history saved successfully')
        } catch (error) {
          console.error('Error saving chat history:', error)
          // Don't show error to user since the chat is still functional
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-neutral-bg-main w-full max-w-lg max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-border bg-neutral-bg-card rounded-t-xl">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="text-neutral-text-secondary hover:text-brand-primary transition-colors"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </motion.button>
                <h2 className="text-lg font-semibold text-neutral-text-primary">
                  Chat
                </h2>
                <div className="w-6" />
              </div>

              {/* Context Card */}
              <div className="p-4 bg-neutral-bg-card border-b border-neutral-border">
                <div className="text-sm">
                  {scrap.type === 'text' ? (
                    <div>
                      <p className="italic text-neutral-text-primary mb-2">
                        &quot;{scrap.content}&quot;
                      </p>
                      {scrap.creator && (
                        <span className="text-neutral-text-muted">
                          — {scrap.creator}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-neutral-text-primary mb-1">
                        {scrap.title}
                      </h3>
                      {scrap.content && (
                        <p className="text-neutral-text-secondary text-sm">
                          {scrap.content}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoadingHistory ? (
                  <div className="space-y-6">
                    <SkeletonMessage isUser={false} />
                    <SkeletonMessage isUser={true} />
                    <SkeletonMessage isUser={false} />
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="Start a conversation"
                    message="Hi! I'm Bobbin. Ask me anything about this cultural discovery..."
                  />
                ) : (
                  messages.map((message) => (
                    <StreamingMessage key={message.id} message={message} />
                  ))
                )}

                {isLoading && (
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-neutral-text-muted">
                      BOBBIN
                    </div>
                    <div className="text-neutral-text-muted">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-100"></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-neutral-border bg-neutral-bg-main rounded-b-xl">
                <div className="flex gap-3">
                  <textarea
                    ref={textareaRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about this scrap..."
                    className="flex-1 resize-none bg-neutral-bg-card border border-neutral-border rounded-lg px-4 py-3 text-neutral-text-primary placeholder-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[44px] max-h-32"
                    rows={1}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    className="px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Clear Confirmation Dialog */}
          <AnimatePresence>
            {showClearConfirm && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 z-60"
                  onClick={() => setShowClearConfirm(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-bg-main rounded-lg shadow-xl z-70 p-6 max-w-sm w-full mx-4"
                >
                  <h3 className="text-lg font-semibold text-neutral-text-primary mb-2">
                    Clear Conversation
                  </h3>
                  <p className="text-neutral-text-secondary mb-6">
                    Are you sure you want to clear this conversation? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 px-4 py-2 text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={clearChatHistory}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}