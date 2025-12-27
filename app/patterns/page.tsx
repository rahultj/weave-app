'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import InsightCard from '@/components/InsightCard'
import PatternExploreModal from '@/components/PatternExploreModal'
import BobbinEarsIcon from '@/components/BobbinEarsIcon'
import { getUserArtifacts } from '@/lib/knowledge-graph'
import type { Artifact, DetectedPattern } from '@/lib/types/knowledge-graph'

export default function PatternsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [patterns, setPatterns] = useState<DetectedPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [patternsLoading, setPatternsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCached, setIsCached] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null)
  const [showPatternModal, setShowPatternModal] = useState(false)
  const [toExplore, setToExplore] = useState<any[]>([])

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
    }
    checkAuth()
  }, [router, supabase.auth])

  // Fetch patterns function
  const fetchPatterns = useCallback(async (forceRefresh = false) => {
    if (artifacts.length < 3) return

    if (forceRefresh) {
      setIsRefreshing(true)
    } else {
      setPatternsLoading(true)
    }

    try {
      const response = await fetch('/api/detect-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefresh })
      })
      const data = await response.json()
      if (data.success && data.patterns) {
        setPatterns(data.patterns)
        setIsCached(data.cached || false)
      }
    } catch (error) {
      console.error('Error fetching patterns:', error)
    } finally {
      setPatternsLoading(false)
      setIsRefreshing(false)
    }
  }, [artifacts.length])

  // Load artifacts and patterns
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      try {
        const userArtifacts = await getUserArtifacts(user.id, supabase)
        setArtifacts(userArtifacts)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, supabase])

  // Fetch patterns when artifacts are loaded
  useEffect(() => {
    if (artifacts.length >= 3 && !loading) {
      fetchPatterns(false)
    }
  }, [artifacts.length, loading, fetchPatterns])

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

  const handleExplorePattern = (pattern: DetectedPattern) => {
    setSelectedPattern(pattern)
    setShowPatternModal(true)
  }

  const getPatternTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      thematic: 'Thematic',
      stylistic: 'Stylistic',
      temporal: 'Era',
      creator: 'Creator',
      medium: 'Medium',
      personal: 'Personal',
    }
    return labels[type] || 'Pattern'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
        <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
      </header>

      {/* Content */}
      <div className="px-5 pt-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1
              className="text-[22px] font-medium text-[#2A2A2A]"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Patterns
            </h1>
            <p
              className="text-sm text-[#888]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Threads emerging in your taste
            </p>
          </div>
          {patterns.length > 0 && (
            <button
              onClick={() => fetchPatterns(true)}
              disabled={isRefreshing || patternsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#888] hover:text-[#666] bg-[#F7F5F1] border border-[#E8E5E0] rounded-lg transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
              title="Refresh patterns"
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={isRefreshing ? 'animate-spin' : ''}
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
        <div className="mb-6" />

        {/* Loading State */}
        {patternsLoading && (
          <div className="flex items-center gap-3 p-4 bg-[#FDF9F3] rounded-xl border border-[#E8E0D4]">
            <div className="w-5 h-5 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
            <span
              className="text-sm text-[#666]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Weaving patterns from your collection...
            </span>
          </div>
        )}

        {/* Empty State - Not enough artifacts */}
        {!patternsLoading && artifacts.length < 3 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FDF9F3] border-2 border-[#E8E0D4] flex items-center justify-center">
              <span className="text-2xl">✦</span>
            </div>
            <h2
              className="text-lg font-medium text-[#2A2A2A] mb-2"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Not enough artifacts yet
            </h2>
            <p
              className="text-sm text-[#888] mb-6"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Add at least 3 cultural works to your collection for patterns to emerge.
            </p>
            <button
              onClick={() => router.push('/weave-chat')}
              className="px-6 py-3 bg-[#C9A227] text-white rounded-lg font-medium"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Start a Conversation
            </button>
          </div>
        )}

        {/* Empty State - No patterns found */}
        {!patternsLoading && artifacts.length >= 3 && patterns.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FDF9F3] border-2 border-[#E8E0D4] flex items-center justify-center">
              <span className="text-2xl">✦</span>
            </div>
            <h2
              className="text-lg font-medium text-[#2A2A2A] mb-2"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              No patterns detected yet
            </h2>
            <p
              className="text-sm text-[#888]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Keep adding to your collection. Patterns will emerge as threads connect.
            </p>
          </div>
        )}

        {/* Pattern Cards */}
        {!patternsLoading && patterns.length > 0 && (
          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-[#FDF9F3] rounded-xl border border-[#E8DFC8] p-4"
              >
                {/* Pattern type badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#C9A227]">✦</span>
                  <span
                    className="text-[10px] uppercase tracking-wide text-[#C9A227] font-medium"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    {getPatternTypeLabel(pattern.pattern_type)}
                  </span>
                </div>

                {/* Pattern statement */}
                <h3
                  className="text-[17px] font-medium text-[#2A2A2A] mb-3 leading-snug"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {pattern.pattern}
                </h3>

                {/* Appears in */}
                <div className="mb-3">
                  <p
                    className="text-[11px] text-[#888] uppercase tracking-wide mb-1.5"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    Appears in
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pattern.artifact_titles.map((title) => (
                      <span
                        key={title}
                        className="text-xs bg-[#F7F5F1] text-[#666] px-2 py-1 rounded-md"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Explore CTA */}
                <button
                  onClick={() => handleExplorePattern(pattern)}
                  className="flex items-center gap-1 text-sm text-[#C9A227] font-medium"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Explore this pattern
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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

      {/* Bottom Navigation */}
      <BottomNav exploreBadge={toExplore.length} />
    </motion.div>
  )
}

