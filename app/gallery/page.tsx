"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Calendar } from "lucide-react"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ImageModal } from "@/components/image-modal"
import Image from "next/image"

interface PhotoEntry {
  id: number
  date: string
  photos: Array<{
    id: number
    src: string
    caption: string
  }>
  entryPreview: string
}

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const photoEntries: PhotoEntry[] = [
    {
      id: 1,
      date: "December 17, 2024",
      photos: [
        { id: 1, src: "/placeholder.svg?height=300&width=300", caption: "Morning coffee ritual" },
        { id: 2, src: "/placeholder.svg?height=300&width=300", caption: "Sunset from the balcony" },
      ],
      entryPreview: "Today was filled with unexpected moments of joy...",
    },
    {
      id: 2,
      date: "December 15, 2024",
      photos: [
        { id: 3, src: "/placeholder.svg?height=300&width=300", caption: "Quiet Sunday morning" },
        { id: 4, src: "/placeholder.svg?height=300&width=300", caption: "Book and tea" },
        { id: 5, src: "/placeholder.svg?height=300&width=300", caption: "Garden flowers" },
      ],
      entryPreview: "A peaceful day of reflection and reading...",
    },
    {
      id: 3,
      date: "December 12, 2024",
      photos: [{ id: 6, src: "/placeholder.svg?height=300&width=300", caption: "City lights at night" }],
      entryPreview: "Evening walk through the city center...",
    },
  ]

  const handlePhotoClick = (photos: any[], index: number, entryId: number) => {
    setSelectedPhotos(photos)
    setSelectedIndex(index)
    setModalOpen(true)
  }

  const handleEntryClick = (entryId: number) => {
    // Navigate to that day's journal entry
    console.log(`Navigate to entry ${entryId}`)
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
      <DesktopSidebar currentPage="gallery" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-mono text-2xl text-[var(--color-text)] mb-4">Memory Gallery</h1>

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
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Gallery Grid */}
        <main className="flex-1 p-4 pb-20 md:pb-4">
          <div className="space-y-6">
            {photoEntries.map((entry) => (
              <Card key={entry.id} className="border-0 shadow-sm bg-[var(--color-card-background)]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-mono text-sm font-medium text-[var(--color-primary)]">{entry.date}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEntryClick(entry.id)}
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
                        onClick={() => handlePhotoClick(entry.photos, photoIndex, entry.id)}
                      >
                        <Image
                          src={photo.src || "/placeholder.svg"}
                          alt={photo.caption}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200" />
                      </div>
                    ))}
                  </div>

                  {/* Entry Preview */}
                  <p className="font-mono text-sm text-[var(--color-text)] leading-relaxed line-clamp-2">
                    {entry.entryPreview}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
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
