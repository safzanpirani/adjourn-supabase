"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Chrome, Mail, Sparkles, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>("signin")
  const router = useRouter()
  const [hasPersistedSession, setHasPersistedSession] = useState<boolean | null>(null)
  
  const { 
    user,
    isAuthenticated,
    isLoading,
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    isSigningIn, 
    isSigningUp, 
    authError 
  } = useAuth()

  // Early check for a persisted Supabase session to avoid flashing the login screen
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('adjourn-auth') : null
      setHasPersistedSession(!!raw)
    } catch {
      setHasPersistedSession(false)
    }
  }, [])

  // Grace period: keep loader briefly while auth resolves when a session exists
  useEffect(() => {
    if (hasPersistedSession && !isAuthenticated) {
      const t = setTimeout(() => setHasPersistedSession(false), 1500)
      return () => clearTimeout(t)
    }
  }, [hasPersistedSession, isAuthenticated])

  // Redirect authenticated users to /today
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User is authenticated, redirecting to /today:', user.email)
      router.replace('/today')
    }
  }, [isAuthenticated, user, router])

  // Show loading while checking auth state or if a persisted session exists
  if (isLoading || hasPersistedSession === null || hasPersistedSession) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF8] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-mono text-4xl font-bold text-[#2A2A2A] tracking-tight">Adjourn</h1>
            <p className="font-mono text-[#8B8680] text-sm">Take a break</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#5D6D4E]/30 border-t-[#5D6D4E] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  const handleGoogleAuth = () => {
    signInWithGoogle()
  }

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (authMode === 'signin') {
      signInWithEmail({ email, password })
    } else {
      signUpWithEmail({ email, password })
    }
  }

  const isAuthenticating = isSigningIn || isSigningUp

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo and Tagline */}
        <div className="text-center space-y-2">
          <h1 className="font-mono text-4xl font-bold text-[#2A2A2A] tracking-tight">Adjourn</h1>
          <p className="font-mono text-[#8B8680] text-sm">Take a break</p>
        </div>

        {/* Auth Form */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            {/* Error Alert */}
            {authError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {authError.message || 'An error occurred during authentication'}
                </AlertDescription>
              </Alert>
            )}

            {/* Google OAuth Button */}
            <Button
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              className="w-full h-12 bg-white hover:bg-gray-50 text-[#2A2A2A] border border-gray-300 font-mono text-base"
            >
              {isSigningIn ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#2A2A2A] rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </div>
              )}
            </Button>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-[#8B8680]/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 text-[#8B8680] font-mono">or</span>
              </div>
            </div>
            
            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="font-mono text-sm text-[#2A2A2A]">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="font-mono bg-[#FAFAF8] border-[#8B8680]/30 focus:border-[#5D6D4E] h-12 text-base"
                  required
                  disabled={isAuthenticating}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="font-mono text-sm text-[#2A2A2A]">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="font-mono bg-[#FAFAF8] border-[#8B8680]/30 focus:border-[#5D6D4E] h-12 text-base pr-12"
                    required
                    disabled={isAuthenticating}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isAuthenticating}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#8B8680]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#8B8680]" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isAuthenticating}
                className="w-full h-12 bg-[#5D6D4E] hover:bg-[#5D6D4E]/90 text-white font-mono text-base"
              >
                {isAuthenticating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {authMode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  </div>
                )}
              </Button>
            </form>
            
            {/* Toggle Auth Mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="font-mono text-sm text-[#5D6D4E] hover:text-[#5D6D4E]/80 underline"
                disabled={isAuthenticating}
              >
                {authMode === 'signin' 
                  ? 'Need an account? Sign up' 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="font-mono text-xs text-[#8B8680]">A peaceful space for your thoughts</p>
        </div>
      </div>

      {/* Floating decoration */}
      <div className="fixed top-8 right-8 opacity-20">
        <Sparkles className="w-6 h-6 text-[#5D6D4E]" />
      </div>
    </div>
  )
}
