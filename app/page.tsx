'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import HomeHeader from '@/components/HomeHeader'
import ScrapFeed from '@/components/ScrapFeed'
import FloatingAddButton from '@/components/FloatingAddButton'
import AddEntryModal from '@/components/AddEntryModal'
import SignInModal from '@/components/SignInModal'
import { createScrap } from '@/lib/scraps'

export default function HomePage() {
  const { user, loading } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  const handleSaveScrap = async (scrapData: {
    type: 'text' | 'image',
    title?: string,
    content?: string,
    source?: string,
    imageFile?: File
  }) => {
    try {
      await createScrap({
        type: scrapData.type,
        title: scrapData.title,
        content: scrapData.content,
        source: scrapData.source
      }, scrapData.imageFile)
      
      console.log('✅ Successfully saved scrap!')
      window.location.reload()
    } catch (error) {
      console.error('❌ Error saving scrap:', error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-text-muted">Loading Weave...</p>
        </div>
      </div>
    )
  }

  // Show sign-in if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-bg-main">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-neutral-text-primary mb-2">
                weave
              </h1>
              <p className="text-neutral-text-secondary text-lg">
                Your personal cultural journal
              </p>
            </div>
            
            <div className="bg-neutral-bg-card rounded-xl p-8 border border-neutral-border">
              <h2 className="text-xl font-semibold text-neutral-text-primary mb-4">
                Welcome to Weave
              </h2>
              <p className="text-neutral-text-secondary mb-6">
                Save and explore the books, quotes, thoughts, and cultural discoveries that inspire you.
              </p>
              <button
                onClick={() => setIsSignInOpen(true)}
                className="w-full py-3 px-6 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        <SignInModal 
          isOpen={isSignInOpen}
          onClose={() => setIsSignInOpen(false)}
        />
      </div>
    )
  }

  // Show main app for authenticated users
  return (
    <div className="min-h-screen bg-neutral-bg-main">
      <HomeHeader />
      <ScrapFeed />
      <FloatingAddButton onClick={() => setIsModalOpen(true)} />
      
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveScrap}
      />
    </div>
  )
}