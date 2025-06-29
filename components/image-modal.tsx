"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import type { Photo } from "@/types/database"

interface ImageModalProps {
  photos: Photo[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  onDeletePhoto?: (photo: Photo) => void
}

export function ImageModal({ photos, initialIndex, isOpen, onClose, onDeletePhoto }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen) return null

  const currentPhoto = photos[currentIndex]
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < photos.length - 1

  const handlePrev = () => {
    if (canGoPrev) setCurrentIndex(currentIndex - 1)
  }

  const handleNext = () => {
    if (canGoNext) setCurrentIndex(currentIndex + 1)
  }

  const handleDelete = () => {
    if (onDeletePhoto && currentPhoto) {
      onDeletePhoto(currentPhoto)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose()
    if (e.key === "ArrowLeft") handlePrev()
    if (e.key === "ArrowRight") handleNext()
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Delete button */}
        {onDeletePhoto && (
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-10 bg-red-500/80 text-white hover:bg-red-600/80"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}

        {/* Navigation buttons */}
        {canGoPrev && (
          <Button
            onClick={handlePrev}
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        {canGoNext && (
          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}

        {/* Image */}
        <div className="relative">
          <Image
            src={currentPhoto.url || "/placeholder.svg"}
            alt={currentPhoto.caption || "Photo"}
            width={800}
            height={600}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            sizes="800px"
          />

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 rounded-b-lg">
            <p className="font-mono text-sm text-center">{currentPhoto.caption || "Untitled"}</p>
            <p className="font-mono text-xs text-center text-white/70 mt-1">
              {currentIndex + 1} of {photos.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
