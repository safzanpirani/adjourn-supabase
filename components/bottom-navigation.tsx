"use client"

import { Button } from "@/components/ui/button"
import { Book, Calendar, Edit3, Sparkles, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"

interface BottomNavigationProps {
  currentPage: "journals" | "calendar" | "today" | "muse" | "settings"
}

export function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const router = useRouter()
  const { theme, colorTheme } = useTheme()

  const navItems = [
    { id: "journals", icon: Book, label: "Journals", href: "/journals" },
    { id: "calendar", icon: Calendar, label: "Calendar", href: "/calendar" },
    { id: "today", icon: Edit3, label: "Today", href: "/today" },
    { id: "muse", icon: Sparkles, label: "Muse", href: "/muse" },
    { id: "settings", icon: User, label: "Settings", href: "/settings" },
  ]

  const getTodayTabStyles = (isActive: boolean) => {
    if (!isActive) return ""

    // Special handling for monochrome theme in dark mode
    if (colorTheme === "monochrome" && theme === "dark") {
      return "text-black bg-white rounded-lg"
    }

    return "text-[var(--color-button-text)] bg-[var(--color-primary)] rounded-lg"
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)]/95 backdrop-blur-sm border-t border-[var(--color-text-secondary)]/30 safe-area-pb bottom-nav">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          const isTodayTab = item.id === "today"

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => router.push(item.href)}
              className={`
                flex flex-col items-center gap-1 h-12 px-2 transition-colors duration-200 mx-auto
                ${
                  isActive
                    ? isTodayTab
                      ? getTodayTabStyles(true)
                      : "text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-mono text-xs">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
