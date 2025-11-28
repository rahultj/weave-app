'use client'

import { colors } from '@/lib/design'

interface InsightCardProps {
  pattern: string
  artifacts: string[]
  onExplore?: () => void
}

export default function InsightCard({ pattern, artifacts, onExplore }: InsightCardProps) {
  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{
        backgroundColor: '#FDF9F3',
        border: '1px solid #E8E0D4'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm" style={{ color: colors.ochre }}>✦</span>
        <span
          className="text-xs font-medium uppercase tracking-wide text-[#888]"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          A pattern in your taste
        </span>
      </div>

      {/* Pattern statement */}
      <p
        className="text-[17px] leading-relaxed mb-4"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        {pattern}
      </p>

      {/* Evidence */}
      <div className="mb-4">
        <span
          className="text-xs text-[#888] block mb-[6px]"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          This thread appears in:
        </span>
        <div className="flex flex-wrap items-center gap-[6px]">
          {artifacts.map((artifact, index) => (
            <span key={index}>
              <span
                className="text-[13px] text-[#555]"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                {artifact}
              </span>
              {index < artifacts.length - 1 && (
                <span className="text-[#ccc] mx-[6px]">·</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Action button */}
      {onExplore && (
        <button
          className="flex items-center gap-[6px] text-[13px] font-medium transition-opacity duration-200 hover:opacity-70"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            color: colors.ochre,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
          onClick={onExplore}
        >
          Explore this pattern
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </div>
  )
}
