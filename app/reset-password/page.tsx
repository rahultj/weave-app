"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Lock, Check } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  // Check if user has a valid session (from the reset link)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkSession()
  }, [])

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }
    if (password !== confirm) {
      return setError('Passwords do not match.')
    }
    
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/feed'), 2000)
    }
  }

  // Loading state while checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F7' }}>
        <div className="w-8 h-8 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // No valid session - show error
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF9F7' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-medium mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Invalid or Expired Link
          </h2>
          <p className="text-[#666] mb-6" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: '#8B7355', fontFamily: 'var(--font-dm-sans)' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF9F7' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-medium mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Password Updated!
          </h2>
          <p className="text-[#666]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Redirecting you to your feed...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF9F7' }}>
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-medium mb-2 text-center" style={{ fontFamily: 'var(--font-cormorant)' }}>
          Set New Password
        </h2>
        <p className="text-[#666] text-center mb-6" style={{ fontFamily: 'var(--font-dm-sans)' }}>
          Choose a strong password for your account
        </p>
        
        <form onSubmit={handleReset} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm text-[#666] mb-1.5" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-[#E8E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] transition-all"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor: passwordStrength >= level
                          ? level <= 1 ? '#EF4444' : level <= 2 ? '#F59E0B' : level <= 3 ? '#10B981' : '#059669'
                          : '#E8E5E0'
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#888]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  {passwordStrength <= 1 && 'Weak - add uppercase, numbers, or symbols'}
                  {passwordStrength === 2 && 'Fair - keep going!'}
                  {passwordStrength === 3 && 'Good - almost there!'}
                  {passwordStrength === 4 && 'Strong password!'}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-[#666] mb-1.5" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-[#E8E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20 focus:border-[#8B7355] transition-all"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#666]"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirm && password !== confirm && (
              <p className="mt-1 text-xs text-red-500" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Passwords do not match
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || password.length < 8 || password !== confirm}
            className="w-full py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#8B7355', fontFamily: 'var(--font-dm-sans)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
