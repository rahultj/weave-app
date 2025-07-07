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
      className={`text-center px-4 ${isActive ? 'block' : 'hidden'}`}
    >
      <div className="w-14 h-14 md:w-16 md:h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
        <div className="scale-90 md:scale-100">
          {icon}
        </div>
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-neutral-text-primary mb-2 md:mb-3">
        {title}
      </h3>
      <p className="text-sm md:text-base text-neutral-text-secondary max-w-[280px] md:max-w-sm mx-auto">
        {description}
      </p>
    </motion.div>
  )
} 