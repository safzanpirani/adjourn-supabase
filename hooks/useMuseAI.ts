import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface MuseResponse {
  response: string
  requestsRemaining: number
  timestamp: string
}

interface MuseError {
  error: string
}

export const useMuseAI = () => {
  const { user } = useAuth()
  const [requestCount, setRequestCount] = useState(0)
  const [lastReset, setLastReset] = useState(Date.now())

  // Reset request count every hour
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60)
      
      if (hoursSinceReset >= 1) {
        setRequestCount(0)
        setLastReset(now)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [lastReset])

  const callMuse = useMutation<MuseResponse, MuseError, { content: string; context?: string }>({
    mutationFn: async ({ content, context }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      if (requestCount >= 10) {
        throw new Error('Hourly AI request limit reached (10 requests/hour)')
      }

      // Get user's auth token
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession())
      
      if (!session?.access_token) {
        throw new Error('Invalid session')
      }

      const response = await fetch('/api/ai/muse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content, context }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI request failed')
      }

      const data = await response.json()
      
      // Update local request count
      setRequestCount(prev => prev + 1)
      
      return data
    },
    onError: (error) => {
      console.error('Muse AI error:', error)
    },
  })

  // Cache responses for 24 hours to prevent duplicate calls
  const getCachedResponse = (content: string) => {
    const cacheKey = `muse-response-${content.slice(0, 100)}`
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000 // 24 hours
        
        if (!isExpired) {
          return parsed.response
        } else {
          localStorage.removeItem(cacheKey)
        }
      } catch (error) {
        localStorage.removeItem(cacheKey)
      }
    }
    
    return null
  }

  const cacheResponse = (content: string, response: string) => {
    const cacheKey = `muse-response-${content.slice(0, 100)}`
    localStorage.setItem(cacheKey, JSON.stringify({
      response,
      timestamp: Date.now(),
    }))
  }

  return {
    callMuse: callMuse.mutate,
    isLoading: callMuse.isPending,
    error: callMuse.error,
    requestsRemaining: 10 - requestCount,
    getCachedResponse,
    cacheResponse,
    data: callMuse.data,
  }
} 