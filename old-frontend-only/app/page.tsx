"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Sparkles } from "lucide-react"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    // In a real app, this would redirect to /today
    window.location.href = "/today"
  }

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
          <CardContent className="p-6">
            <form onSubmit={handleMagicLink} className="space-y-4">
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
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#5D6D4E] hover:bg-[#5D6D4E]/90 text-white font-mono text-base"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending magic link...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Magic Link
                  </div>
                )}
              </Button>
            </form>
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
