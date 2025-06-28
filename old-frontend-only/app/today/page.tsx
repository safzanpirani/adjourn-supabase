"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Bold, Italic, List, Undo, Redo, Sparkles } from "lucide-react"
import { PolaroidGallery } from "@/components/polaroid-gallery"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { QuickMuse } from "@/components/quick-muse"
import { VoiceRecorder } from "@/components/voice-recorder"
import { NoteMenu } from "@/components/note-menu"
import { useTheme } from "@/components/theme-provider"
import { useRouter } from "next/navigation"

export default function TodayPage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [photos, setPhotos] = useState([
    { id: 1, src: "/placeholder.svg?height=200&width=200", caption: "Morning coffee" },
    { id: 2, src: "/placeholder.svg?height=200&width=200", caption: "Sunset walk" },
  ])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { fontSize } = useTheme()

  // TODO: Implement randomized daily affirmations and writing prompts
  // This should pull from a curated list of prompts like:
  // - "What brought you joy today?"
  // - "What are you grateful for right now?"
  // - "How did you grow today?"
  // - "What's one thing you learned about yourself?"
  // - "What moment made you smile?"
  // The prompt should change daily but maintain the semantic meaning of asking about thoughts
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

  const handleAddPhoto = () => {
    if (photos.length >= 6) {
      alert("Maximum 6 photos allowed per entry")
      return
    }

    const newPhoto = {
      id: Date.now(), // Use timestamp for unique ID
      src: "/placeholder.svg?height=200&width=200",
      caption: "New memory",
    }
    setPhotos([...photos, newPhoto])
  }

  const handleDeletePhoto = (photoId: number) => {
    setPhotos(photos.filter((photo) => photo.id !== photoId))
  }

  const handleVoiceTranscription = (text: string) => {
    setContent((prev) => prev + (prev ? " " : "") + text)
  }

  const handleCopyNote = () => {
    navigator.clipboard.writeText(content)
    // TODO: Show toast notification
  }

  const handleDeleteNote = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      setContent("")
      setPhotos([])
    }
  }

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log("Undo")
  }

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log("Redo")
  }

  const handleFormat = (type: "bold" | "italic" | "list") => {
    // TODO: Implement text formatting
    console.log(`Format: ${type}`)
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
      <DesktopSidebar currentPage="today" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-mono text-lg text-[var(--color-text)]">{formatDate()}</h1>
          <div className="flex items-center gap-3">
            {/* Desktop formatting buttons */}
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleFormat("bold")} className="h-8 w-8">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleFormat("italic")} className="h-8 w-8">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleFormat("list")} className="h-8 w-8">
                <List className="w-4 h-4" />
              </Button>
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
          <div className="text-xs font-mono text-[var(--color-accent)] opacity-75">✓ Auto-saved</div>
        </div>

        {/* Editor */}
        <main className="flex-1 px-4 pb-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
            <PolaroidGallery photos={photos} onDeletePhoto={handleDeletePhoto} />
          </div>
        )}

        {/* Floating Add Photo Button - Better positioning */}
        <Button
          onClick={handleAddPhoto}
          className="fixed bottom-36 md:bottom-8 right-4 h-14 w-14 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 shadow-lg z-10"
          disabled={photos.length >= 6}
        >
          <Camera className="w-6 h-6 text-white" />
        </Button>

        {/* Mobile Formatting Toolbar */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-2 flex gap-2 justify-center">
          <Button variant="ghost" size="icon" onClick={() => handleFormat("bold")} className="h-10 w-10">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleFormat("italic")} className="h-10 w-10">
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleFormat("list")} className="h-10 w-10">
            <List className="w-4 h-4" />
          </Button>
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
