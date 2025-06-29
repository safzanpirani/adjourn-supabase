"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Book, Images, ChevronLeft, ChevronRight, Sparkles, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { StreakDisplay } from "./streak-display"
import { useStreaks, useEntries, useEntriesForMonth } from "@/hooks/useOptimizedHooks"

interface DesktopSidebarProps {
  currentPage?: string
}

export function DesktopSidebar({ currentPage }: DesktopSidebarProps) {
  const router = useRouter()
  const { streaks, isLoading: streaksLoading } = useStreaks()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get real recent entries data
  const { data: entriesResult } = useEntries({ limit: 5 })
  const recentEntries = entriesResult?.entries || []

  // Get entries for current month
  const { data: monthEntries = {} } = useEntriesForMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  )

  // Mini calendar data
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()

    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of the month with real data
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date string without timezone issues
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const entryData = monthEntries[dateStr]
      
      const isToday = day === today.getDate() && 
                     month === today.getMonth() && 
                     year === today.getFullYear()

      days.push({
        date: day,
        dateStr: dateStr,
        hasEntry: entryData?.hasEntry || false,
        hasPhotos: entryData?.hasPhotos || false,
        isToday: isToday,
      })
    }

    return days
  }

  const handleDateClick = (dateStr: string) => {
    router.push(`/entry/${dateStr}`)
  }

  const formatEntryDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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
    <div className="hidden md:flex w-64 bg-[var(--color-background)] border-r border-gray-200 dark:border-gray-700 flex-col h-full">
      {/* Header with Streak */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          {streaksLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
          ) : (
            <StreakDisplay 
              currentStreak={streaks.current_streak} 
              maxStreak={streaks.longest_streak || 30} 
            />
          )}
        </div>

        {/* Today's Journal Note Button */}
        <Button
          onClick={() => router.push("/today")}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-button-text)] font-mono"
        >
          <Plus className="w-4 h-4 mr-2" />
          Today's Journal Note
        </Button>
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
          <button 
            onClick={() => router.push('/calendar')}
            className="font-mono text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
          >
            {monthName}
          </button>
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
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={index} className="text-center font-mono text-[var(--color-text-secondary)] py-1">
              {day}
            </div>
          ))}
          {getDaysInMonth().map((day, index) => (
            <div key={index} className="aspect-square">
              {day && (
                <button
                  onClick={() => handleDateClick(day.dateStr)}
                  className={`
                  w-full h-full rounded text-xs font-mono relative transition-all duration-200 hover:scale-105
                  ${
                    day.isToday
                      ? "bg-[var(--color-primary)] text-[var(--color-button-text)] hover:shadow-md"
                      : day.hasEntry
                        ? "bg-[var(--color-accent)]/20 text-[var(--color-text)] hover:bg-[var(--color-accent)]/50 hover:border hover:border-[var(--color-accent)]"
                        : "text-[var(--color-text-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700 hover:border hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}
                >
                  {day.date}
                  {/* Tiny indicators */}
                  <div className="absolute bottom-0 right-0 flex gap-0.5">
                    {day.hasEntry && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          day.isToday ? "bg-[var(--color-button-text)]" : "bg-[var(--color-accent)]"
                        }`}
                      />
                    )}
                    {day.hasPhotos && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          day.isToday ? "bg-yellow-200" : "bg-yellow-500"
                        }`}
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
          {recentEntries.length === 0 ? (
            <div className="text-center py-4">
              <p className="font-mono text-xs text-[var(--color-text-secondary)]">No entries yet</p>
            </div>
          ) : (
            recentEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => router.push(`/entry/${entry.date}`)}
                className="w-full text-left p-2 rounded-lg hover:bg-[var(--color-card-background)] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[var(--color-primary)]">{formatEntryDate(entry.date)}</span>
                  {entry.hasPhotos && <Images className="w-3 h-3 text-yellow-500" />}
                </div>
                <p className="font-mono text-xs text-[var(--color-text)] line-clamp-2 leading-relaxed">{entry.preview}</p>
              </button>
            ))
          )}
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
