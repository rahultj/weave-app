'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { DetectedPattern, Artifact } from '@/lib/types/knowledge-graph'
import { colors } from '@/lib/design'

interface PatternExploreModalProps {
  isOpen: boolean
  onClose: () => void
  pattern: DetectedPattern | null
  artifacts: Artifact[]
}

export default function PatternExploreModal({ 
  isOpen, 
  onClose, 
  pattern,
  artifacts 
}: PatternExploreModalProps) {
  const router = useRouter()

  if (!isOpen || !pattern) return null

  // Find the artifacts that match this pattern
  const relatedArtifacts = artifacts.filter(a => 
    pattern.artifact_ids.includes(a.id) || 
    pattern.artifact_titles.some(title => 
      a.title.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(a.title.toLowerCase())
    )
  )

  const handleStartConversation = () => {
    // Navigate to chat with context about exploring this pattern
    router.push(`/weave-chat?pattern=${encodeURIComponent(pattern.pattern)}`)
    onClose()
  }

  const handleViewArtifact = (artifact: Artifact) => {
    if (artifact.discovered_via) {
      router.push(`/conversation/${artifact.discovered_via}`)
      onClose()
    }
  }

  // Get pattern type label and color
  const getPatternTypeStyle = (type: string) => {
    switch (type) {
      case 'thematic':
        return { label: 'Thematic Pattern', color: colors.indigo }
      case 'stylistic':
        return { label: 'Stylistic Pattern', color: colors.crimson }
      case 'temporal':
        return { label: 'Temporal Pattern', color: colors.forest }
      case 'creator':
        return { label: 'Creator Connection', color: colors.ochre }
      case 'medium':
        return { label: 'Medium Pattern', color: '#8B7355' }
      case 'personal':
        return { label: 'Personal Pattern', color: '#6B5B95' }
      default:
        return { label: 'Pattern', color: colors.ochre }
    }
  }

  const typeStyle = getPatternTypeStyle(pattern.pattern_type)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[480px] max-h-[85vh] bg-[#FAF8F5] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#FAF8F5] border-b border-[#E8E5E0] px-5 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: typeStyle.color }}
                >
                  {typeStyle.label}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F7F5F1] flex items-center justify-center text-[#888] hover:text-[#666] hover:bg-[#E8E5E0] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {/* Pattern Statement */}
            <div className="mb-6">
              <h2 
                className="text-2xl leading-relaxed mb-3"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                {pattern.pattern}
              </h2>
              {pattern.description && pattern.description !== pattern.pattern && (
                <p 
                  className="text-sm text-[#666] leading-relaxed"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {pattern.description}
                </p>
              )}
            </div>

            {/* Connected Artifacts */}
            <div className="mb-6">
              <h3 
                className="text-xs font-medium uppercase tracking-wide text-[#888] mb-3"
                style={{ fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.08em' }}
              >
                Connected Works ({relatedArtifacts.length})
              </h3>
              
              <div className="space-y-3">
                {relatedArtifacts.map((artifact, index) => (
                  <motion.button
                    key={artifact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleViewArtifact(artifact)}
                    className="w-full flex items-start gap-3 p-3 bg-[#F7F5F1] rounded-xl border border-[#E8E5E0] text-left hover:shadow-sm transition-all"
                  >
                    {/* Artifact Image or Type Icon */}
                    <div 
                      className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center bg-[#E8E5E0] overflow-hidden"
                    >
                      {artifact.image_url ? (
                        <img 
                          src={artifact.image_url} 
                          alt={artifact.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl" style={{ color: typeStyle.color }}>
                          {artifact.type === 'book' ? '◎' : 
                           artifact.type === 'album' ? '♫' : 
                           artifact.type === 'film' ? '▷' : '✦'}
                        </span>
                      )}
                    </div>
                    
                    {/* Artifact Info */}
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-medium text-[15px] truncate"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {artifact.title}
                      </h4>
                      <p 
                        className="text-xs text-[#888] truncate"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                      >
                        {artifact.creator && `${artifact.creator} · `}
                        {artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)}
                      </p>
                      {artifact.user_notes && (
                        <p 
                          className="text-xs text-[#666] mt-1 line-clamp-1 italic"
                          style={{ fontFamily: 'var(--font-dm-sans)' }}
                        >
                          "{artifact.user_notes}"
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <svg 
                      width="16" height="16" viewBox="0 0 24 24" 
                      fill="none" stroke="#888" strokeWidth="2"
                      className="flex-shrink-0 mt-1"
                    >
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </motion.button>
                ))}

                {/* Fallback if no artifacts found */}
                {relatedArtifacts.length === 0 && (
                  <div className="text-center py-6 text-[#888]">
                    <p style={{ fontFamily: 'var(--font-dm-sans)' }}>
                      Pattern based on: {pattern.artifact_titles.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Confidence Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-[#888] mb-1">
                <span style={{ fontFamily: 'var(--font-dm-sans)' }}>Pattern confidence</span>
                <span style={{ fontFamily: 'var(--font-dm-sans)' }}>{Math.round(pattern.confidence * 100)}%</span>
              </div>
              <div className="h-1.5 bg-[#E8E5E0] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.confidence * 100}%` }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: typeStyle.color }}
                />
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="sticky bottom-0 bg-[#FAF8F5] border-t border-[#E8E5E0] px-5 py-4">
            <button
              onClick={handleStartConversation}
              className="w-full py-3.5 bg-[#2A2A2A] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#3A3A3A] transition-colors"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Explore this pattern with Bobbin
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


