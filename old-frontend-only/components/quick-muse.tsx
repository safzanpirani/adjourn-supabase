"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Send, X, MessageSquare } from "lucide-react"

export function QuickMuse() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setResponse(
      "That's a wonderful reflection! Consider exploring how this moment made you feel and what it might teach you about yourself. Would you like to write more about this in your journal?",
    )
    setIsLoading(false)
  }

  const handleExpandToFullMuse = () => {
    setIsOpen(false)
    window.location.href = "/muse"
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className="hidden md:flex h-8 w-8 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
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
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
              <X className="w-3 h-3" />
            </Button>
          </div>

          {!response ? (
            <div className="space-y-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                className="font-mono text-sm bg-[var(--color-card-background)] border-gray-200 dark:border-gray-700 focus:border-[var(--color-primary)] text-[var(--color-text)]"
                onKeyPress={(e) => e.key === "Enter" && handleQuickMessage()}
              />
              <Button
                onClick={handleQuickMessage}
                disabled={!message.trim() || isLoading}
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-mono text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Thinking...
                  </div>
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-2" />
                    Ask Muse
                  </>
                )}
              </Button>
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
                  onClick={() => {
                    setMessage("")
                    setResponse("")
                  }}
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
