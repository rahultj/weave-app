'use client'

import { Suspense, useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import SaveArtifactModal from '@/components/SaveArtifactModal'
import SaveBeforeLeavingModal from '@/components/SaveBeforeLeavingModal'
import SaveRecommendationsModal from '@/components/SaveRecommendationsModal'
import ThinkingIndicator from '@/components/ThinkingIndicator'
import FormattedMessage from '@/components/FormattedMessage'
import BobbinIcon from '@/components/BobbinIcon'
import { createArtifact, createConversation, findOrCreateConcept, linkArtifactToConcept } from '@/lib/knowledge-graph'
import type { ArtifactType } from '@/lib/types/knowledge-graph'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  image?: string // base64 image data
}

interface ExtractedArtifact {
  title: string
  creator: string | null
  year: number | null
  type: ArtifactType
  medium: string | null
  imageUrl: string | null
  insight: string
  concepts: string[]
}

interface Recommendation {
  id: string
  title: string
  creator?: string
  type?: string
  reason?: string
}

function WeaveChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [extractedArtifact, setExtractedArtifact] = useState<ExtractedArtifact | null>(null)
  const [patternContext, setPatternContext] = useState<string | null>(null)
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false)
  const [extractedRecommendations, setExtractedRecommendations] = useState<Recommendation[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasInitializedPattern = useRef(false)

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setSelectedImage(base64)
      setImagePreview(base64)
    }
    reader.readAsDataURL(file)
  }

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  // Separate function to send the pattern exploration message
  const sendPatternExplorationMessage = useCallback(async (message: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          scrap: { id: 'general-chat', title: 'Pattern Exploration' },
          chatHistory: []
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending pattern exploration message:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle pattern exploration or topic from query params
  useEffect(() => {
    const pattern = searchParams.get('pattern')
    const topic = searchParams.get('topic')
    
    if (pattern && !hasInitializedPattern.current) {
      hasInitializedPattern.current = true
      setPatternContext(pattern)
      
      // Auto-send a message to explore the pattern
      const patternMessage = `I noticed a pattern in my collection: "${pattern}". Can you help me understand this connection better? What might it say about my taste or interests?`
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: patternMessage,
        timestamp: new Date()
      }
      setMessages([userMessage])
      
      // Trigger the AI response
      setTimeout(() => {
        sendPatternExplorationMessage(patternMessage)
      }, 100)
    } else if (topic && !hasInitializedPattern.current) {
      hasInitializedPattern.current = true
      
      // Auto-send a message about the topic (from recommendations)
      const topicMessage = `I've been meaning to explore "${topic}". Can you tell me about it? What makes it interesting?`
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: topicMessage,
        timestamp: new Date()
      }
      setMessages([userMessage])
      
      // Trigger the AI response
      setTimeout(() => {
        sendPatternExplorationMessage(topicMessage)
      }, 100)
    }
  }, [searchParams, sendPatternExplorationMessage])

  // Handle withImage parameter - load pending image from localStorage
  useEffect(() => {
    const withImage = searchParams.get('withImage')
    if (withImage === 'true') {
      const pendingImage = localStorage.getItem('weave-pending-image')
      if (pendingImage) {
        setSelectedImage(pendingImage)
        setImagePreview(pendingImage)
        // Clear from localStorage
        localStorage.removeItem('weave-pending-image')
      }
    }
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue || (selectedImage ? 'What can you tell me about this?' : ''),
      timestamp: new Date(),
      image: selectedImage || undefined
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputValue
    const imageData = selectedImage
    setInputValue('')
    clearImage()
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText || 'What can you tell me about this image?',
          image: imageData,
          scrap: { id: 'general-chat', title: 'General Conversation' },
          chatHistory: messages.map(m => ({ sender: m.role, content: m.content }))
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (messages.length === 0) return

    setIsLoading(true)

    try {
      // Call extraction API
      const response = await fetch('/api/extract-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            id: m.id,
            sender: m.role === 'user' ? 'user' : 'bobbin',
            content: m.content,
            timestamp: m.timestamp.toISOString()
          })),
          options: {
            include_suggestions: false,
            min_confidence: 0.7
          }
        })
      })

      const data = await response.json()

      console.log('Extraction response:', data)

      if (data.success && data.extraction.artifacts.length > 0) {
        const artifact = data.extraction.artifacts[0]

        // Extract the insight - use context or a generated summary
        const insight = artifact.context ||
          `Discussion about ${artifact.title}${artifact.creator ? ` by ${artifact.creator}` : ''}`

        setExtractedArtifact({
          title: artifact.title,
          creator: artifact.creator,
          year: artifact.year,
          type: artifact.type,
          medium: artifact.medium,
          imageUrl: artifact.image_url,
          insight: insight,
          concepts: data.extraction.concepts?.map((c: { name: string }) => c.name) || []
        })
        setShowSaveModal(true)
      } else {
        alert('No artifact found in conversation. Keep chatting about cultural works!')
      }
    } catch (error) {
      console.error('Error extracting entities:', error)
      alert('Error analyzing conversation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveArtifact = async (insight: string) => {
    if (!user || !extractedArtifact) return

    try {
      // Create conversation first
      const conversation = await createConversation(
        {
          title: extractedArtifact.title,
          messages: messages.map(m => ({
            id: m.id,
            sender: m.role === 'assistant' ? 'bobbin' as const : 'user' as const,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          }))
        },
        user.id,
        supabase
      )

      // Create artifact
      const savedArtifact = await createArtifact(
        {
          type: extractedArtifact.type as ArtifactType,
          title: extractedArtifact.title,
          creator: extractedArtifact.creator,
          year: extractedArtifact.year,
          medium: extractedArtifact.medium,
          user_notes: insight,
          discovered_via: conversation.id
        },
        user.id,
        supabase
      )

      // Link concepts if any
      if (extractedArtifact.concepts && extractedArtifact.concepts.length > 0) {
        for (const conceptName of extractedArtifact.concepts) {
          const concept = await findOrCreateConcept(conceptName, 'theme', user.id, supabase)
          await linkArtifactToConcept(savedArtifact.id, concept.id, user.id, 0.5, supabase)
        }
      }

      // Navigate to feed
      router.push('/feed')
    } catch (error) {
      console.error('Error saving artifact:', error)
      throw error
    }
  }

  const getInitials = () => {
    const email = user?.email || ''
    return email.charAt(0).toUpperCase()
  }

  // Check if user has unsaved conversation worth saving (at least 2 messages)
  const hasUnsavedConversation = messages.length >= 2 && !hasSaved

  // Handle navigation with save check
  const handleNavigation = useCallback((destination: string) => {
    if (hasUnsavedConversation) {
      setPendingNavigation(destination)
      setShowLeaveModal(true)
    } else {
      router.push(destination)
    }
  }, [hasUnsavedConversation, router])

  // Handle save from leave modal
  const handleSaveAndLeave = async () => {
    if (messages.length === 0) return
    
    setIsExtracting(true)

    try {
      // If this is a pattern exploration, extract recommendations instead
      if (patternContext) {
        const response = await fetch('/api/extract-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        })

        const data = await response.json()

        if (data.success && data.recommendations && data.recommendations.length > 0) {
          setExtractedRecommendations(data.recommendations)
          setShowLeaveModal(false)
          setShowRecommendationsModal(true)
        } else {
          // No recommendations found, just leave
          setShowLeaveModal(false)
          if (pendingNavigation) {
            router.push(pendingNavigation)
          }
        }
        setIsExtracting(false)
        return
      }

      // Regular conversation - extract artifact
      const response = await fetch('/api/extract-entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            id: m.id,
            sender: m.role === 'user' ? 'user' : 'bobbin',
            content: m.content,
            timestamp: m.timestamp.toISOString()
          })),
          options: {
            include_suggestions: false,
            min_confidence: 0.7
          }
        })
      })

      const data = await response.json()

      if (data.success && data.extraction.artifacts.length > 0) {
        const artifact = data.extraction.artifacts[0]
        const insight = artifact.context ||
          `Discussion about ${artifact.title}${artifact.creator ? ` by ${artifact.creator}` : ''}`

        setExtractedArtifact({
          title: artifact.title,
          creator: artifact.creator,
          year: artifact.year,
          type: artifact.type,
          medium: artifact.medium,
          imageUrl: artifact.image_url,
          insight: insight,
          concepts: data.extraction.concepts?.map((c: { name: string }) => c.name) || []
        })
        
        // Close leave modal and show save modal
        setShowLeaveModal(false)
        setShowSaveModal(true)
      } else {
        // No artifact found, just leave
        setShowLeaveModal(false)
        if (pendingNavigation) {
          router.push(pendingNavigation)
        }
      }
    } catch (error) {
      console.error('Error extracting:', error)
      // On error, just leave
      setShowLeaveModal(false)
      if (pendingNavigation) {
        router.push(pendingNavigation)
      }
    } finally {
      setIsExtracting(false)
    }
  }

  // Handle discard from leave modal
  const handleDiscardAndLeave = () => {
    setShowLeaveModal(false)
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
  }

  // Handle cancel from leave modal
  const handleCancelLeave = () => {
    setShowLeaveModal(false)
    setPendingNavigation(null)
  }

  // Mark as saved after successful save
  const handleSaveArtifactWithTracking = async (insight: string) => {
    await handleSaveArtifact(insight)
    setHasSaved(true)
  }

  // Save recommendations to localStorage
  const handleSaveRecommendations = (recommendations: Recommendation[]) => {
    // Get existing recommendations
    const existing = localStorage.getItem('weave-to-explore')
    let toExplore: Recommendation[] = []
    if (existing) {
      try {
        toExplore = JSON.parse(existing)
      } catch (e) {
        console.error('Error parsing existing recommendations:', e)
      }
    }

    // Add new recommendations (avoid duplicates by title)
    const existingTitles = new Set(toExplore.map((r) => r.title.toLowerCase()))
    const newRecs = recommendations.filter(r => !existingTitles.has(r.title.toLowerCase()))
    toExplore = [...newRecs, ...toExplore]

    // Save back to localStorage
    localStorage.setItem('weave-to-explore', JSON.stringify(toExplore))

    // Close modal and navigate
    setShowRecommendationsModal(false)
    setHasSaved(true)
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
  }

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto flex flex-col"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex justify-between items-center px-4 py-3 border-b border-[#E8E5E0] bg-[#FAF8F5]">
        <button
          className="p-2 bg-transparent border-none cursor-pointer text-[#2A2A2A] flex items-center"
          onClick={() => handleNavigation('/feed')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span className="text-base font-medium" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          Weave
        </span>
        <div className="flex items-center gap-3">
          <button
            className="bg-transparent text-[#C9A227] border-none p-[6px] rounded-lg cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-[#F7F5F1]"
            onClick={handleSave}
            disabled={isLoading || messages.length === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <div
            className="w-7 h-7 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[11px] font-medium"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            {getInitials()}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#888] mb-2" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Start a conversation about cultural works
            </p>
            <p className="text-sm text-[#999]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Ask about books, albums, films, essays...
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start gap-[10px]'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <BobbinIcon size={72} />
              </div>
            )}
            <div
              className={`px-4 py-3 rounded-[18px] max-w-[80%] text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-[#2A2A2A] text-white rounded-br-[4px]'
                  : 'bg-[#F7F5F1] border border-[#E8E5E0] rounded-bl-[4px]'
              }`}
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              {message.image && (
                <img 
                  src={message.image} 
                  alt="Uploaded" 
                  className="max-w-full rounded-lg mb-2 max-h-[200px] object-contain"
                />
              )}
              {message.role === 'assistant' ? (
                <FormattedMessage content={message.content} />
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        {isLoading && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-3 border-t border-[#E8E5E0] bg-[#FAF8F5]">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-[120px] rounded-lg border border-[#E8E5E0]"
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-[#2A2A2A] text-white rounded-full flex items-center justify-center text-xs hover:bg-[#444]"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex items-center bg-[#F7F5F1] border border-[#E8E5E0] rounded-[24px] px-4 py-1">
          <input
            type="text"
            placeholder={selectedImage ? "Ask about this image..." : "What interests you?"}
            className="flex-1 border-none bg-transparent text-sm outline-none"
            style={{ fontFamily: 'var(--font-dm-sans)', color: '#2A2A2A' }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <div className="flex items-center gap-1">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 bg-transparent border-none cursor-pointer flex items-center transition-colors ${selectedImage ? 'text-[#C9A227]' : 'text-[#999] hover:text-[#666]'}`}
              title="Add image"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
            </button>
            <button
              className="w-9 h-9 rounded-full bg-[#C9A227] border-none flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-[#B89220] disabled:opacity-50"
              onClick={sendMessage}
              disabled={isLoading || (!inputValue.trim() && !selectedImage)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && extractedArtifact && (
        <SaveArtifactModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false)
            // If we were trying to leave, continue navigation
            if (pendingNavigation) {
              router.push(pendingNavigation)
            }
          }}
          artifact={{
            title: extractedArtifact.title,
            creator: extractedArtifact.creator ?? undefined,
            year: extractedArtifact.year ?? undefined,
            type: extractedArtifact.type,
            imageUrl: extractedArtifact.imageUrl ?? undefined,
            insight: extractedArtifact.insight
          }}
          conversationDate={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          onSave={handleSaveArtifactWithTracking}
        />
      )}

      {/* Save Before Leaving Modal */}
      <SaveBeforeLeavingModal
        isOpen={showLeaveModal}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
        onCancel={handleCancelLeave}
        isSaving={isExtracting}
        isPatternExploration={!!patternContext}
      />

      {/* Save Recommendations Modal (for pattern exploration) */}
      <SaveRecommendationsModal
        isOpen={showRecommendationsModal}
        onClose={() => {
          setShowRecommendationsModal(false)
          if (pendingNavigation) {
            router.push(pendingNavigation)
          }
        }}
        onSave={handleSaveRecommendations}
        recommendations={extractedRecommendations}
        patternContext={patternContext || ''}
        isSaving={false}
      />
    </div>
  )
}

// Loading fallback for Suspense
function ChatLoading() {
  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto flex flex-col"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      <header className="sticky top-0 z-10 flex justify-between items-center px-4 py-3 border-b border-[#E8E5E0] bg-[#FAF8F5]">
        <div className="w-9 h-9 bg-[#E8E5E0] rounded animate-pulse" />
        <div className="w-16 h-5 bg-[#E8E5E0] rounded animate-pulse" />
        <div className="w-7 h-7 bg-[#E8E5E0] rounded-full animate-pulse" />
      </header>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#888]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          Loading...
        </p>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function WeaveChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <WeaveChatContent />
    </Suspense>
  )
}
