"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { useEntriesForMonth } from "@/hooks/useOptimizedHooks"

function CalendarPageContent() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const { data: entriesData = {}, isLoading } = useEntriesForMonth(year, month)

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
      // Create date string without timezone issues
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const entryData = entriesData[dateStr]
      
      days.push({
        date: day,
        hasEntry: entryData?.hasEntry || false,
        hasPhotos: entryData?.hasPhotos || false,
        wordCount: entryData?.wordCount,
        isToday: day === today && month === new Date().getMonth() && year === new Date().getFullYear(),
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
    // Format date as YYYY-MM-DD without timezone issues
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    
    // Navigate to entry page
    router.push(`/entry/${dateStr}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
        <DesktopSidebar currentPage="calendar" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
        <BottomNavigation currentPage="calendar" />
      </div>
    )
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

export default function CalendarPage() {
  return (
    <AuthGuard>
      <CalendarPageContent />
    </AuthGuard>
  )
}
