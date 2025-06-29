import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface MuseResponse {
  response: string
  requestsRemaining: number
  timestamp: string
  type: 'quick' | 'chat'
}

interface MuseError {
  error: string
}

type MuseAPIError = MuseError | Error | { message: string } | string

interface ChatMessage {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

interface MuseRequestParams {
  content: string
  context?: string
  type?: 'quick' | 'chat'
  conversationHistory?: ChatMessage[]
}

export const useMuseAI = () => {
  const { user } = useAuth()
  // const [requestCount, setRequestCount] = useState(0)
  // const [lastReset, setLastReset] = useState(Date.now())

  // Reset request count every hour
  /* useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60)
      
      if (hoursSinceReset >= 1) {
        setRequestCount(0)
        setLastReset(now)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [lastReset]) */

  const callMuse = useMutation<MuseResponse, MuseAPIError, MuseRequestParams>({
    mutationFn: async ({ content, context, type = 'quick', conversationHistory = [] }) => {
      if (!user) {
        throw new Error('Authentication required')
      }

      /* const maxRequests = 20 // Updated to match API
      if (requestCount >= maxRequests) {
        throw new Error(`Hourly AI request limit reached (${maxRequests} requests/hour)`)
      } */

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
        body: JSON.stringify({ 
          content, 
          context, 
          type,
          conversationHistory: conversationHistory.map(msg => ({
            text: msg.text,
            isUser: msg.isUser
          }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI request failed')
      }

      const data = await response.json()
      
      // Update local request count
      // setRequestCount(prev => prev + 1)
      
      return data
    },
    onError: (error) => {
      console.error('Muse AI error:', error)
    },
  })

  // Quick suggestion method (for QuickMuse component)
  const quickSuggestion = async (content: string, context?: string) => {
    return callMuse.mutateAsync({ 
      content, 
      context, 
      type: 'quick' 
    })
  }

  // Chat method (for full Muse chat page)
  const chatMessage = async (content: string, conversationHistory: ChatMessage[] = [], context?: string) => {
    return callMuse.mutateAsync({ 
      content, 
      type: 'chat', 
      conversationHistory,
      context
    })
  }

  // Cache responses for 24 hours to prevent duplicate calls
  const getCachedResponse = (content: string, type: 'quick' | 'chat' = 'quick') => {
    const cacheKey = `muse-response-${type}-${content.slice(0, 100)}`
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

  const cacheResponse = (content: string, response: string, type: 'quick' | 'chat' = 'quick') => {
    const cacheKey = `muse-response-${type}-${content.slice(0, 100)}`
    localStorage.setItem(cacheKey, JSON.stringify({
      response,
      timestamp: Date.now(),
    }))
  }

  return {
    // Legacy method for backward compatibility
    callMuse: callMuse.mutate,
    // New specialized methods
    quickSuggestion,
    chatMessage,
    
    // Status
    isLoading: callMuse.isPending,
    error: callMuse.error,
    requestsRemaining: 999, // No limit for now
    data: callMuse.data,
    
    // Caching
    getCachedResponse,
    cacheResponse,
  }
} 