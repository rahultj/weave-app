'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Trash2 } from 'lucide-react'
import { Scrap } from '@/lib/scraps'
import { useAuth } from '@/contexts/AuthContext'
import { getChatHistory, saveChatHistory, deleteChatHistory } from '@/lib/chat-history'
import { SkeletonMessage } from './Skeleton'

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
        {message.sender === 'ai' ? 'AI ASSISTANT' : 'YOU'}
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

  const loadChatHistory = useCallback(async () => {
    if (!user || !scrap.id) return
    
    setIsLoadingHistory(true)
    try {
      const history = await getChatHistory(scrap.id, user.id)
      if (history) {
        setMessages(history.messages)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [user, scrap.id])

  // Load chat history when modal opens
  useEffect(() => {
    if (isOpen && user && scrap.id) {
      loadChatHistory()
    } else if (isOpen && !user) {
      // Clear messages if user is not authenticated
      setMessages([])
    }
  }, [isOpen, user, scrap.id, loadChatHistory])

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
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return
    
    if (!user) {
      // Show a message that user needs to be authenticated
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
      content: currentMessage,
      sender: 'user',
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          scrap: scrap,
          chatHistory: messages
        })
      })

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)

      // Save chat history to database
      if (user && scrap.id) {
        try {
          await saveChatHistory(scrap.id, user.id, finalMessages)
        } catch (error) {
          console.error('Error saving chat history:', error)
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
      
      // Save chat history even if there was an error
      if (user && scrap.id) {
        try {
          await saveChatHistory(scrap.id, user.id, finalMessages)
        } catch (error) {
          console.error('Error saving chat history:', error)
        }
      }
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
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-neutral-bg-main rounded-xl shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-border bg-neutral-bg-card rounded-t-xl">
              <button
                onClick={onClose}
                className="text-neutral-text-secondary hover:text-brand-primary transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-lg font-semibold text-neutral-text-primary">
                Explore This
              </h2>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-neutral-text-secondary hover:text-red-500 transition-colors p-1"
                    title="Clear conversation"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-neutral-text-secondary hover:text-brand-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Context Card */}
            <div className="p-4 bg-neutral-bg-card border-b border-neutral-border">
              <div className="text-sm">
                {scrap.type === 'text' ? (
                  <div>
                    <p className="italic text-neutral-text-primary mb-2">
                      &quot;{scrap.content}&quot;
                    </p>
                    {scrap.source && (
                      <p className="text-neutral-text-secondary">
                        — {scrap.source}
                      </p>
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
                <div className="text-center text-neutral-text-muted py-8">
                  <p>Ask me anything about this cultural discovery...</p>
                </div>
              ) : (
                messages.map((message) => (
                  <StreamingMessage key={message.id} message={message} />
                ))
              )}

              {isLoading && (
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-neutral-text-muted">
                    AI ASSISTANT
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
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
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