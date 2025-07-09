'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithPassword: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ error: AuthError | null }>
  signUpWithPassword: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // If rememberMe is false, sign out on tab close
    const handleBeforeUnload = async () => {
      const rememberMe = localStorage.getItem('rememberMe') === 'true'
      if (!rememberMe) {
        await supabase.auth.signOut()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const signInWithPassword = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setLoading(true)
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    return { error }
  }

  const signUpWithPassword = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setLoading(true)
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false')
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    return { error }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://weave-app-alpha.vercel.app/reset-password',
    })
    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    // Clear localStorage when signing out
    localStorage.removeItem('rememberMe')
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithPassword,
        signUpWithPassword,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}