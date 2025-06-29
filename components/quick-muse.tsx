"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Send, X, MessageSquare, AlertCircle } from "lucide-react"
import { useMuseAI } from "@/hooks/useMuseAI"
import { useTodayEntry } from "@/hooks/useOptimizedHooks"

export function QuickMuse() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const { quickSuggestion, isLoading, error, requestsRemaining } = useMuseAI()
  const { entry: todayEntry } = useTodayEntry()

  const handleQuickMessage = async () => {
    if (!message.trim()) return

    try {
      // Check cache first
      const cachedResponse = localStorage.getItem(`quick-muse-${message.slice(0, 50)}`)
      if (cachedResponse) {
        const parsed = JSON.parse(cachedResponse)
        const isExpired = Date.now() - parsed.timestamp > 60 * 60 * 1000 // 1 hour for quick suggestions
        
        if (!isExpired) {
          setResponse(parsed.response)
          return
        }
      }

      // Call AI API
      const result = await quickSuggestion(message, todayEntry?.content || "The user is writing in their journal.")
      setResponse(result.response)
      
      // Cache the response
      localStorage.setItem(`quick-muse-${message.slice(0, 50)}`, JSON.stringify({
        response: result.response,
        timestamp: Date.now()
      }))
      
    } catch (err) {
      console.error('Quick Muse error:', err)
      setResponse("I'm having trouble connecting right now. Please try again in a moment.")
    }
  }

  const handleExpandToFullMuse = () => {
    setIsOpen(false)
    window.location.href = "/muse"
  }

  const handleReset = () => {
    setMessage("")
    setResponse("")
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className="hidden md:flex h-8 w-8 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
        title="Quick Muse - AI writing assistant"
      >
        <Sparkles className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <div className="hidden md:block fixed top-16 right-4 z-50">
      <Card className="w-80 shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="font-mono text-sm text-[var(--color-text)]">Quick Muse</span>
              <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                {requestsRemaining} left
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
              <X className="w-3 h-3" />
            </Button>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {typeof error === 'string' 
                    ? error 
                    : 'error' in error 
                      ? error.error 
                      : 'message' in error 
                        ? error.message 
                        : 'An error occurred'}
                </span>
              </div>
            </div>
          )}

          {!response ? (
            <div className="space-y-3">
              <div className="text-xs text-[var(--color-text-secondary)] mb-2">
                Ask me anything about writing, need a word suggestion, or want help with phrasing!
              </div>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Need help with a word or phrase?"
                className="font-mono text-sm bg-[var(--color-card-background)] border-gray-200 dark:border-gray-700 focus:border-[var(--color-primary)] text-[var(--color-text)]"
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleQuickMessage()}
                disabled={isLoading}
              />
              <Button
                onClick={handleQuickMessage}
                disabled={!message.trim() || isLoading || requestsRemaining <= 0}
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-mono text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Thinking...
                  </div>
                ) : requestsRemaining <= 0 ? (
                  "Limit reached"
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-2" />
                    Ask Muse
                  </>
                )}
              </Button>
              {requestsRemaining <= 3 && requestsRemaining > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  {requestsRemaining} requests remaining this hour
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg">
                <p className="font-mono text-sm text-[var(--color-text)] leading-relaxed">{response}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleExpandToFullMuse}
                  variant="outline"
                  size="sm"
                  className="flex-1 font-mono text-xs bg-white dark:bg-gray-800 text-[var(--color-primary)] border-[var(--color-primary)]/30"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Continue Chat
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs bg-white dark:bg-gray-800 text-[var(--color-primary)] border-[var(--color-primary)]/30"
                >
                  New Question
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
