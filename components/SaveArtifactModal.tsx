'use client'

import { useState } from 'react'
import Image from 'next/image'
import { colors, getTypeColor, getTypeIcon } from '@/lib/design'
import type { ArtifactType } from '@/lib/types/knowledge-graph'

interface SaveArtifactModalProps {
  isOpen: boolean
  onClose: () => void
  artifact: {
    title: string
    creator?: string
    year?: number
    type: ArtifactType
    imageUrl?: string
    insight: string
  }
  conversationDate?: string
  onSave: (insight: string) => Promise<void>
  onEditDetails?: () => void
}

export default function SaveArtifactModal({
  isOpen,
  onClose,
  artifact,
  conversationDate,
  onSave,
  onEditDetails
}: SaveArtifactModalProps) {
  const [insight, setInsight] = useState(artifact.insight)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const typeColor = getTypeColor(artifact.type)
  const typeIcon = getTypeIcon(artifact.type)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(insight)
      onClose()
    } catch (error) {
      console.error('Error saving artifact:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-t-[20px] w-full max-w-[480px] max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-4 border-b border-[#E8E5E0]">
          <h3
            className="text-[17px] font-medium m-0"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            Save to Collection
          </h3>
          <button
            className="p-1 text-[#888] cursor-pointer flex items-center justify-center bg-transparent border-none"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Artifact preview */}
          <div className="flex items-center gap-[14px] mb-5">
            {/* Thumbnail */}
            {artifact.imageUrl ? (
              <Image
                src={artifact.imageUrl}
                alt={artifact.title}
                width={64}
                height={64}
                className="rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#E8E5E0' }}
              >
                <span className="text-2xl" style={{ color: typeColor }}>
                  {typeIcon}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex items-center gap-[10px]">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] text-white"
                style={{ backgroundColor: typeColor }}
              >
                {typeIcon}
              </div>
              <div>
                <h4
                  className="text-base font-medium m-0 mb-[2px]"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {artifact.title}
                </h4>
                <p
                  className="text-[13px] text-[#666] m-0"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {artifact.creator && `${artifact.creator} · `}
                  {artifact.year && `${artifact.year} · `}
                  {artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Key insight */}
          <div className="mb-4">
            <label
              className="text-xs font-medium uppercase tracking-wide text-[#888] block mb-2"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Key insight
            </label>
            <textarea
              className="w-full p-3 border border-[#E8E5E0] rounded-lg bg-[#F7F5F1] text-sm leading-relaxed resize-none outline-none box-border"
              style={{ fontFamily: 'var(--font-dm-sans)', color: '#2A2A2A' }}
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              rows={3}
            />
          </div>

          {/* Conversation note */}
          <div className="flex items-center gap-[6px] text-xs text-[#888]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>
              From conversation{conversationDate ? ` on ${conversationDate}` : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 pt-4 border-t border-[#E8E5E0]">
          {onEditDetails && (
            <button
              className="flex-1 p-[14px] border border-[#E8E5E0] rounded-[10px] bg-transparent text-sm font-medium cursor-pointer text-[#2A2A2A]"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
              onClick={onEditDetails}
            >
              Edit Details
            </button>
          )}
          <button
            className="flex-1 p-[14px] border-none rounded-[10px] text-white text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              backgroundColor: colors.ochre
            }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save to Collection'}
          </button>
        </div>
      </div>
    </div>
  )
}
