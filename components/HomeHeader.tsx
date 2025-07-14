'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

type HomeHeaderProps = {
  search: string
  setSearch: (value: string) => void
}

export default function HomeHeader({ search, setSearch }: HomeHeaderProps) {
  const { user, signOut } = useAuth()
  const [input, setInput] = useState(search)

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(input)
    }, 300)
    return () => clearTimeout(handler)
  }, [input, setSearch])

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  }

  return (
    <header className="bg-neutral-bg-card border-b border-neutral-border sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-neutral-text-primary">
            weave
          </h1>
          <button
            data-tally-open="waJWrW"
            data-tally-emoji-text="👋"
            data-tally-emoji-animation="wave"
            className="p-2 text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-bg-hover rounded-lg transition-colors text-sm font-medium"
            aria-label="Feedback"
          >
            <span className="hidden sm:inline">Feedback</span>
            <span className="sm:hidden">💬</span>
          </button>
        </div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search your scraps..."
          className="w-full sm:w-64 p-2 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-neutral-text-primary text-sm"
        />
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-neutral-text-secondary hidden sm:block">
              {user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="p-2 text-neutral-text-secondary hover:text-neutral-text-primary hover:bg-neutral-bg-hover rounded-lg transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}