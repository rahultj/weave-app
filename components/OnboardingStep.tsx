import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface OnboardingStepProps {
  icon: ReactNode
  title: string
  description: string
  isActive: boolean
}

export default function OnboardingStep({ icon, title, description, isActive }: OnboardingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 40 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`text-center ${isActive ? 'block' : 'hidden'}`}
    >
      <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-neutral-text-primary mb-3 px-1 sm:px-2 leading-tight">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-neutral-text-secondary mx-auto px-1 sm:px-2 leading-relaxed max-w-none">
        {description}
      </p>
    </motion.div>
  )
} 