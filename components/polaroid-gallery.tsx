"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageModal } from "./image-modal"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface Photo {
  id: number
  src: string
  caption: string
}

interface PolaroidGalleryProps {
  photos: Photo[]
  onDeletePhoto?: (id: number) => void
}

export function PolaroidGallery({ photos, onDeletePhoto }: PolaroidGalleryProps) {
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null)

  // Limit to 6 photos max
  const displayPhotos = photos.slice(0, 6)

  const handlePhotoClick = (index: number) => {
    setSelectedIndex(index)
    setModalOpen(true)
  }

  const handleDeletePhoto = (photo: Photo) => {
    setPhotoToDelete(photo)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (photoToDelete && onDeletePhoto) {
      onDeletePhoto(photoToDelete.id)
      setPhotoToDelete(null)
    }
  }

  return (
    <>
      {/* Mobile: 3 visible with horizontal scroll */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {displayPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`
                flex-shrink-0 bg-white dark:bg-gray-100 p-3 pb-8 shadow-lg transform transition-all duration-300 cursor-pointer relative
                border-2 border-[var(--color-accent)]/20
                ${draggedPhoto === photo.id ? "scale-105 rotate-2" : "hover:scale-105 hover:-rotate-1"}
              `}
              style={{
                transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (Math.random() * 4 + 1)}deg)`,
                minWidth: "96px", // Ensure consistent width
              }}
              onMouseDown={() => setDraggedPhoto(photo.id)}
              onMouseUp={() => setDraggedPhoto(null)}
              onMouseLeave={() => setDraggedPhoto(null)}
              onClick={() => handlePhotoClick(index)}
            >
              <div className="w-24 h-24 relative overflow-hidden bg-gray-100 dark:bg-gray-200">
                <Image src={photo.src || "/placeholder.svg"} alt={photo.caption} fill className="object-cover" />
              </div>
              <p className="font-mono text-xs text-gray-800 text-center mt-2 max-w-24 truncate">{photo.caption}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Fixed width polaroids in a flex layout */}
      <div className="hidden md:block">
        <div className="flex gap-4 flex-wrap">
          {displayPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`
                bg-white dark:bg-gray-100 p-3 pb-8 shadow-lg transform transition-all duration-300 cursor-pointer relative
                border-2 border-[var(--color-accent)]/20
                ${draggedPhoto === photo.id ? "scale-105 rotate-2" : "hover:scale-105 hover:-rotate-1"}
              `}
              style={{
                transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (Math.random() * 4 + 1)}deg)`,
                width: "160px", // Fixed width for desktop
              }}
              onMouseDown={() => setDraggedPhoto(photo.id)}
              onMouseUp={() => setDraggedPhoto(null)}
              onMouseLeave={() => setDraggedPhoto(null)}
              onClick={() => handlePhotoClick(index)}
            >
              <div className="w-32 h-32 relative overflow-hidden bg-gray-100 dark:bg-gray-200">
                <Image src={photo.src || "/placeholder.svg"} alt={photo.caption} fill className="object-cover" />
              </div>
              <p className="font-mono text-xs text-gray-800 text-center mt-2 max-w-32 truncate">{photo.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <ImageModal
        photos={displayPhotos}
        initialIndex={selectedIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDeletePhoto={(photo) => handleDeletePhoto(photo)}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Photo"
        message={`Are you sure you want to delete "${photoToDelete?.caption}"? This action cannot be undone.`}
      />
    </>
  )
}
