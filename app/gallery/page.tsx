"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Calendar, Loader2, ImageIcon } from "lucide-react"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ImageModal } from "@/components/image-modal"
import { AuthGuard } from "@/components/auth-guard"
import { useGalleryPhotos } from "@/hooks/usePhotos"
import Image from "next/image"

function GalleryPageContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const router = useRouter()
  
  // Use real data from Supabase
  const { photoEntries, isLoading, error, totalPhotos } = useGalleryPhotos(searchQuery)

  const handlePhotoClick = (photos: any[], index: number) => {
    setSelectedPhotos(photos)
    setSelectedIndex(index)
    setModalOpen(true)
  }

  const handleEntryClick = (entryDate: string) => {
    // Navigate to that day's journal entry
    router.push(`/entry/${entryDate}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEntryPreview = (content: string | null) => {
    if (!content) return "No journal entry for this day"
    
    // Create preview (first 120 characters, end at word boundary)
    let preview = content.slice(0, 120)
    if (content.length > 120) {
      const lastSpace = preview.lastIndexOf(' ')
      if (lastSpace > 80) {
        preview = preview.slice(0, lastSpace) + '...'
      } else {
        preview = preview + '...'
      }
    }
    return preview
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
      <DesktopSidebar currentPage="gallery" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-mono text-2xl text-[var(--color-text)]">Memory Gallery</h1>
            {totalPhotos > 0 && (
              <span className="font-mono text-sm text-[var(--color-text-secondary)]">
                {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos and memories..."
                className="pl-10 font-mono bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-[var(--color-primary)] text-[var(--color-text)]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="bg-white dark:bg-gray-800 text-[var(--color-primary)] border-[var(--color-primary)]/30"
              disabled // TODO: Implement filtering
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Gallery Grid */}
        <main className="flex-1 p-4 pb-20 md:pb-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
              <span className="font-mono text-sm text-[var(--color-text-secondary)] ml-2">
                Loading your memories...
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <p className="font-mono text-sm text-red-500">
                Error loading photos: {error.message}
              </p>
            </div>
          )}

          {!isLoading && !error && photoEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="w-12 h-12 text-[var(--color-text-secondary)] mb-4" />
              <h3 className="font-mono text-lg text-[var(--color-text)] mb-2">
                {searchQuery ? 'No photos found' : 'No photos yet'}
              </h3>
              <p className="font-mono text-sm text-[var(--color-text-secondary)] max-w-md">
                {searchQuery 
                  ? `No photos match "${searchQuery}". Try a different search term.`
                  : 'Start capturing memories by adding photos to your journal entries!'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push('/today')}
                  className="mt-4 font-mono"
                  variant="outline"
                >
                  Create Today's Entry
                </Button>
              )}
            </div>
          )}

          {!isLoading && !error && photoEntries.length > 0 && (
          <div className="space-y-6">
            {photoEntries.map((entry) => (
                <Card key={entry.entry_id} className="border-0 shadow-sm bg-[var(--color-card-background)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                      <h3 className="font-mono text-sm font-medium text-[var(--color-primary)]">
                        {formatDate(entry.entry_date)}
                      </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                        onClick={() => handleEntryClick(entry.entry_date)}
                      className="font-mono text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      View Entry
                    </Button>
                  </div>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {entry.photos.map((photo, photoIndex) => (
                      <div
                        key={photo.id}
                        className="aspect-square relative overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => handlePhotoClick(entry.photos, photoIndex)}
                      >
                        <Image
                            src={photo.url || "/placeholder.svg"}
                            alt={photo.caption || "Photo"}
                          fill
                          className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200" />
                      </div>
                    ))}
                  </div>

                  {/* Entry Preview */}
                  <p className="font-mono text-sm text-[var(--color-text)] leading-relaxed line-clamp-2">
                      {getEntryPreview(entry.entry_content)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation currentPage="journals" />
      </div>

      {/* Image Modal */}
      <ImageModal
        photos={selectedPhotos}
        initialIndex={selectedIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export default function GalleryPage() {
  return (
    <AuthGuard>
      <GalleryPageContent />
    </AuthGuard>
  )
}
