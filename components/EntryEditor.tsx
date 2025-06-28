"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, List, Mic, Camera, Eye, EyeOff, Undo, Redo } from "lucide-react"
import { useTodayEntry } from "@/hooks/useOptimizedHooks"

interface EntryEditorProps {
  // Data props
  entry: any
  images?: any[]
  
  // Display configuration
  formatDate?: (date: Date) => string
  
  // AI assistance
  getDailyPrompt?: () => Promise<string>
}

export function EntryEditor({ 
  entry, 
  images = [], 
  formatDate,
  getDailyPrompt 
}: EntryEditorProps) {
  const { updateEntry, isUpdating } = useTodayEntry()
  const [content, setContent] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [showLivePreview, setShowLivePreview] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [dailyPrompt, setDailyPrompt] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize content when entry loads
  useEffect(() => {
    if (entry?.content) {
      setContent(entry.content)
    }
  }, [entry])

  // Update word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [content])

  // Auto-save with 1-second debounce
  useEffect(() => {
    if (!content.trim() || content === entry?.content) return

    const timer = setTimeout(() => {
      updateEntry({ content: content.trim() }, {
        onSuccess: () => {
          setLastSaved(new Date())
        }
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [content, entry?.content, updateEntry])

  // Load daily prompt if available
  useEffect(() => {
    if (getDailyPrompt && !dailyPrompt) {
      getDailyPrompt().then(setDailyPrompt).catch(() => {})
    }
  }, [getDailyPrompt, dailyPrompt])

  const formatText = (type: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let newText = ""
    switch (type) {
      case "bold":
        newText = `**${selectedText}**`
        break
      case "italic":
        newText = `*${selectedText}*`
        break
      default:
        return
    }

    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 2, start + 2 + selectedText.length)
    }, 0)
  }

  const insertList = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const newContent = content.substring(0, start) + "\n- " + content.substring(start)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + 3, start + 3)
    }, 0)
  }

  const getSaveStatus = () => {
    if (isUpdating) return "Saving..."
    if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`
    return "Draft"
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-background)]/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-lg font-semibold text-[var(--color-text)]">
              {formatDate ? formatDate(new Date()) : new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h1>
            <span className="font-mono text-sm text-[var(--color-text-secondary)]">
              {wordCount} words
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[var(--color-text-secondary)]">
              {getSaveStatus()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              {showLivePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 pb-40 md:pb-4" data-scroll-area>
        {/* Daily Prompt */}
        {dailyPrompt && (
          <div className="bg-[var(--color-accent)]/10 rounded-lg p-4 mb-6 border border-[var(--color-accent)]/20">
            <p className="font-mono text-sm text-[var(--color-text-secondary)] mb-2">Today's prompt:</p>
            <p className="font-mono text-[var(--color-text)]">{dailyPrompt}</p>
          </div>
        )}

        {/* Main Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind today?"
              className="min-h-[500px] font-mono bg-[var(--color-surface)] border-[var(--color-text-secondary)]/30 focus:border-[var(--color-primary)] resize-none text-base leading-relaxed"
              disabled={isUpdating}
            />
          </div>

          {/* Live Preview */}
          {showLivePreview && (
            <div className="space-y-4">
              <h3 className="font-mono text-sm font-medium text-[var(--color-text)]">Preview</h3>
              <div className="min-h-[500px] p-4 bg-[var(--color-surface)] border border-[var(--color-text-secondary)]/30 rounded-md">
                <div 
                  className="font-mono text-base leading-relaxed text-[var(--color-text)] whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^- (.+)$/gm, '• $1')
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Polaroid Gallery */}
        {images.length > 0 && (
          <div className="mt-8 mb-24 md:mb-0">
            <h3 className="font-mono text-sm font-medium text-[var(--color-text)] mb-4">Photos</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {images.map((image, index) => (
                <div key={index} className="flex-shrink-0 w-32 h-32 bg-white p-2 shadow-lg rotate-1 hover:rotate-0 transition-transform">
                  <img 
                    src={image.url} 
                    alt={image.caption || "Journal photo"} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Formatting Toolbar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-[var(--color-surface)]/95 backdrop-blur-sm border-t border-[var(--color-text-secondary)]/30 p-2 safe-area-pb z-20">
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => formatText("bold")}
            className="h-10 w-10 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => formatText("italic")}
            className="h-10 w-10 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={insertList}
            className="h-10 w-10 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Floating Camera Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-button-text)] shadow-lg"
        >
          <Camera className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
} 