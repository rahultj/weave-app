'use client'

import { motion } from 'framer-motion'
import { Skeleton, SkeletonTitle, SkeletonParagraph, SkeletonButton, SkeletonImage } from './Skeleton'

interface ScrapCardSkeletonProps {
  showImage?: boolean
  className?: string
}

export default function ScrapCardSkeleton({ showImage = false, className = '' }: ScrapCardSkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse ${className}`}>
      {/* Large image skeleton - Substack style */}
      {showImage && (
        <div className="aspect-[16/10] bg-gray-200"></div>
      )}
      
      {/* Content with better spacing */}
      <div className="p-6 space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
        
        {/* Creator skeleton */}
        <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
        </div>
        
        {/* Metadata row skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="h-3 bg-gray-200 rounded-md w-20"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
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