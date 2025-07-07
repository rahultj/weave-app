import { useState, useRef, TouchEvent } from 'react'

interface PullToRefreshConfig {
  onRefresh: () => Promise<void>
  pullDistance?: number
}

export function usePullToRefresh({ onRefresh, pullDistance = 100 }: PullToRefreshConfig) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef<number | null>(null)
  const scrollTop = useRef<number | null>(null)

  const onTouchStart = (e: TouchEvent) => {
    // Only enable pull to refresh when at the top of the page
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY
      scrollTop.current = document.documentElement.scrollTop
    }
  }

  const onTouchMove = (e: TouchEvent) => {
    if (touchStartY.current === null || scrollTop.current === null) return
    if (document.documentElement.scrollTop > 0) return

    const touchY = e.touches[0].clientY
    const touchDelta = touchY - touchStartY.current

    // Only activate when pulling down
    if (touchDelta > 0) {
      setIsPulling(true)
      const progress = Math.min((touchDelta / pullDistance) * 100, 100)
      setPullProgress(progress)

      // Prevent default scrolling behavior while pulling
      if (touchDelta > 10) {
        e.preventDefault()
      }
    }
  }

  const onTouchEnd = async () => {
    if (!isPulling) return

    // If pulled far enough, trigger refresh
    if (pullProgress >= 100) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    // Reset state
    setIsPulling(false)
    setPullProgress(0)
    touchStartY.current = null
    scrollTop.current = null
  }

  return {
    isPulling,
    pullProgress,
    isRefreshing,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
} 