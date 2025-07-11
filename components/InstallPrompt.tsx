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
      // Check for desktop PWA (Chrome, Edge, etc.)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('PWA Debug: App already installed (standalone mode)')
        setIsInstalled(true)
        return true
      }
      
      // Check for iOS standalone mode
      if ((window.navigator as Navigator & { standalone?: boolean }).standalone) {
        console.log('PWA Debug: App already installed (iOS standalone)')
        setIsInstalled(true)
        return true
      }
      
      // Check if running in a PWA context (additional check)
      if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        console.log('PWA Debug: App already installed (minimal-ui mode)')
        setIsInstalled(true)
        return true
      }
      
      // Check for related applications (Chrome feature)
      if ('getInstalledRelatedApps' in navigator) {
        (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
          if (apps.length > 0) {
            console.log('PWA Debug: App already installed (related apps)')
            setIsInstalled(true)
          }
        }).catch(() => {
          // Ignore errors from this experimental API
        })
      }
      
      // Additional check for desktop PWA context
      if (window.location.search.includes('utm_source=pwa') || 
          window.location.search.includes('source=pwa') ||
          document.referrer.includes('weave-app')) {
        console.log('PWA Debug: App likely installed (PWA context indicators)')
        setIsInstalled(true)
        return true
      }
      
      console.log('PWA Debug: App not installed, waiting for beforeinstallprompt')
      return false
    }

    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    
    console.log(`PWA Debug: Device detection - Mobile: ${isMobile}, iOS: ${isIOS}, Android: ${isAndroid}`)
    console.log(`PWA Debug: User Agent: ${navigator.userAgent}`)
    console.log(`PWA Debug: Current URL: ${window.location.href}`)
    console.log(`PWA Debug: Service Worker supported: ${'serviceWorker' in navigator}`)
    
    // Special handling for iOS
    if (isIOS) {
      console.log('PWA Debug: iOS detected - beforeinstallprompt event not supported')
      // On iOS, we can't show custom install prompts since beforeinstallprompt doesn't fire
      // Users must manually use "Add to Home Screen" from Safari menu
      const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone
      if (isStandalone) {
        console.log('PWA Debug: iOS app running in standalone mode')
        setIsInstalled(true)
        return
      } else {
        console.log('PWA Debug: iOS app running in browser - install prompt not available')
        console.log('PWA Debug: iOS users must manually use "Add to Home Screen" from Safari menu')
        return
      }
    }

    const isAlreadyInstalled = checkInstalled()

    // Only set up install prompt listeners if not already installed
    if (isAlreadyInstalled) {
      return
    }

    // Set up timeout for Android to detect if beforeinstallprompt doesn't fire
    let timeoutId: NodeJS.Timeout | null = null
    if (isAndroid) {
      console.log('PWA Debug: Android detected - setting up beforeinstallprompt listener with timeout')
      timeoutId = setTimeout(() => {
        if (!deferredPrompt) {
          console.log('PWA Debug: Android - beforeinstallprompt event did not fire within 5 seconds')
          console.log('PWA Debug: This might indicate PWA requirements are not met or app is already installed')
        }
      }, 5000)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Debug: beforeinstallprompt event received')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Clear the timeout since we received the event
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      // Show prompt after a delay to not be too aggressive
      setTimeout(() => {
        const dismissed = localStorage.getItem('weave-install-dismissed')
        if (!dismissed) {
          console.log('PWA Debug: Showing custom install prompt')
          setShowPrompt(true)
        } else {
          console.log('PWA Debug: Install prompt previously dismissed')
        }
      }, 3000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA Debug: App installed successfully')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      
      // Clear timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [deferredPrompt])

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