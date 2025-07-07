import { useState, useRef, TouchEvent } from 'react'

interface SwipeConfig {
  minSwipeDistance: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipe({ minSwipeDistance = 50, onSwipeLeft, onSwipeRight }: SwipeConfig) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)
  const swipeDistance = useRef(0)

  // The required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistancePixels = minSwipeDistance

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsSwiping(true)
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!touchStart) return

    const currentTouch = e.targetTouches[0].clientX
    const distance = touchStart - currentTouch
    swipeDistance.current = distance

    // Prevent scrolling while swiping horizontally
    if (Math.abs(distance) > 10) {
      e.preventDefault()
    }
  }

  const onTouchEnd = () => {
    if (!touchStart) return

    setIsSwiping(false)
    const distance = swipeDistance.current

    if (Math.abs(distance) >= minSwipeDistancePixels) {
      if (distance > 0 && onSwipeLeft) {
        onSwipeLeft()
      } else if (distance < 0 && onSwipeRight) {
        onSwipeRight()
      }
    }

    setTouchStart(null)
    swipeDistance.current = 0
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping,
    swipeDistance: swipeDistance.current
  }
} 