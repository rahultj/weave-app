'use client'

import { Search } from 'lucide-react'

export default function HomeHeader() {
  return (
    <header className="bg-neutral-bg-card border-b border-neutral-border px-5 py-4">
      <div className="flex items-center justify-between">
        {/* Weave Logo */}
        <div className="flex items-center gap-2">
          <WeaveIcon />
          <h1 className="text-xl font-semibold text-neutral-text-primary">
            weave
          </h1>
        </div>
        
        {/* Search */}
        <button className="p-2 text-neutral-text-secondary hover:text-neutral-text-primary transition-colors">
          <Search size={20} />
        </button>
      </div>
    </header>
  )
}

function WeaveIcon() {
    return (
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        className="text-brand-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* Interlocking circles representing weaving */}
        <circle cx="8" cy="8" r="6" opacity="0.6" />
        <circle cx="16" cy="8" r="6" opacity="0.8" />
        <circle cx="8" cy="16" r="6" opacity="0.8" />
        <circle cx="16" cy="16" r="6" opacity="0.6" />
      </svg>
    )
  }