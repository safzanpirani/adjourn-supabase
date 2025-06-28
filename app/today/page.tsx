"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { EntryEditor } from "@/components/entry-editor"
import { useTodayEntry } from "@/hooks/useOptimizedHooks"

function TodayPageContent() {
  const { entry, isLoading } = useTodayEntry()

  // TODO: Implement EntryEditor component with your original design
  // For now, show a placeholder that uses your component structure
  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
      <DesktopSidebar currentPage="today" />
      
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
          </div>
        ) : (
          <EntryEditor
            entry={entry}
            getDailyPrompt={async () => "What are you grateful for today?"}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="today" />
    </div>
  )
}

export default function TodayPage() {
  return (
    <AuthGuard>
      <TodayPageContent />
    </AuthGuard>
  )
}
