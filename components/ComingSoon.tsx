'use client'

import { motion } from 'framer-motion'
import { Tag, Brain, BookOpen } from 'lucide-react'

const features = [
  {
    icon: Tag,
    title: 'Create themed collections',
    description: 'Group discoveries around the ideas that fascinate you'
  },
  {
    icon: Brain,
    title: 'Uncover hidden patterns',
    description: 'AI reveals the threads connecting your taste'
  },
  {
    icon: BookOpen,
    title: 'Build your exploration list',
    description: 'Turn insights into your next cultural discoveries'
  }
]

export default function ComingSoon() {
  return (
    <motion.section 
      className="mt-8 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-neutral-bg-card border border-neutral-border rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-text-primary mb-2">
            Coming Soon
          </h2>
          <p className="text-sm text-neutral-text-secondary">
            New features we're working on
          </p>
        </div>
        
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-brand-primary bg-opacity-10 rounded-lg flex items-center justify-center mt-0.5">
                <feature.icon 
                  size={16} 
                  className="text-brand-primary"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-neutral-text-primary text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
} 