'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Recommendation {
  id: string
  title: string
  creator?: string
  type: string
  reason: string
  fromPattern: string
  savedAt: string
}

interface SaveRecommendationsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (recommendations: Recommendation[]) => void
  recommendations: Array<{
    title: string
    creator?: string
    type?: string
    reason?: string
  }>
  patternContext: string
  isSaving?: boolean
}

export default function SaveRecommendationsModal({
  isOpen,
  onClose,
  onSave,
  recommendations,
  patternContext,
  isSaving = false
}: SaveRecommendationsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(recommendations.map((_, i) => `rec-${i}`))
  )

  if (!isOpen) return null

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSave = () => {
    const selected = recommendations
      .map((rec, i) => ({
        id: `rec-${Date.now()}-${i}`,
        title: rec.title,
        creator: rec.creator,
        type: rec.type || 'other',
        reason: rec.reason || '',
        fromPattern: patternContext,
        savedAt: new Date().toISOString()
      }))
      .filter((_, i) => selectedIds.has(`rec-${i}`))
    
    onSave(selected)
  }

  const selectedCount = selectedIds.size

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[480px] max-h-[80vh] bg-[#FAF8F5] rounded-t-2xl flex flex-col overflow-hidden"
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-[#E8E5E0] rounded-full mx-auto mt-3 mb-2" />

          {/* Header */}
          <div className="px-5 pb-3 border-b border-[#E8E5E0]">
            <div className="flex items-center gap-2 mb-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <h2 
                className="text-lg font-medium"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Save to Explore Later
              </h2>
            </div>
            <p 
              className="text-xs text-[#888]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Bobbin suggested these works. Select which ones to add to your exploration list.
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-2">
              {recommendations.map((rec, index) => {
                const id = `rec-${index}`
                const isSelected = selectedIds.has(id)
                
                return (
                  <button
                    key={id}
                    onClick={() => toggleSelection(id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-[#FDF9F3] border-[#C9A227]' 
                        : 'bg-[#F7F5F1] border-[#E8E5E0] opacity-60'
                    }`}
                  >
                    {/* Checkbox */}
                    <div 
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected ? 'bg-[#C9A227]' : 'bg-white border border-[#E8E5E0]'
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-medium text-[15px]"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {rec.title}
                      </h3>
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
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[#E8E5E0] space-y-2">
            <button
              onClick={handleSave}
              disabled={selectedCount === 0 || isSaving}
              className="w-full py-3.5 bg-[#C9A227] text-white rounded-xl font-medium text-sm transition-all hover:bg-[#B89220] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  Add {selectedCount} to Explore List
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-full py-2 text-[#888] text-sm transition-colors hover:text-[#666]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
