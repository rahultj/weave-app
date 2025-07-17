'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import HomeHeader from '@/components/HomeHeader'
import ScrapFeed from '@/components/ScrapFeed'
import ComingSoon from '@/components/ComingSoon'
import FloatingAddButton from '@/components/FloatingAddButton'
import AddEntryModal from '@/components/AddEntryModal'
import SignInModal from '@/components/SignInModal'
import OnboardingModal from '@/components/OnboardingModal'
import InstallPrompt from '@/components/InstallPrompt'
import OfflineIndicator from '@/components/OfflineIndicator'
import Toast from '@/components/Toast'
import { createScrap } from '@/lib/scraps'
import ErrorBoundary, { FeedErrorFallback, ModalErrorFallback } from '@/components/ErrorBoundary'

export default function HomeContent() {
  const { user, loading } = useAuth()
  const [search, setSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Check if we should show onboarding when user logs in
  useEffect(() => {
    if (user && !loading) {
      const hasCompletedOnboarding = localStorage.getItem('weave-onboarding-completed')
      setShowOnboarding(!hasCompletedOnboarding)
    }
  }, [user, loading])

  // Check for URL action parameter to auto-open add modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('action') === 'add' && user) {
      setIsAddModalOpen(true)
    }
  }, [user])

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const handleAddClick = () => {
    if (!user) {
      setIsSignInModalOpen(true)
    } else {
      setIsAddModalOpen(true)
    }
  }

  const handleSaveScrap = async (scrapData: {
    type: 'text' | 'image'
    title?: string
    observations?: string
    creator?: string
    medium?: string
    imageFile?: File
  }) => {
    if (!user) return

    setIsCreating(true)
    try {
      await createScrap({
        title: scrapData.title || 'Untitled',
        observations: scrapData.observations,
        creator: scrapData.creator,
        medium: scrapData.medium,
        type: scrapData.type
      }, scrapData.imageFile)
      
      setIsAddModalOpen(false)
      setRefreshKey(prev => prev + 1)
      setShowToast(true)
    } catch (error) {
      console.error('Error saving scrap:', error)
      // Could add error toast here
    } finally {
      setIsCreating(false)
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
          <div className="text-center w-full max-w-md mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-text-primary mb-2">
                weave
              </h1>
              <p className="text-base sm:text-lg text-neutral-text-secondary px-2">
                Your personal cultural journal
              </p>
            </div>
            
            <div className="bg-neutral-bg-card rounded-xl p-6 sm:p-8 border border-neutral-border mx-2 sm:mx-0">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-text-primary mb-4">
                Welcome to Weave
              </h2>
              <p className="text-sm sm:text-base text-neutral-text-secondary mb-6 leading-relaxed">
                Save and explore the books, quotes, thoughts, and cultural discoveries that inspire you.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="w-full py-3 px-6 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors font-medium text-sm sm:text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        <SignInModal 
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
        />

        {/* PWA Components - Show for all users */}
        <InstallPrompt />
        <OfflineIndicator />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-bg-main">
      <HomeHeader search={search} setSearch={setSearch} />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <ErrorBoundary FallbackComponent={FeedErrorFallback}>
          <ScrapFeed key={refreshKey} search={search} onAddClick={handleAddClick} />
        </ErrorBoundary>
        <ComingSoon />
      </div>
      <FloatingAddButton onClick={handleAddClick} />
      
      <ErrorBoundary FallbackComponent={ModalErrorFallback}>
        <AddEntryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveScrap}
          isSaving={isCreating}
        />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ModalErrorFallback}>
        <SignInModal
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
        />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ModalErrorFallback}>
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      </ErrorBoundary>

      <Toast
        message="Scrap saved successfully!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />
    </main>
  )
} 