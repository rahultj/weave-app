'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Check, Lock, Eye, EyeOff } from 'lucide-react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

type View = 'signIn' | 'signUp' | 'forgotPassword' | 'resetSent'

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [view, setView] = useState<View>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { signInWithPassword, signUpWithPassword, resetPassword } = useAuth()

  // Validation helpers
  const validateEmail = (email: string) => /.+@.+\..+/.test(email)
  const validatePassword = (pw: string) => pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw)

  // Password strength: 0-3
  const getPasswordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    return score
  }

  // Reset all fields
  const resetFields = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(null)
    setPasswordStrength(0)
    setView('signIn')
  }

  const handleClose = () => {
    resetFields()
    onClose()
  }

  // Handlers
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validateEmail(email)) return setError('Please enter a valid email.')
    if (!validatePassword(password)) return setError('Password must be at least 8 characters and include a number.')
    setLoading(true)
    const { error } = await signInWithPassword(email.trim(), password, rememberMe)
    setLoading(false)
    if (error) setError(error.message)
    else handleClose()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validateEmail(email)) return setError('Please enter a valid email.')
    if (!validatePassword(password)) return setError('Password must be at least 8 characters and include a number.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    setLoading(true)
    const { error } = await signUpWithPassword(email.trim(), password, rememberMe)
    setLoading(false)
    if (error) setError(error.message)
    else handleClose()
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validateEmail(email)) return setError('Please enter a valid email.')
    setLoading(true)
    const { error } = await resetPassword(email.trim())
    setLoading(false)
    if (error) setError(error.message)
    else setView('resetSent')
  }

  // Password strength feedback
  const handlePasswordChange = (pw: string) => {
    setPassword(pw)
    setPasswordStrength(getPasswordStrength(pw))
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
        <AnimatePresence mode="wait">
          {view === 'signIn' && (
            <motion.div
              key="signIn"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-neutral-text-primary mb-2">Sign In</h2>
              <p className="text-neutral-text-secondary mb-6">Sign in to your Weave account</p>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary"
                    onClick={() => setShowPassword(s => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-neutral-text-secondary text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="accent-brand-primary"
                      disabled={loading}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-brand-primary text-sm hover:underline"
                    onClick={() => { setView('forgotPassword'); setError(null); }}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
                {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
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
                      <Lock size={16} />
                    )}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>
              </form>
              <div className="text-center mt-6 text-sm">
                Don't have an account?{' '}
                <button
                  className="text-brand-primary hover:underline font-medium"
                  onClick={() => { setView('signUp'); setError(null); }}
                  disabled={loading}
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
          {view === 'signUp' && (
            <motion.div
              key="signUp"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-neutral-text-primary mb-2">Sign Up</h2>
              <p className="text-neutral-text-secondary mb-6">Create your Weave account</p>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                    placeholder="Password"
                    className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary"
                    onClick={() => setShowPassword(s => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    required
                    disabled={loading}
                  />
                </div>
                {/* Password strength bar */}
                <div className="h-2 w-full bg-neutral-bg-card rounded mb-2">
                  <div
                    className={`h-2 rounded transition-all ${
                      passwordStrength === 0
                        ? 'bg-neutral-border w-1/6'
                        : passwordStrength === 1
                        ? 'bg-red-400 w-1/3'
                        : passwordStrength === 2
                        ? 'bg-yellow-400 w-2/3'
                        : 'bg-green-500 w-full'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-neutral-text-secondary text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="accent-brand-primary"
                      disabled={loading}
                    />
                    Remember me
                  </label>
                </div>
                {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
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
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </button>
                </div>
              </form>
              <div className="text-center mt-6 text-sm">
                Already have an account?{' '}
                <button
                  className="text-brand-primary hover:underline font-medium"
                  onClick={() => { setView('signIn'); setError(null); }}
                  disabled={loading}
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
          {view === 'forgotPassword' && (
            <motion.div
              key="forgotPassword"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-neutral-text-primary mb-2">Reset Password</h2>
              <p className="text-neutral-text-secondary mb-6">Enter your email to receive a password reset link.</p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 bg-neutral-bg-card border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                    required
                    disabled={loading}
                  />
                </div>
                {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setView('signIn'); setError(null); }}
                    className="flex-1 py-3 px-4 text-neutral-text-secondary border border-neutral-border rounded-lg hover:bg-neutral-bg-hover transition-colors"
                    disabled={loading}
                  >
                    Back
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
                    {loading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          {view === 'resetSent' && (
            <motion.div
              key="resetSent"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-text-primary mb-2">
                  Check your email!
                </h2>
                <p className="text-neutral-text-secondary mb-6">
                  We've sent a password reset link to <strong>{email}</strong>.<br />
                  Please follow the instructions to reset your password.
                </p>
                <button
                  onClick={() => { setView('signIn'); setError(null); setSuccess(null); }}
                  className="w-full py-3 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}