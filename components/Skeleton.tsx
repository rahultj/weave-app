'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SkeletonProps {
  className?: string
  children?: ReactNode
}

// Base skeleton with breathing animation
export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-neutral-bg-hover rounded-lg ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// Text skeleton variants
export function SkeletonText({ className = '', lines = 1, widths = ['100%'] }: {
  className?: string
  lines?: number
  widths?: string[]
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index < widths.length ? `w-[${widths[index]}]` : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonTitle({ className = '' }: { className?: string }) {
  return (
    <Skeleton className={`h-6 w-3/4 ${className}`} />
  )
}

export function SkeletonParagraph({ className = '', lines = 3 }: { 
  className?: string
  lines?: number 
}) {
  const widths = ['100%', '90%', '75%', '60%']
  return (
    <SkeletonText 
      className={className}
      lines={lines}
      widths={widths.slice(0, lines)}
    />
  )
}

// Image skeleton
export function SkeletonImage({ className = '', aspectRatio = 'aspect-square' }: {
  className?: string
  aspectRatio?: string
}) {
  return (
    <Skeleton className={`w-full ${aspectRatio} ${className}`} />
  )
}

// Button skeleton
export function SkeletonButton({ className = '', size = 'md' }: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  }
  
  return (
    <Skeleton className={`${heightClasses[size]} w-20 rounded-full ${className}`} />
  )
}

// Avatar skeleton
export function SkeletonAvatar({ className = '', size = 'md' }: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }
  
  return (
    <Skeleton className={`${sizeClasses[size]} rounded-full ${className}`} />
  )
}

// Card skeleton
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-neutral-bg-card rounded-xl p-6 shadow-sm border border-neutral-border ${className}`}>
      <div className="space-y-4">
        <SkeletonTitle />
        <SkeletonParagraph lines={2} />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <SkeletonButton size="sm" />
        </div>
      </div>
    </div>
  )
}

// Message skeleton for chat
export function SkeletonMessage({ isUser = false, className = '' }: {
  isUser?: boolean
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-xs uppercase tracking-wide text-neutral-text-muted">
        {isUser ? 'YOU' : 'AI ASSISTANT'}
      </div>
      <div className={`${isUser ? 'text-brand-primary' : ''}`}>
        <SkeletonParagraph lines={Math.floor(Math.random() * 3) + 1} />
      </div>
      <div className="text-xs text-neutral-text-muted">
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
} 