'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, MessageCircle, Star, Lightbulb } from 'lucide-react'

// TypeScript interface for FeedbackData
export interface FeedbackData {
  usage_reason: string
  would_recommend: number // 1-5
  missing_feature: string
  open_feedback: string
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: FeedbackData) => Promise<void>
}

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [step, setStep] = useState(1)
  const [usageReason, setUsageReason] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<number | null>(null)
  const [missingFeature, setMissingFeature] = useState('')
  const [openFeedback, setOpenFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 3

  const resetForm = () => {
    setStep(1)
    setUsageReason('')
    setWouldRecommend(null)
    setMissingFeature('')
    setOpenFeedback('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSkip = () => {
    // Mark as submitted (skipped) and close
    localStorage.setItem('weave-feedback-submitted', 'skipped')
    handleClose()
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        usage_reason: usageReason,
        would_recommend: wouldRecommend || 0,
        missing_feature: missingFeature,
        open_feedback: openFeedback
      })
      handleClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return usageReason.trim().length > 0
      case 2:
        return wouldRecommend !== null
      case 3:
        return missingFeature.trim().length > 0
      default:
        return false
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-[#FAF8F5] rounded-2xl w-full max-w-[420px] border border-[#E0DCD4] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center">
                  {step === 1 && <MessageCircle size={16} className="text-[#C9A227]" />}
                  {step === 2 && <Star size={16} className="text-[#C9A227]" />}
                  {step === 3 && <Lightbulb size={16} className="text-[#C9A227]" />}
                </div>
                <span 
                  className="text-sm text-[#888]"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Quick feedback
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-[#999] hover:text-[#666] hover:bg-[#F0EDE8] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 min-h-[280px]">
              <AnimatePresence mode="wait">
                {/* Step 1: Usage Reason */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <h2
                      className="text-2xl font-normal text-[#2A2A2A] mb-2"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      What brought you to Weave?
                    </h2>
                    <p
                      className="text-[#666] text-sm mb-5"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                      We&apos;d love to understand what drew you here.
                    </p>
                    <textarea
                      value={usageReason}
                      onChange={(e) => setUsageReason(e.target.value)}
                      placeholder="I wanted a place to track the books and films that shape my thinking..."
                      className="w-full h-[120px] p-4 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all resize-none text-sm"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    />
                  </motion.div>
                )}

                {/* Step 2: Recommendation Score */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <h2
                      className="text-2xl font-normal text-[#2A2A2A] mb-2"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      How likely would you recommend Weave?
                    </h2>
                    <p
                      className="text-[#666] text-sm mb-6"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                      Be honest—we want to build something you&apos;d actually share.
                    </p>
                    <div className="flex justify-center gap-3 mb-4">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => setWouldRecommend(score)}
                          className={`w-14 h-14 rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-lg font-medium ${
                            wouldRecommend === score
                              ? 'bg-[#C9A227] border-[#C9A227] text-white shadow-[0_2px_12px_rgba(201,162,39,0.3)]'
                              : 'bg-white border-[#E0DCD4] text-[#666] hover:border-[#C9A227]/50'
                          }`}
                          style={{ fontFamily: 'var(--font-dm-sans)' }}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-[#999] px-1" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                      <span>Not likely</span>
                      <span>Very likely</span>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Missing Features & Open Feedback */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <h2
                      className="text-2xl font-normal text-[#2A2A2A] mb-2"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      What&apos;s the one thing missing?
                    </h2>
                    <p
                      className="text-[#666] text-sm mb-4"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                      The feature that would make Weave essential for you.
                    </p>
                    <textarea
                      value={missingFeature}
                      onChange={(e) => setMissingFeature(e.target.value)}
                      placeholder="I wish I could..."
                      className="w-full h-[80px] p-3.5 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all resize-none text-sm"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    />
                    <div className="mt-4">
                      <label
                        className="text-sm text-[#666] mb-2 block"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                      >
                        Anything else? <span className="text-[#999]">(optional)</span>
                      </label>
                      <textarea
                        value={openFeedback}
                        onChange={(e) => setOpenFeedback(e.target.value)}
                        placeholder="Share any other thoughts..."
                        className="w-full h-[60px] p-3.5 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all resize-none text-sm"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer with navigation */}
            <div className="px-6 pb-5">
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      dot === step
                        ? 'bg-[#C9A227] w-4'
                        : dot < step
                        ? 'bg-[#C9A227]/40'
                        : 'bg-[#E0DCD4]'
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                {step === 1 ? (
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-3 text-[#999] text-sm hover:text-[#666] transition-colors"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    Skip
                  </button>
                ) : (
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 text-[#666] border border-[#E0DCD4] rounded-xl hover:bg-[#F5F2ED] transition-colors flex items-center justify-center gap-1"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                )}

                {step < totalSteps ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 py-3 bg-[#C9A227] text-white rounded-xl font-medium hover:bg-[#A8861E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-[0_2px_12px_rgba(201,162,39,0.25)]"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className="flex-1 py-3 bg-[#C9A227] text-white rounded-xl font-medium hover:bg-[#A8861E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(201,162,39,0.25)]"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

