"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Book, Images, ChevronLeft, ChevronRight, Sparkles, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { StreakDisplay } from "./streak-display"

interface DesktopSidebarProps {
  currentPage?: string
}

export function DesktopSidebar({ currentPage }: DesktopSidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Sample recent entries
  const recentEntries = [
    { id: 1, date: "Dec 17", preview: "Today was filled with unexpected moments...", hasPhotos: true },
    { id: 2, date: "Dec 16", preview: "Reflecting on the week that passed...", hasPhotos: false },
    { id: 3, date: "Dec 15", preview: "A quiet Sunday morning...", hasPhotos: true },
    { id: 4, date: "Dec 14", preview: "Had an interesting conversation...", hasPhotos: false },
  ]

  // Mini calendar data
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date().getDate()

    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Sample entry data
    const entriesData = [1, 3, 7, 12, 15, 17, 20, 25]
    const photosData = [3, 12, 15, 17, 25]

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        hasEntry: entriesData.includes(day),
        hasPhotos: photosData.includes(day),
        isToday: day === today,
      })
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const monthName = currentMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })

  return (
    <div className="hidden md:flex w-64 bg-[var(--color-background)] border-r border-gray-200 dark:border-gray-700 flex-col h-screen">
      {/* Header with Streak */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <StreakDisplay currentStreak={17} maxStreak={30} />
        </div>

        {/* New Journal Note Button */}
        <Button
          onClick={() => router.push("/today")}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-button-text)] font-mono mb-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Journal Note
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="pl-10 font-mono bg-[var(--color-surface)] border-[var(--color-text-secondary)]/30 focus:border-[var(--color-primary)] text-sm text-[var(--color-text)]"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="p-4 space-y-2 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={() => router.push("/journals")}
          className={`w-full justify-start font-mono text-sm ${
            currentPage === "journals"
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : "text-[var(--color-text)]"
          }`}
        >
          <Book className="w-4 h-4 mr-3" />
          Journals
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/gallery")}
          className={`w-full justify-start font-mono text-sm ${
            currentPage === "gallery"
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : "text-[var(--color-text)]"
          }`}
        >
          <Images className="w-4 h-4 mr-3" />
          Memory Gallery
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/muse")}
          className={`w-full justify-start font-mono text-sm ${
            currentPage === "muse"
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : "text-[var(--color-text)]"
          }`}
        >
          <Sparkles className="w-4 h-4 mr-3" />
          Muse AI Chat
        </Button>
      </div>

      {/* Mini Calendar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-sm font-medium text-[var(--color-text)]">{monthName}</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-6 w-6">
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-6 w-6">
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Mini calendar grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div key={day} className="text-center font-mono text-[var(--color-text-secondary)] py-1">
              {day}
            </div>
          ))}
          {getDaysInMonth().map((day, index) => (
            <div key={index} className="aspect-square">
              {day && (
                <button
                  onClick={() => router.push(`/calendar`)}
                  className={`
                  w-full h-full rounded text-xs font-mono relative transition-all duration-200
                  ${
                    day.isToday
                      ? "bg-[var(--color-primary)] text-[var(--color-button-text)]"
                      : day.hasEntry
                        ? "bg-[var(--color-accent)]/20 text-[var(--color-text)] hover:bg-[var(--color-accent)]/30"
                        : "text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
                >
                  {day.date}
                  {/* Tiny indicators */}
                  <div className="absolute bottom-0 right-0 flex">
                    {day.hasEntry && (
                      <div
                        className={`w-1 h-1 rounded-full ${
                          day.isToday ? "bg-[var(--color-button-text)]" : "bg-[var(--color-accent)]"
                        }`}
                      />
                    )}
                    {day.hasPhotos && (
                      <div
                        className={`w-1 h-1 rounded-full ml-0.5 ${day.isToday ? "bg-yellow-200" : "bg-yellow-500"}`}
                      />
                    )}
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="font-mono text-sm font-medium text-[var(--color-text)] mb-3">Recent Entries</h3>
        <div className="space-y-2">
          {recentEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => router.push(`/entry/${entry.id}`)}
              className="w-full text-left p-2 rounded-lg hover:bg-[var(--color-card-background)] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[var(--color-primary)]">{entry.date}</span>
                {entry.hasPhotos && <Images className="w-3 h-3 text-yellow-500" />}
              </div>
              <p className="font-mono text-xs text-[var(--color-text)] line-clamp-2 leading-relaxed">{entry.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {/* User/Settings Button at Bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={() => router.push("/settings")}
          className={`w-full justify-start font-mono text-sm ${
            currentPage === "settings"
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : "text-[var(--color-text)]"
          }`}
        >
          <User className="w-4 h-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  )
}
