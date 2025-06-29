"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Undo, Redo, Sparkles, Upload } from "lucide-react"
import { PolaroidGallery } from "@/components/polaroid-gallery"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { QuickMuse } from "@/components/quick-muse"
import { VoiceRecorder } from "@/components/voice-recorder"
import { NoteMenu } from "@/components/note-menu"
import { AuthGuard } from "@/components/auth-guard"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"
import { useTodayEntry } from "@/hooks/useOptimizedHooks"
import { usePhotos } from "@/hooks/usePhotos"
import { usePhotoUpload } from "@/hooks/usePhotoUpload"
import { toast } from "@/hooks/use-toast"


function TodayPageContent() {
  const router = useRouter()
  const { entry, updateEntry, createEntry, deleteEntry: removeEntry, isUpdating, isLoading } = useTodayEntry()
  const { photos, deletePhoto, isDeleting } = usePhotos(entry?.id || null)
  const { uploadPhoto, isUploading } = usePhotoUpload()
  const [content, setContent] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { fontSize } = useTheme()
  const [history, setHistory] = useState<string[]>([""])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Initialize content when entry loads or changes to a different entry
  useEffect(() => {
    if (!entry?.content) return

    // If current editor content matches entry content, do not reset history (avoids clearing history after auto-save)
    if (entry.content === content) return

    setContent(entry.content)
    setHistory([entry.content])
    setHistoryIndex(0)
  }, [entry])

  // Auto-save with 1-second debounce
  useEffect(() => {
    const trimmedContent = content.trim()
    if (!trimmedContent) return
    
    // Don't save if content hasn't changed from what's already saved
    const savedContent = entry?.content?.trim() || ""
    if (trimmedContent === savedContent) return
    
    const timer = setTimeout(() => {
      if (entry?.id) {
        // Update existing entry
        updateEntry({ content: trimmedContent }, {
          onSuccess: () => setLastSaved(new Date())
        })
      } else {
        // Create new entry
        createEntry({ content: trimmedContent }, {
          onSuccess: () => setLastSaved(new Date())
        })
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [content]) // Only depend on content changes

  const getRandomPlaceholder = () => {
    const prompts = [
      "What's on your mind today?",
      "What brought you joy today?",
      "What are you grateful for right now?",
      "How did you grow today?",
      "What moment made you smile?",
      "What's one thing you learned about yourself?",
    ]
    // TODO: Use date-based seeding to ensure same prompt per day
    return prompts[Math.floor(Math.random() * prompts.length)]
  }

  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)
  }, [content])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const formatDate = () => {
    const today = new Date()
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleFileSelect = async (files: FileList) => {
    if (!entry?.id) {
      // Create entry first if it doesn't exist
      if (content.trim()) {
        await createEntry({ content: content.trim() })
      } else {
        await createEntry({ content: "New entry" })
      }
    }

    if (entry?.id && files.length > 0) {
      const fileArray = Array.from(files)
      
      // Check photo limit
      if (photos.length + fileArray.length > 6) {
        alert(`You can only add ${6 - photos.length} more photos. Maximum 6 photos per entry.`)
        return
      }

      for (const file of fileArray) {
        const defaultCaption = file.name.split('.')[0]
        const caption = prompt("Enter caption for this photo", defaultCaption) || defaultCaption
        try {
          await uploadPhoto({ file, entryId: entry.id, caption })
        } catch (err) {
          console.error('Failed to upload photo:', err)
        }
      }
    }
  }

  const handleAddPhoto = () => {
    if (photos.length >= 6) {
      alert("Maximum 6 photos allowed per entry")
      return
    }
    fileInputRef.current?.click()
  }

  const handleDeletePhoto = (photoId: string) => {
    deletePhoto(photoId)
  }

  const updateContent = (value: string) => {
    setContent(value)
    setHistory((prev) => {
      const newHist = prev.slice(0, historyIndex + 1)
      newHist.push(value)
      return newHist.length > 100 ? newHist.slice(newHist.length - 100) : newHist
    })
    setHistoryIndex((idx) => idx + 1)
  }

  const handleVoiceTranscription = (text: string) => {
    const textarea = textareaRef.current
    
    if (!textarea) {
      // Fallback: append with smart spacing
      const needsSpace = content.trim() && !content.endsWith(' ') && !content.endsWith('\n')
      updateContent(content + (needsSpace ? " " : "") + text)
      return
    }

    // Insert at cursor position with smart spacing
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Smart spacing logic
    const beforeCursor = content.substring(0, start)
    const afterCursor = content.substring(end)
    
    const needsSpaceBefore = beforeCursor.trim() && 
                            !beforeCursor.endsWith(' ') && 
                            !beforeCursor.endsWith('\n')
    const needsSpaceAfter = afterCursor.trim() && 
                           !afterCursor.startsWith(' ') && 
                           !afterCursor.startsWith('\n')
    
    const spaceBefore = needsSpaceBefore ? " " : ""
    const spaceAfter = needsSpaceAfter ? " " : ""
    const insertText = spaceBefore + text + spaceAfter
    
    const newContent = beforeCursor + insertText + afterCursor
    updateContent(newContent)
    
    // Restore cursor position after text insertion
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + insertText.length
      textarea.setSelectionRange(newPosition, newPosition)
      
      // Scroll into view on mobile
      textarea.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }, 0)
  }

  const handleCopyNote = () => {
    navigator.clipboard.writeText(content)
    toast({ description: "Note copied to clipboard" })
  }

  const handleDeleteNote = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      removeEntry()
      setContent("")
      toast({ description: "Note deleted" })
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex])
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const getSaveStatus = () => {
    if (isUpdating || isUploading) return "Saving..."
    if (lastSaved) return `✓ Saved ${lastSaved.toLocaleTimeString()}`
    if (content.trim() && !entry) return "Creating..."
    return "✓ Auto-saved"
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
        <DesktopSidebar currentPage="today" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
        <BottomNavigation currentPage="today" />
      </div>
    )
  }

  return (
    <div 
      className={`flex min-h-[100dvh] bg-[var(--color-background)] ${
        isDragOver ? "bg-blue-50 dark:bg-blue-950" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DesktopSidebar currentPage="today" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-mono text-base md:text-lg text-[var(--color-text)]">{formatDate()}</h1>
          <div className="flex items-center gap-3">
            {/* Desktop Undo / Redo */}
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleUndo} className="h-8 w-8">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRedo} className="h-8 w-8">
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
            </div>

            <span className="font-mono text-sm text-[var(--color-text-secondary)]">{wordCount} words</span>

            {/* Mobile: Muse button, Desktop: Voice + QuickMuse */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/muse")}
                className="h-8 w-8 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <VoiceRecorder onTranscription={handleVoiceTranscription} size="sm" />
              <QuickMuse />
            </div>

            <NoteMenu onCopy={handleCopyNote} onDelete={handleDeleteNote} />
          </div>
        </header>

        {/* Auto-save indicator */}
        <div className="px-4 py-1">
          <div className="text-xs font-mono text-[var(--color-accent)] opacity-75">{getSaveStatus()}</div>
        </div>

        {/* Drag overlay */}
        {isDragOver && (
          <div className="fixed inset-0 bg-blue-500/20 border-4 border-dashed border-blue-500 z-10 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-mono">
              <Upload className="w-6 h-6 mx-auto mb-2" />
              Drop photos here to upload
            </div>
          </div>
        )}

        {/* Editor */}
        <main className="flex-1 px-4 pb-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            className="w-full h-full font-mono text-[var(--color-text)] bg-transparent resize-none focus:outline-none leading-relaxed"
            placeholder={getRandomPlaceholder()}
            style={{
              minHeight: "60vh",
              fontSize: `${fontSize}px`,
            }}
          />
        </main>

        {/* Polaroid Gallery */}
        {photos.length > 0 && (
          <div className="px-4 pb-4">
            <PolaroidGallery 
              photos={photos} 
              onDeletePhoto={handleDeletePhoto}
              isDeleting={isDeleting}
            />
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />

        {/* Floating Add Photo Button */}
        <Button
          onClick={handleAddPhoto}
          className={`fixed bottom-36 md:bottom-8 right-4 h-14 w-14 rounded-full shadow-lg z-10 transition-all ${
            isUploading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
          }`}
          disabled={photos.length >= 6 || isUploading}
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Mobile Formatting Toolbar */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-2 flex gap-2 justify-center">
          <Button variant="ghost" size="icon" onClick={handleUndo} className="h-10 w-10">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRedo} className="h-10 w-10">
            <Redo className="w-4 h-4" />
          </Button>
          <VoiceRecorder onTranscription={handleVoiceTranscription} />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation currentPage="today" />
      </div>
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
