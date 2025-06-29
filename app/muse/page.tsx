"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Lightbulb, Heart, Zap, Sparkles } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { VoiceRecorder } from "@/components/voice-recorder"
import { useRouter } from "next/navigation"
import { useMuseAI } from "@/hooks/useMuseAI"
import { useTodayEntry } from "@/hooks/useOptimizedHooks"
import { AlertCircle, Loader2 } from "lucide-react"

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

export default function MusePage() {
  const router = useRouter()
  const { chatMessage, isLoading, error, requestsRemaining } = useMuseAI()
  const { entry: todayEntry } = useTodayEntry()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your writing muse. I'm here to help spark creativity and reflection. What's on your mind today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    "Help me reflect on today",
    "Give me a writing prompt",
    "I'm feeling stuck",
    "What should I write about?",
  ]

  useEffect(() => {
    // Scroll to bottom with extra padding to avoid input blocking
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight + 200
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputText
    setInputText("")

    try {
      // Convert messages to conversation history format (excluding the initial greeting)
      const conversationHistory = messages.slice(1).map(msg => ({
        id: msg.id,
        text: msg.text,
        isUser: msg.isUser,
        timestamp: msg.timestamp
      }))

      // Add the current user message to history for context
      conversationHistory.push({
        id: messages.length + 1,
        text: currentInput,
        isUser: true,
        timestamp: new Date()
      })

      // Call real AI API
      const result = await chatMessage(
        currentInput, 
        conversationHistory,
        todayEntry?.content || "The user is reflecting on their day in their journal."
      )
      
      const aiResponse: Message = {
        id: messages.length + 2,
        text: result.response,
        isUser: false,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, aiResponse])
      
    } catch (err) {
      console.error('Muse AI error:', err)
      
      // Add error message to chat
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion)
  }

  const handleVoiceTranscription = (text: string) => {
    setInputText(text)
  }

  const handleClose = () => {
    // Go back to previous page or today as fallback
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/today")
    }
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
      {/* Desktop Sidebar */}
      <DesktopSidebar currentPage="muse" />

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-mono text-lg text-[var(--color-text)]">Muse</h1>
              <p className="font-mono text-xs text-[var(--color-text-secondary)]">Your writing companion</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-mono text-lg text-[var(--color-text)]">Muse AI Chat</h1>
              <p className="font-mono text-xs text-[var(--color-text-secondary)]">
                Your creative writing companion • {requestsRemaining} requests remaining
              </p>
            </div>
          </div>
        </header>

        {/* Messages - Centered on Desktop with proper spacing for input */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto pb-44 md:pb-32"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* Error display */}
            {error && (
              <div className="flex justify-center">
                <div className="max-w-[80%] p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300 font-mono">
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
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`
                  max-w-[80%] md:max-w-[70%] p-3 rounded-2xl font-mono text-sm
                  ${
                    message.isUser
                      ? "bg-[var(--color-primary)] text-white rounded-br-md"
                      : "bg-[var(--color-card-background)] text-[var(--color-text)] rounded-bl-md shadow-sm border border-gray-200 dark:border-gray-700"
                  }
                `}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] md:max-w-[70%] p-3 rounded-2xl rounded-bl-md bg-[var(--color-card-background)] border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
                    <span className="text-sm text-[var(--color-text-secondary)] font-mono">
                      Muse is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Container - Fixed at bottom with suggestions above it */}
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 md:relative md:bottom-auto z-20">
          <div className="max-w-3xl mx-auto px-4">
            
            {/* Suggestions - Positioned directly above input */}
        {messages.length === 1 && (
              <div className="mb-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                      className="font-mono text-xs bg-white/90 dark:bg-gray-800/90 text-[var(--color-primary)] border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/10 backdrop-blur-sm"
                >
                  {index === 0 && <Heart className="w-3 h-3 mr-1" />}
                  {index === 1 && <Lightbulb className="w-3 h-3 mr-1" />}
                  {index === 2 && <Zap className="w-3 h-3 mr-1" />}
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

            {/* Input Area */}
            <div className="bg-[var(--color-card-background)]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-lg">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 font-mono bg-transparent border-0 focus:ring-0 focus:outline-none text-[var(--color-text)]"
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && requestsRemaining > 0 && handleSendMessage()}
                />
                <VoiceRecorder onTranscription={handleVoiceTranscription} size="sm" />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading || requestsRemaining <= 0}
                  size="sm"
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : requestsRemaining <= 0 ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation currentPage="muse" />
      </div>
    </div>
  )
}
