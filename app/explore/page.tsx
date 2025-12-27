'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import BobbinEarsIcon from '@/components/BobbinEarsIcon'

interface Recommendation {
  id: string
  title: string
  creator?: string
  type?: string
  reason?: string
  fromPattern?: string
}

export default function ExplorePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toExplore, setToExplore] = useState<Recommendation[]>([])

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
      setLoading(false)
    }
    checkAuth()
  }, [router, supabase.auth])

  // Load "to explore" list from localStorage
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

  const handleChatAbout = (rec: Recommendation) => {
    router.push(`/weave-chat?topic=${encodeURIComponent(rec.title)}`)
  }

  const handleDismiss = (index: number) => {
    const updated = toExplore.filter((_, i) => i !== index)
    setToExplore(updated)
    localStorage.setItem('weave-to-explore', JSON.stringify(updated))
  }

  const handleClearAll = () => {
    setToExplore([])
    localStorage.removeItem('weave-to-explore')
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
        <h1
          className="text-[22px] font-medium text-[#2A2A2A] mb-2"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          To Explore
        </h1>
        <p
          className="text-sm text-[#888] mb-6"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          Recommendations from your patterns
        </p>

        {/* Empty State */}
        {toExplore.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F7F5F1] border-2 border-[#E8E5E0] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <h2
              className="text-lg font-medium text-[#2A2A2A] mb-2"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Nothing to explore yet
            </h2>
            <p
              className="text-sm text-[#888] mb-6"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Explore patterns in your collection to discover new recommendations.
            </p>
            <button
              onClick={() => router.push('/patterns')}
              className="px-6 py-3 bg-[#C9A227] text-white rounded-lg font-medium"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              View Patterns
            </button>
          </div>
        )}

        {/* Recommendations List */}
        {toExplore.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {toExplore.map((rec, index) => (
                <motion.div
                  key={rec.id || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#F7F5F1] rounded-xl border border-[#E8E5E0] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-[16px] font-medium text-[#2A2A2A] mb-0.5"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {rec.title}
                      </h3>
                      <p
                        className="text-[13px] text-[#666] mb-2"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                      >
                        {rec.creator}
                        {rec.type && ` · ${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}`}
                      </p>
                      {rec.fromPattern && (
                        <p
                          className="text-xs text-[#888] leading-relaxed"
                          style={{ fontFamily: 'var(--font-dm-sans)' }}
                        >
                          From: {rec.fromPattern.length > 60 ? `${rec.fromPattern.slice(0, 60)}...` : rec.fromPattern}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleChatAbout(rec)}
                        className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E8E5E0] flex items-center justify-center text-[#888] hover:text-[#C9A227] hover:border-[#C9A227] transition-colors"
                        title="Chat about this"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDismiss(index)}
                        className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E8E5E0] flex items-center justify-center text-[#888] hover:text-red-500 hover:border-red-300 transition-colors"
                        title="Dismiss"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Clear all button */}
            <button
              onClick={handleClearAll}
              className="w-full mt-4 py-2.5 text-sm text-[#888] hover:text-[#666] transition-colors"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Clear all recommendations
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav exploreBadge={toExplore.length} />
    </motion.div>
  )
}

