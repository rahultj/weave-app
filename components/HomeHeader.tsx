'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'

export default function HomeHeader() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  }

  return (
    <header className="bg-neutral-bg-card border-b border-neutral-border sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-text-primary">
          weave
        </h1>
        
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