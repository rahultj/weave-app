'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }
      
      // Check for iOS standalone mode
      if ((window.navigator as Navigator & { standalone?: boolean }).standalone) {
        setIsInstalled(true)
        return
      }
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay to not be too aggressive
      setTimeout(() => {
        const dismissed = localStorage.getItem('weave-install-dismissed')
        if (!dismissed) {
          setShowPrompt(true)
        }
      }, 3000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('weave-install-dismissed', 'true')
  }

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-xl shadow-lg border border-neutral-border p-4 animate-in slide-in-from-bottom-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-text-primary">Install Weave</h3>
              <p className="text-sm text-neutral-text-secondary">Add to your home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-neutral-text-muted hover:text-neutral-text-secondary p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-brand-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm font-medium text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
} 