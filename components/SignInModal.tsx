'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Check } from 'lucide-react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { signInWithMagicLink } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    const { error } = await signInWithMagicLink(email.trim())
    
    if (error) {
      alert('Error sending magic link: ' + error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const handleClose = () => {
    setEmail('')
    setSent(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-neutral-bg-main rounded-xl p-6 w-full max-w-md border border-neutral-border"
      >
        {!sent ? (
          <>
            <h2 className="text-xl font-semibold text-neutral-text-primary mb-2">
              Welcome to Weave
            </h2>
            <p className="text-neutral-text-secondary mb-6">
              Enter your email to get a magic link for secure sign-in.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 text-neutral-text-secondary border border-neutral-border rounded-lg hover:bg-neutral-bg-hover transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-text-primary mb-2">
              Check your email!
            </h2>
            <p className="text-neutral-text-secondary mb-6">
              We've sent a magic link to <strong>{email}</strong>. Click the link to sign in securely.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
            >
              Got it
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}