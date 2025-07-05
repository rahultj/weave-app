'use client'

import { motion } from 'framer-motion'
import { Skeleton, SkeletonTitle, SkeletonParagraph, SkeletonButton, SkeletonImage } from './Skeleton'

interface ScrapCardSkeletonProps {
  showImage?: boolean
  className?: string
}

export default function ScrapCardSkeleton({ showImage = false, className = '' }: ScrapCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-neutral-bg-card rounded-xl p-6 shadow-sm border border-neutral-border w-full max-w-md mx-auto relative group ${className}`}
    >
      {/* Menu Button Skeleton */}
      <div className="absolute top-4 right-4">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      {/* Image Skeleton (conditionally shown) */}
      {showImage && (
        <div className="mb-4">
          <SkeletonImage 
            aspectRatio="aspect-[3/4]" 
            className="rounded-lg"
          />
        </div>
      )}

      {/* Title Skeleton */}
      <div className="mb-3 pr-10">
        <SkeletonTitle />
      </div>

      {/* Content Skeleton */}
      <div className="mb-4">
        <SkeletonParagraph 
          lines={2} 
          className="text-base leading-relaxed"
        />
      </div>

      {/* Source Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-neutral-text-muted">
          <Skeleton className="h-3 w-20" />
        </div>
        <SkeletonButton size="sm" className="w-8 h-8 rounded-full" />
      </div>
    </motion.div>
  )
}

// Multiple ScrapCardSkeleton component for loading states
export function ScrapCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <ScrapCardSkeleton 
          key={index}
          showImage={index % 3 === 0} // Show image every 3rd card to simulate variety
        />
      ))}
    </div>
  )
} 