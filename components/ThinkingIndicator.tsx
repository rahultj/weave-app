'use client'

import { useState, useEffect } from 'react'

const thinkingPhrases = [
  'Pondering...',
  'Reflecting...',
  'Mulling it over...',
  'Connecting threads...',
  'Weaving thoughts...',
  'Considering...',
  'Contemplating...',
  'Gathering insights...',
  'Thinking deeply...',
  'Exploring ideas...',
]

export default function ThinkingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [dots, setDots] = useState('')

  // Rotate through phrases every 2.5 seconds
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % thinkingPhrases.length)
    }, 2500)

    return () => clearInterval(phraseInterval)
  }, [])

  // Animate dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)

    return () => clearInterval(dotInterval)
  }, [])

  // Get current phrase without the trailing dots (we'll add our own animated ones)
  const currentPhrase = thinkingPhrases[phraseIndex].replace('...', '')

  return (
    <div className="flex justify-start gap-[10px] mb-4">
      <div
        className="w-7 h-7 rounded-full bg-[#2A2A2A] text-white flex items-center justify-center text-[11px] font-medium flex-shrink-0 animate-pulse"
        style={{ fontFamily: 'var(--font-dm-sans)' }}
      >
        B
      </div>
      <div 
        className="px-4 py-3 bg-[#F7F5F1] border border-[#E8E5E0] rounded-[18px] rounded-bl-[4px] min-w-[140px]"
      >
        <span 
          className="text-[#666] text-sm italic"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          {currentPhrase}
          <span className="inline-block w-[18px] text-left">{dots}</span>
        </span>
      </div>
    </div>
  )
}

