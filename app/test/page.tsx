"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Trash2 } from "lucide-react"
import { usePhotoUpload } from "@/hooks/usePhotoUpload"
import { usePhotos } from "@/hooks/usePhotos"
import { useTodayEntry } from "@/hooks/useOptimizedHooks"
import { AuthGuard } from "@/components/auth-guard"
import Image from "next/image"

function TestContent() {
  const { entry, createEntry } = useTodayEntry()
  const { photos, deletePhoto } = usePhotos(entry?.id || null)
  const { uploadPhoto, isUploading, error } = usePhotoUpload()
  const [status, setStatus] = useState("")

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setStatus("Uploading...")
      
      // Create entry if needed
      if (!entry?.id) {
        createEntry({ content: "Photo test entry" })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!entry?.id) {
        setStatus("❌ Failed to create entry")
        return
      }

      await uploadPhoto({
        file,
        entryId: entry.id,
        caption: file.name.split('.')[0]
      })

      setStatus("✅ Upload successful!")
      setTimeout(() => setStatus(""), 3000)
      
    } catch (err) {
      setStatus(`❌ Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">📸 Photo Upload Test</h1>
      
      <div className="grid gap-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-4">Upload Test</h2>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="mb-4"
            disabled={isUploading}
          />
          
          {status && (
            <div className="text-lg font-medium mb-4">{status}</div>
          )}
          
          {error && (
            <div className="text-red-600 mb-4">Error: {error.message}</div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>Entry ID: {entry?.id || "None"}</p>
            <p>Photos: {photos.length}</p>
            <p>Uploading: {isUploading ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* Photos Display */}
        {photos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Uploaded Photos ({photos.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="border rounded-lg p-4">
                  <div className="relative w-full h-48 mb-3 bg-gray-100 rounded">
                    <Image
                      src={photo.url}
                      alt={photo.caption || "Photo"}
                      fill
                      className="object-cover rounded"
                      sizes="300px"
                    />
                  </div>
                  <p className="font-medium truncate">{photo.caption || "Untitled"}</p>
                  <p className="text-sm text-gray-500">
                    {photo.width}×{photo.height} • {((photo.file_size || 0) / 1024).toFixed(1)}KB
                  </p>
                  <Button
                    onClick={() => deletePhoto(photo.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TestPage() {
  return (
    <AuthGuard>
      <TestContent />
    </AuthGuard>
  )
} 