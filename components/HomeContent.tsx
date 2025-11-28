'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import HomeHeader from '@/components/HomeHeader'
import ScrapFeed from '@/components/ScrapFeed'
import ArtifactFeed from '@/components/ArtifactFeed'
import ComingSoon from '@/components/ComingSoon'
import SignInModal from '@/components/SignInModal'
import OnboardingModal from '@/components/OnboardingModal'
import InstallPrompt from '@/components/InstallPrompt'
import OfflineIndicator from '@/components/OfflineIndicator'
import ErrorBoundary, { FeedErrorFallback, ModalErrorFallback } from '@/components/ErrorBoundary'
import SimpleInput from '@/components/SimpleInput'

export default function HomeContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [useNewFeed, setUseNewFeed] = useState(true) // Toggle for testing new UI

  // Check if we should show onboarding when user logs in
  useEffect(() => {
    if (user && !loading) {
      const hasCompletedOnboarding = localStorage.getItem('weave-onboarding-completed')
      setShowOnboarding(!hasCompletedOnboarding)
    }
  }, [user, loading])

  const handleStartConversation = () => {
    if (!user) {
      setIsSignInModalOpen(true)
    } else {
      router.push('/chat')
    }
  }



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C85A5A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Weave...</p>
        </div>
      </div>
    )
  }

  // Show sign-in if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
          <div className="text-center w-full max-w-md mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                weave
              </h1>
              <p className="text-base sm:text-lg text-gray-600 px-2">
                Your personal cultural journal
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 mx-2 sm:mx-0 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Welcome to Weave
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                Save and explore the books, quotes, thoughts, and cultural discoveries that inspire you.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="w-full py-3 px-6 bg-[#C85A5A] text-white rounded-lg hover:bg-[#B64A4A] transition-colors font-medium text-sm sm:text-base"
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

      {/* Simple Input at Top of Feed */}
      <SimpleInput placeholder="What interests you?" />

      {/* Toggle Button (for testing) */}
      <div className="max-w-2xl mx-auto px-4 py-2">
        <button
          onClick={() => setUseNewFeed(!useNewFeed)}
          className="text-caption text-neutral-text-muted hover:text-brand-primary transition-colors"
        >
          {useNewFeed ? '← Switch to old feed' : 'Switch to new feed →'}
        </button>
      </div>

      <div className="py-6">
        <ErrorBoundary FallbackComponent={FeedErrorFallback}>
          {useNewFeed ? (
            <ArtifactFeed />
          ) : (
            <ScrapFeed key={refreshKey} search={search} onStartConversation={handleStartConversation} />
          )}
        </ErrorBoundary>
        {!useNewFeed && (
          <div className="max-w-2xl mx-auto px-4">
            <ComingSoon />
          </div>
        )}
      </div>

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

      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />
    </main>
  )
} 