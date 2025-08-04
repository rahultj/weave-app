'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogOut, Search } from 'lucide-react'
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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/90">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">weave</h1>
          <button
            data-tally-open="waJWrW"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
            aria-label="Feedback"
          >
            Feedback
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search..."
              className="w-56 pl-10 pr-3 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#C85A5A] focus:bg-white outline-none text-gray-900 text-sm transition-all"
            />
          </div>
          
          {user?.email && (
            <span className="text-sm text-gray-500 hidden sm:block max-w-32 truncate">
              {user.email}
            </span>
          )}
          
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}