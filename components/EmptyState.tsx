import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'error'
}

export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  variant = 'default'
}: EmptyStateProps) {
  const bgColor = variant === 'error' ? 'bg-red-50' : 'bg-neutral-bg-hover'
  const iconColor = variant === 'error' ? 'text-red-500' : 'text-neutral-text-muted'
  const actionBgColor = variant === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-primary hover:bg-brand-hover'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-12"
    >
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-neutral-text-primary mb-2">
        {title}
      </h3>
      <p className="text-neutral-text-secondary max-w-md mx-auto mb-6">
        {message}
      </p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className={`${actionBgColor} text-white px-6 py-2 rounded-lg transition-colors`}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
} 