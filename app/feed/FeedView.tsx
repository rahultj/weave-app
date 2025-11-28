'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ArtifactCard from '@/components/ArtifactCard'
import InsightCard from '@/components/InsightCard'
import PatternExploreModal from '@/components/PatternExploreModal'
import { deleteArtifact } from '@/lib/knowledge-graph'
import type { Artifact, DetectedPattern } from '@/lib/types/knowledge-graph'
import type { User } from '@supabase/supabase-js'

interface FeedViewProps {
  artifacts: Artifact[]
  user: User
}

export default function FeedView({ artifacts: initialArtifacts, user }: FeedViewProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [artifacts, setArtifacts] = useState<Artifact[]>(initialArtifacts)
  const [patterns, setPatterns] = useState<DetectedPattern[]>([])
  const [patternsLoading, setPatternsLoading] = useState(false)
  const [patternsError, setPatternsError] = useState<string | null>(null)
  const [dismissedPatternIds, setDismissedPatternIds] = useState<Set<string>>(new Set())
  const [showPastDiscoveries, setShowPastDiscoveries] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null)
  const [showPatternModal, setShowPatternModal] = useState(false)
  const [toExplore, setToExplore] = useState<any[]>([])
  const [showToExplore, setShowToExplore] = useState(false)

  // Handle artifact deletion
  const handleDeleteArtifact = async (artifactId: string) => {
    await deleteArtifact(artifactId, supabase)
    setArtifacts(prev => prev.filter(a => a.id !== artifactId))
  }

  // Load dismissed patterns from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('weave-dismissed-patterns')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setDismissedPatternIds(new Set(parsed))
      } catch (e) {
        console.error('Error loading dismissed patterns:', e)
      }
    }
  }, [])

  // Load "to explore" list from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weave-to-explore')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setToExplore(parsed)
      } catch (e) {
        console.error('Error loading to-explore list:', e)
      }
    }
  }, [])

  // Fetch patterns when artifacts are available
  useEffect(() => {
    async function fetchPatterns() {
      // Only fetch patterns if we have at least 3 artifacts
      if (artifacts.length < 3) {
        setPatterns([])
        return
      }

      setPatternsLoading(true)
      setPatternsError(null)

      try {
        const response = await fetch('/api/detect-patterns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        if (data.success && data.patterns) {
          setPatterns(data.patterns)
        } else {
          setPatternsError(data.message || 'Could not detect patterns')
        }
      } catch (error) {
        console.error('Error fetching patterns:', error)
        setPatternsError('Failed to analyze patterns')
      } finally {
        setPatternsLoading(false)
      }
    }

    fetchPatterns()
  }, [artifacts.length]) // Re-fetch when artifact count changes

  const handleOpenChat = () => {
    router.push('/weave-chat')
  }

  const handleViewConversation = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`)
  }

  const handleExplorePattern = (pattern: DetectedPattern) => {
    setSelectedPattern(pattern)
    setShowPatternModal(true)
  }

  const handleDismissPattern = (patternId: string) => {
    const newDismissed = new Set([...dismissedPatternIds, patternId])
    setDismissedPatternIds(newDismissed)
    localStorage.setItem('weave-dismissed-patterns', JSON.stringify([...newDismissed]))
  }

  const handleRestorePattern = (patternId: string) => {
    const newDismissed = new Set([...dismissedPatternIds])
    newDismissed.delete(patternId)
    setDismissedPatternIds(newDismissed)
    localStorage.setItem('weave-dismissed-patterns', JSON.stringify([...newDismissed]))
  }

  const handleClearAllDismissed = () => {
    setDismissedPatternIds(new Set())
    localStorage.removeItem('weave-dismissed-patterns')
    setShowPastDiscoveries(false)
  }

  // Get user's initials for avatar
  const getInitials = () => {
    const email = user.email || ''
    return email.charAt(0).toUpperCase()
  }

  // Filter patterns into visible and dismissed
  const visiblePatterns = patterns.filter(p => !dismissedPatternIds.has(p.id))
  const dismissedPatterns = patterns.filter(p => dismissedPatternIds.has(p.id))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen max-w-[480px] mx-auto pb-12"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex justify-between items-center px-5 py-4 border-b border-[#E8E5E0] bg-[#FAF8F5]">
        <h1
          className="text-[22px] font-normal m-0 tracking-tight"
          style={{ fontFamily: 'var(--font-cormorant)', letterSpacing: '-0.02em' }}
        >
          weave
        </h1>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-transparent border-none cursor-pointer text-[#2A2A2A] rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <div
            className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[13px] font-medium"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            {getInitials()}
          </div>
        </div>
      </header>

      {/* Input Bar */}
      <button
        className="mx-5 my-4 p-[14px] px-4 bg-[#F7F5F1] border border-[#E8E5E0] rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 w-[calc(100%-40px)] hover:shadow-sm"
        onClick={handleOpenChat}
      >
        <span className="text-[#888] text-[15px]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          What interests you?
        </span>
        <div className="flex gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
        </div>
      </button>

      {/* NEW: Patterns Section - Surfaced at the Top */}
      <AnimatePresence>
        {(patternsLoading || visiblePatterns.length > 0) && artifacts.length >= 3 && (
          <motion.section 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-4"
          >
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                className="w-2 h-2 rounded-full bg-[#C9A227]"
              />
              <h2
                className="text-[13px] font-medium uppercase tracking-wide text-[#C9A227]"
                style={{ fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.08em' }}
              >
                New Discovery
              </h2>
            </div>

            {/* Loading State */}
            {patternsLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 bg-[#FDF9F3] rounded-xl border border-[#E8E0D4]"
              >
                <div className="w-5 h-5 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
                <span 
                  className="text-sm text-[#666]"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Weaving patterns from your collection...
                </span>
              </motion.div>
            )}

            {/* Pattern Cards */}
            {!patternsLoading && visiblePatterns.length > 0 && (
              <div className="space-y-3">
                {visiblePatterns.map((pattern, index) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="relative"
                  >
                    {/* Dismiss button */}
                    <button
                      onClick={() => handleDismissPattern(pattern.id)}
                      className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[#888] hover:text-[#666] hover:bg-white transition-all"
                      aria-label="Dismiss"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                    
                    <InsightCard
                      pattern={pattern.pattern}
                      artifacts={pattern.artifact_titles}
                      onExplore={() => handleExplorePattern(pattern)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Past Discoveries Toggle - Only show if there are dismissed patterns */}
      {dismissedPatterns.length > 0 && (
        <div className="px-5 pb-2">
          <button
            onClick={() => setShowPastDiscoveries(!showPastDiscoveries)}
            className="flex items-center gap-2 text-xs text-[#888] hover:text-[#666] transition-colors"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            <svg 
              width="12" height="12" viewBox="0 0 24 24" 
              fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${showPastDiscoveries ? 'rotate-90' : ''}`}
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
            Past Discoveries ({dismissedPatterns.length})
          </button>

          {/* Past Discoveries Panel */}
          <AnimatePresence>
            {showPastDiscoveries && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {dismissedPatterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className="flex items-start gap-3 p-3 bg-[#F7F5F1] rounded-lg border border-[#E8E5E0]"
                    >
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm text-[#666] line-clamp-2"
                          style={{ fontFamily: 'var(--font-dm-sans)' }}
                        >
                          {pattern.pattern}
                        </p>
                        <p 
                          className="text-xs text-[#999] mt-1"
                          style={{ fontFamily: 'var(--font-dm-sans)' }}
                        >
                          {pattern.artifact_titles.slice(0, 2).join(', ')}
                          {pattern.artifact_titles.length > 2 && ` +${pattern.artifact_titles.length - 2} more`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleExplorePattern(pattern)}
                          className="p-1.5 text-[#888] hover:text-[#C9A227] hover:bg-[#FDF9F3] rounded transition-colors"
                          title="Explore"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRestorePattern(pattern.id)}
                          className="p-1.5 text-[#888] hover:text-[#4A7C59] hover:bg-[#F0F7F2] rounded transition-colors"
                          title="Restore to feed"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Clear all button */}
                  <button
                    onClick={handleClearAllDismissed}
                    className="w-full py-2 text-xs text-[#999] hover:text-[#666] transition-colors"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    Clear history
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* To Explore Section */}
      {toExplore.length > 0 && (
        <div className="px-5 pb-2">
          <button
            onClick={() => setShowToExplore(!showToExplore)}
            className="flex items-center gap-2 text-xs text-[#888] hover:text-[#666] transition-colors"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            <svg 
              width="12" height="12" viewBox="0 0 24 24" 
              fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${showToExplore ? 'rotate-90' : ''}`}
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              To Explore ({toExplore.length})
            </span>
          </button>

          <AnimatePresence>
            {showToExplore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {toExplore.map((rec, index) => (
                    <div
                      key={rec.id || index}
                      className="flex items-start gap-3 p-3 bg-[#FDF9F3] rounded-lg border border-[#E8E5E0]"
                    >
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm font-medium"
                          style={{ fontFamily: 'var(--font-cormorant)' }}
                        >
                          {rec.title}
                        </p>
                        {rec.creator && (
                          <p 
                            className="text-xs text-[#888]"
                            style={{ fontFamily: 'var(--font-dm-sans)' }}
                          >
                            {rec.creator}
                            {rec.type && ` · ${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}`}
                          </p>
                        )}
                        {rec.reason && (
                          <p 
                            className="text-xs text-[#666] mt-1 line-clamp-2"
                            style={{ fontFamily: 'var(--font-dm-sans)' }}
                          >
                            {rec.reason}
                          </p>
                        )}
                        {rec.fromPattern && (
                          <p 
                            className="text-[10px] text-[#999] mt-1"
                            style={{ fontFamily: 'var(--font-dm-sans)' }}
                          >
                            From: {rec.fromPattern.slice(0, 50)}...
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            // Start a conversation about this recommendation
                            router.push(`/weave-chat?topic=${encodeURIComponent(rec.title)}`)
                          }}
                          className="p-1.5 text-[#888] hover:text-[#C9A227] hover:bg-[#FDF9F3] rounded transition-colors"
                          title="Chat about this"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            // Remove from list
                            const updated = toExplore.filter((_, i) => i !== index)
                            setToExplore(updated)
                            localStorage.setItem('weave-to-explore', JSON.stringify(updated))
                          }}
                          className="p-1.5 text-[#888] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Clear all button */}
                  <button
                    onClick={() => {
                      setToExplore([])
                      localStorage.removeItem('weave-to-explore')
                    }}
                    className="w-full py-2 text-xs text-[#999] hover:text-[#666] transition-colors"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    Clear all recommendations
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
          <div className="space-y-6">
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
                    // TODO: Navigate to artifact detail
                    console.log('View artifact:', artifact.id)
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

      {/* Pattern Explore Modal */}
      <PatternExploreModal
        isOpen={showPatternModal}
        onClose={() => {
          setShowPatternModal(false)
          setSelectedPattern(null)
        }}
        pattern={selectedPattern}
        artifacts={artifacts}
      />
    </motion.div>
  )
}
