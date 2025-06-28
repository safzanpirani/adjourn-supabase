"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Camera, Images } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { StreakDisplay } from "@/components/streak-display"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { useRouter } from "next/navigation"
import { useEntries, useStreaks } from "@/hooks/useOptimizedHooks"

function JournalsPageContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: entriesResult, isLoading: entriesLoading } = useEntries({ 
    searchQuery: searchQuery.trim() 
  })
  const { streaks: streaksData, isLoading: streaksLoading } = useStreaks()
  
  const entries = entriesResult?.entries || []
  const currentStreak = streaksData?.current_streak || 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getMoodEmoji = (mood?: number) => {
    // Map mood numbers to emojis (1-5 scale)
    switch (mood) {
      case 1:
        return "😔"
      case 2:
        return "😐"
      case 3:
        return "😊"
      case 4:
        return "😄"
      case 5:
        return "🤩"
      default:
        return "📝"
    }
  }

  const handleEntryClick = (date: string) => {
    router.push(`/entry/${date}`)
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
      <DesktopSidebar currentPage="journals" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-mono text-2xl text-[var(--color-text)]">Your Journals</h1>

            {/* Mobile Memory Gallery Button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/gallery")}
                className="bg-white dark:bg-gray-800 text-[var(--color-primary)] border-[var(--color-primary)]/30"
              >
                <Images className="w-4 h-4 mr-2" />
                Gallery
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your thoughts..."
                className="pl-10 font-mono bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-[var(--color-primary)] text-[var(--color-text)]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="bg-white dark:bg-gray-800 text-[var(--color-primary)] border-[var(--color-primary)]/30"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Streak Display */}
        <div className="px-4">
          <Card className="border-0 shadow-sm bg-[var(--color-card-background)]">
            <CardContent className="p-0">
              <StreakDisplay currentStreak={currentStreak} />
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <main className="flex-1 p-4 space-y-3 pb-20 md:pb-4">
          {entriesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                <Search className="w-8 h-8 text-[var(--color-text-secondary)]" />
              </div>
              <h3 className="font-mono text-lg text-[var(--color-text)] mb-2">
                {searchQuery ? 'No entries found' : 'No entries yet'}
              </h3>
              <p className="font-mono text-sm text-[var(--color-text-secondary)] mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Start your journaling journey by writing your first entry'
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => router.push('/today')}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-mono"
                >
                  Write Your First Entry
                </Button>
              )}
            </div>
          ) : (
            entries.map((entry) => (
              <Card
                key={entry.id}
                onClick={() => handleEntryClick(entry.date)}
                className="border-0 shadow-sm bg-[var(--color-card-background)] hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[var(--color-primary)]">{formatDate(entry.date)}</span>
                      <span className="text-lg">{getMoodEmoji(entry.mood || undefined)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      {entry.hasPhotos && <Camera className="w-3 h-3" />}
                      <span className="font-mono">{entry.wordCount} words</span>
                    </div>
                  </div>

                  <p className="font-mono text-sm text-[var(--color-text)] leading-relaxed line-clamp-3">
                    {entry.preview}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation currentPage="journals" />
      </div>
    </div>
  )
}

export default function JournalsPage() {
  return (
    <AuthGuard>
      <JournalsPageContent />
    </AuthGuard>
  )
}
