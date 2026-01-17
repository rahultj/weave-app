'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import ArtifactCard from '@/components/ArtifactCard'
import BottomNav from '@/components/BottomNav'
import BobbinEarsIcon from '@/components/BobbinEarsIcon'
import FeedbackModal, { FeedbackData } from '@/components/FeedbackModal'
import { MessageSquare } from 'lucide-react'
import { deleteArtifact } from '@/lib/knowledge-graph'
import type { Artifact } from '@/lib/types/knowledge-graph'
import type { User } from '@supabase/supabase-js'

interface FeedViewProps {
  artifacts: Artifact[]
  user: User
}

export default function FeedView({ artifacts: initialArtifacts, user }: FeedViewProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>(initialArtifacts)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [toExplore, setToExplore] = useState<any[]>([])
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Check if feedback was already submitted
  useEffect(() => {
    const submitted = localStorage.getItem('weave-feedback-submitted')
    if (submitted) {
      setFeedbackSubmitted(true)
    }
  }, [])

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedback: FeedbackData) => {
    try {
      const { error } = await supabase.from('user_feedback').insert({
        user_id: user.id,
        usage_reason: feedback.usage_reason,
        would_recommend: feedback.would_recommend,
        missing_feature: feedback.missing_feature,
        open_feedback: feedback.open_feedback,
        submitted_at: new Date().toISOString()
      })

      if (error) {
        console.error('Error saving feedback to Supabase:', error)
      }

      localStorage.setItem('weave-feedback-submitted', 'true')
      setFeedbackSubmitted(true)
      setShowFeedbackModal(false)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  // Handle image selection from feed
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
      // Store in localStorage temporarily
      localStorage.setItem('weave-pending-image', base64)
      // Navigate to chat
      router.push('/weave-chat?withImage=true')
    }
    reader.readAsDataURL(file)
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Handle artifact deletion
  const handleDeleteArtifact = async (artifactId: string) => {
    await deleteArtifact(artifactId, supabase)
    setArtifacts(prev => prev.filter(a => a.id !== artifactId))
  }

  // Load "to explore" list from localStorage for badge count
  useEffect(() => {
    const saved = localStorage.getItem('weave-to-explore')
    if (saved) {
      try {
        setToExplore(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading to-explore list:', e)
      }
    }
  }, [])

  const handleOpenChat = () => {
    router.push('/weave-chat')
  }

  const handleViewConversation = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`)
  }

  // Get user's initials for avatar
  const getInitials = () => {
    const email = user.email || ''
    return email.charAt(0).toUpperCase()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen max-w-[480px] mx-auto pb-24"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex justify-between items-center px-5 py-4 border-b border-[#E8E5E0] bg-[#FAF8F5]">
        <div className="flex items-center gap-2">
          <BobbinEarsIcon size={28} />
          <h1
            className="text-[22px] font-normal m-0 tracking-tight"
            style={{ fontFamily: 'var(--font-cormorant)', letterSpacing: '-0.02em' }}
          >
            weave
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-transparent border-none cursor-pointer text-[#2A2A2A] rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[13px] font-medium border-none cursor-pointer"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              {getInitials()}
            </button>
            
            {/* User dropdown menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  {/* Click outside to close menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 bg-white border border-[#E8E5E0] rounded-lg shadow-lg py-2 min-w-[160px] z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#E8E5E0]">
                      <p className="text-xs text-[#888] truncate" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left text-sm text-[#666] hover:bg-[#F7F5F1] transition-colors flex items-center gap-2"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Input Bar */}
      <div
        className="mx-5 my-4 p-[14px] px-4 bg-[#F7F5F1] border border-[#E8E5E0] rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 w-[calc(100%-40px)] hover:shadow-sm"
        onClick={handleOpenChat}
      >
        <span className="text-[#888] text-[15px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          What interests you?
        </span>
        <button
          className="p-1 -m-1 hover:bg-[#E8E5E0] rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
          title="Add image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
        </button>
      </div>

      {/* Collection */}
      <section className="px-5 py-2">
        <h2
          className="text-[13px] font-medium uppercase tracking-wide text-[#888] mb-5"
          style={{ fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.08em' }}
        >
          Your Collection
        </h2>

        {artifacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#888] mb-4" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              No artifacts yet. Start a conversation with Bobbin to discover and save cultural works.
            </p>
            <button
              className="px-6 py-3 bg-[#C9A227] text-white rounded-lg font-medium"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
              onClick={handleOpenChat}
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {artifacts.map((artifact, index) => (
              <motion.div 
                key={artifact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                <ArtifactCard
                  artifact={artifact}
                  onClick={() => {
                    // Navigate to conversation if available
                    if (artifact.discovered_via) {
                      handleViewConversation(artifact.discovered_via)
                    }
                  }}
                  onViewConversation={() => {
                    if (artifact.discovered_via) {
                      handleViewConversation(artifact.discovered_via)
                    }
                  }}
                  onDelete={handleDeleteArtifact}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Navigation */}
      <BottomNav exploreBadge={toExplore.length} />

      {/* Floating Feedback Button - Always visible for testing */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        onClick={() => setShowFeedbackModal(true)}
        className="fixed bottom-24 right-4 w-12 h-12 bg-[#C9A227] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#A8861E] transition-colors z-40"
        style={{ boxShadow: '0 4px 16px rgba(201, 162, 39, 0.3)' }}
        title="Share feedback"
      >
        <MessageSquare size={20} />
      </motion.button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </motion.div>
  )
}
