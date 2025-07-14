import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, MessageSquare, Notebook, ChevronRight, ChevronLeft, X } from 'lucide-react'
import OnboardingStep from './OnboardingStep'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const ONBOARDING_STEPS = [
  {
    icon: <Book size={32} className="text-brand-primary" />,
    title: "Save Cultural Discoveries",
    description: "Capture and organize your favorite quotes, thoughts, and images in one beautiful place."
  },
  {
    icon: <MessageSquare size={32} className="text-brand-primary" />,
    title: "Chat with Bobbin",
    description: "Meet Bobbin, your friendly AI companion who helps you explore and understand your cultural discoveries."
  },
  {
    icon: <Notebook size={32} className="text-brand-primary" />,
    title: "Build Your Journal",
    description: "Create a personal collection of cultural insights that grows with you over time."
  }
]

const STORAGE_KEY = 'weave-onboarding-completed'

// Temporary debug mode - set to true to see container boundaries
const DEBUG_MODE = false

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(STORAGE_KEY)
    if (completed) {
      setHasSeenOnboarding(true)
      onClose()
    }
  }, [onClose])

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setHasSeenOnboarding(true)
    onClose()
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  if (!isOpen || hasSeenOnboarding) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={handleComplete}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed inset-4 sm:inset-8 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-neutral-bg-main rounded-xl shadow-xl z-50 p-4 sm:p-6 max-h-[90vh] overflow-y-auto ${DEBUG_MODE ? 'debug-onboarding' : ''}`}
        style={DEBUG_MODE ? { border: '2px solid red' } : {}}
      >
        {/* Close button */}
        <button
          onClick={handleComplete}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
          aria-label="Skip onboarding"
        >
          <X size={20} />
        </button>

        {/* Steps */}
        <div className="mb-6 sm:mb-8 pt-4 sm:pt-6">
          <AnimatePresence mode="wait">
            {ONBOARDING_STEPS.map((step, index) => (
              <OnboardingStep
                key={index}
                icon={step.icon}
                title={step.title}
                description={step.description}
                isActive={currentStep === index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6 sm:mb-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentStep === index
                  ? 'bg-brand-primary'
                  : 'bg-neutral-border'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            className={`p-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-neutral-text-muted cursor-not-allowed'
                : 'text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-bg-hover'
            }`}
            disabled={currentStep === 0}
            aria-label="Previous step"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <button
            onClick={handleComplete}
            className="text-sm text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
          >
            Skip
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            className="p-2 rounded-lg text-brand-primary hover:bg-neutral-bg-hover transition-colors"
            aria-label={currentStep === ONBOARDING_STEPS.length - 1 ? "Complete" : "Next step"}
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </>
  )
} 