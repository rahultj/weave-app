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
  const bgColor = variant === 'error' ? 'bg-red-50' : 'bg-gray-50'
  const iconColor = variant === 'error' ? 'text-red-500' : 'text-gray-400'
  const actionBgColor = variant === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#C85A5A] hover:bg-[#B64A4A]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center py-16 max-w-2xl mx-auto px-4"
    >
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8 text-base leading-relaxed">
        {message}
      </p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className={`${actionBgColor} text-white px-8 py-3 rounded-xl transition-colors font-medium shadow-sm hover:shadow-md`}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
} 