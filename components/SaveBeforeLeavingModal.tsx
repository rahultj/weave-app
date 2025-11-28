'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SaveBeforeLeavingModalProps {
  isOpen: boolean
  onSave: () => void
  onDiscard: () => void
  onCancel: () => void
  isSaving?: boolean
  isPatternExploration?: boolean
}

export default function SaveBeforeLeavingModal({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  isSaving = false,
  isPatternExploration = false
}: SaveBeforeLeavingModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40"
          onClick={onCancel}
        />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[480px] bg-[#FAF8F5] rounded-t-2xl p-5 pb-8"
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-[#E8E5E0] rounded-full mx-auto mb-5" />

          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-[#FDF6E3] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>

          {/* Content */}
          <h2 
            className="text-xl font-medium text-center mb-2"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {isPatternExploration ? 'Save these recommendations?' : 'Save this discovery?'}
          </h2>
          <p 
            className="text-sm text-[#666] text-center mb-6 px-4"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            {isPatternExploration 
              ? 'Bobbin suggested some works you might enjoy. Would you like to add them to your explore list?'
              : "You've been exploring something interesting. Would you like to save it to your collection before leaving?"
            }
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="w-full py-3.5 bg-[#C9A227] text-white rounded-xl font-medium text-sm transition-all hover:bg-[#B89220] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isPatternExploration ? 'Finding recommendations...' : 'Extracting...'}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {isPatternExploration ? 'See Recommendations' : 'Save to Collection'}
                </>
              )}
            </button>

            <button
              onClick={onDiscard}
              disabled={isSaving}
              className="w-full py-3.5 bg-transparent text-[#666] border border-[#E8E5E0] rounded-xl font-medium text-sm transition-all hover:bg-[#F7F5F1] disabled:opacity-50"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Discard & Leave
            </button>

            <button
              onClick={onCancel}
              disabled={isSaving}
              className="w-full py-2 text-[#888] text-sm transition-colors hover:text-[#666] disabled:opacity-50"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Keep chatting
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

