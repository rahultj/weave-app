'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Eye, EyeOff } from 'lucide-react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

type View = 'signIn' | 'signUp' | 'forgotPassword' | 'resetSent'

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter()
  const [view, setView] = useState<View>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    if (error) {
      setError(error.message)
    } else {
      handleClose()
      router.push('/feed')
    }
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
    if (error) {
      setError(error.message)
    } else {
      handleClose()
      router.push('/feed')
    }
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
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-[#FAF8F5] rounded-2xl p-8 w-full max-w-[400px] border border-[#E0DCD4] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {view === 'signIn' && (
                <motion.div
                  key="signIn"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  <h2 
                    className="text-2xl font-normal text-[#2A2A2A] mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Welcome back
                  </h2>
                  <p className="text-[#666] text-sm mb-6" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                    Sign in to continue your cultural journal
                  </p>
                  
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-3.5 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
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
                        className="w-full p-3.5 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all pr-12"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666] transition-colors"
                        onClick={() => setShowPassword(s => !s)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-[#666] text-sm cursor-pointer" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-[#E0DCD4] text-[#C9A227] focus:ring-[#C9A227]/30"
                          disabled={loading}
                        />
                        Remember me
                      </label>
                      <button
                        type="button"
                        className="text-[#C9A227] text-sm hover:text-[#A8861E] transition-colors"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                        onClick={() => { setView('forgotPassword'); setError(null); }}
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    
                    {error && (
                      <div className="text-[#A4243B] text-sm bg-[#A4243B]/10 px-3 py-2 rounded-lg" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                        {error}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#C9A227] text-white rounded-xl font-medium hover:bg-[#A8861E] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(201,162,39,0.25)]"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
                  
                  <div className="text-center mt-6 text-sm text-[#666]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                    Don&apos;t have an account?{' '}
                    <button
                      className="text-[#C9A227] hover:text-[#A8861E] font-medium transition-colors"
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  <h2 
                    className="text-2xl font-normal text-[#2A2A2A] mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Begin your journal
                  </h2>
                  <p className="text-[#666] text-sm mb-6" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                    Create an account to start reflecting
                  </p>
                  
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-3.5 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
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
                        className="w-full p-3.5 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all pr-12"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666] transition-colors"
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
                        className="w-full p-3.5 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    {/* Password strength bar */}
                    <div className="h-1.5 w-full bg-[#E0DCD4] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength === 0
                            ? 'bg-[#E0DCD4] w-0'
                            : passwordStrength === 1
                            ? 'bg-[#A4243B] w-1/3'
                            : passwordStrength === 2
                            ? 'bg-[#C9A227] w-2/3'
                            : 'bg-[#2D6A4F] w-full'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-[#999]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                      Use 8+ characters with uppercase and numbers
                    </p>
                    
                    {error && (
                      <div className="text-[#A4243B] text-sm bg-[#A4243B]/10 px-3 py-2 rounded-lg" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                        {error}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#C9A227] text-white rounded-xl font-medium hover:bg-[#A8861E] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(201,162,39,0.25)]"
                      style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </form>
                  
                  <div className="text-center mt-6 text-sm text-[#666]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                    Already have an account?{' '}
                    <button
                      className="text-[#C9A227] hover:text-[#A8861E] font-medium transition-colors"
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  <h2 
                    className="text-2xl font-normal text-[#2A2A2A] mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Reset password
                  </h2>
                  <p className="text-[#666] text-sm mb-6" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                  
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-3.5 bg-white border border-[#E0DCD4] rounded-xl text-[#2A2A2A] placeholder-[#999] focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] outline-none transition-all"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                        required
                        disabled={loading}
                      />
                    </div>
                    
                    {error && (
                      <div className="text-[#A4243B] text-sm bg-[#A4243B]/10 px-3 py-2 rounded-lg" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                        {error}
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setView('signIn'); setError(null); }}
                        className="flex-1 py-3.5 text-[#666] border border-[#E0DCD4] rounded-xl hover:bg-[#F5F2ED] transition-colors"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                        disabled={loading}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3.5 bg-[#C9A227] text-white rounded-xl font-medium hover:bg-[#A8861E] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Link'
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {view === 'resetSent' && (
                <motion.div
                  key="resetSent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Check size={28} className="text-[#2D6A4F]" />
                  </div>
                  <h2 
                    className="text-2xl font-normal text-[#2A2A2A] mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    Check your email
                  </h2>
                  <p className="text-[#666] text-sm mb-6" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                    We&apos;ve sent a reset link to <strong className="text-[#2A2A2A]">{email}</strong>
                  </p>
                  <button
                    onClick={() => { setView('signIn'); setError(null); }}
                    className="w-full py-3.5 bg-[#C9A227] text-white rounded-xl font-medium hover:bg-[#A8861E] transition-all"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    Back to Sign In
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
