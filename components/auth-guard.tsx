"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/')
    }
  }, [user, isLoading, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-[100dvh] bg-[#FAFAF8] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#5D6D4E]/30 border-t-[#5D6D4E] rounded-full animate-spin mx-auto" />
            <p className="font-mono text-sm text-[#8B8680]">Loading...</p>
          </div>
        </div>
      )
    )
  }

  // Don't render protected content if not authenticated
  if (!user) {
    return null
  }

  return <>{children}</>
} 