"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DesktopSidebar } from "@/components/desktop-sidebar"

interface DayEntry {
  date: number
  hasEntry: boolean
  hasPhotos: boolean
  wordCount?: number
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Sample data - in a real app this would come from your database
  const entries: DayEntry[] = [
    { date: 1, hasEntry: true, hasPhotos: false, wordCount: 234 },
    { date: 3, hasEntry: true, hasPhotos: true, wordCount: 456 },
    { date: 7, hasEntry: true, hasPhotos: false, wordCount: 123 },
    { date: 12, hasEntry: true, hasPhotos: true, wordCount: 789 },
    { date: 15, hasEntry: true, hasPhotos: false, wordCount: 345 },
    { date: 17, hasEntry: true, hasPhotos: true, wordCount: 567 }, // Today
    { date: 20, hasEntry: true, hasPhotos: false, wordCount: 234 },
    { date: 25, hasEntry: true, hasPhotos: true, wordCount: 678 },
  ]

  const today = new Date().getDate()
  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const entry = entries.find((e) => e.date === day)
      days.push({
        date: day,
        hasEntry: entry?.hasEntry || false,
        hasPhotos: entry?.hasPhotos || false,
        wordCount: entry?.wordCount,
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

  const handleDateClick = (date: number) => {
    // In a real app, navigate to that date's entry
    console.log(`Navigate to ${monthName} ${date}`)
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
      <DesktopSidebar currentPage="calendar" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-10 w-10">
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <h1 className="font-mono text-xl text-[var(--color-text)]">{monthName}</h1>

          <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-10 w-10">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </header>

        {/* Calendar Grid */}
        <main className="flex-1 p-4 pb-20 md:pb-4">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-mono text-sm text-[var(--color-text-secondary)] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <button
                    onClick={() => handleDateClick(day.date)}
                    className={`
                    w-full h-full rounded-lg font-mono text-sm relative transition-all duration-200
                    ${
                      day.isToday
                        ? "bg-[var(--color-primary)] text-white shadow-lg"
                        : day.hasEntry
                          ? "bg-[var(--color-accent)]/20 text-[var(--color-text)] hover:bg-[var(--color-accent)]/30"
                          : "text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                  >
                    <span className="absolute top-1 left-1">{day.date}</span>

                    {/* Entry indicators */}
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      {day.hasEntry && (
                        <div
                          className={`w-2 h-2 rounded-full ${day.isToday ? "bg-white" : "bg-[var(--color-accent)]"}`}
                        />
                      )}
                      {day.hasPhotos && (
                        <div className={`w-2 h-2 rounded-full ${day.isToday ? "bg-yellow-200" : "bg-yellow-500"}`} />
                      )}
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-6 text-xs font-mono text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
              <span>Has entry</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Has photos</span>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation currentPage="calendar" />
      </div>
    </div>
  )
}
