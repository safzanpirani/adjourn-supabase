"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Camera, Images } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { StreakDisplay } from "@/components/streak-display"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { useRouter } from "next/navigation"

interface JournalEntry {
  id: number
  date: string
  preview: string
  wordCount: number
  hasPhotos: boolean
  mood?: string
}

export default function JournalsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentStreak] = useState(17)

  const entries: JournalEntry[] = [
    {
      id: 1,
      date: "2024-12-17",
      preview:
        "Today was filled with unexpected moments of joy. The morning coffee tasted particularly good, and I found myself...",
      wordCount: 567,
      hasPhotos: true,
      mood: "content",
    },
    {
      id: 2,
      date: "2024-12-16",
      preview:
        "Reflecting on the week that passed. There were challenges, but also growth. I learned something important about...",
      wordCount: 423,
      hasPhotos: false,
      mood: "thoughtful",
    },
    {
      id: 3,
      date: "2024-12-15",
      preview:
        "A quiet Sunday. Sometimes the most peaceful days are the ones where nothing extraordinary happens, yet...",
      wordCount: 234,
      hasPhotos: true,
      mood: "peaceful",
    },
    {
      id: 4,
      date: "2024-12-14",
      preview:
        "Had an interesting conversation with a friend today about dreams and aspirations. It made me think about...",
      wordCount: 678,
      hasPhotos: false,
      mood: "inspired",
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case "content":
        return "😌"
      case "thoughtful":
        return "🤔"
      case "peaceful":
        return "😊"
      case "inspired":
        return "✨"
      default:
        return "📝"
    }
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
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="border-0 shadow-sm bg-[var(--color-card-background)] hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[var(--color-primary)]">{formatDate(entry.date)}</span>
                    <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
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
          ))}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation currentPage="journals" />
      </div>
    </div>
  )
}
