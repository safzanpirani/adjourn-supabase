import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { compressImage, validateImageFile } from '@/lib/imageCompression'
import type { Photo } from '@/types/database'

interface UploadPhotoParams {
  file: File
  entryId: string
  caption?: string
}

interface UsePhotoUploadResult {
  uploadPhoto: (params: UploadPhotoParams) => Promise<Photo>
  uploadPhotos: (params: { files: File[]; entryId: string }) => Promise<Photo[]>
  isUploading: boolean
  uploadProgress: number
  error: Error | null
}

export const usePhotoUpload = (): UsePhotoUploadResult => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, entryId, caption = '' }: UploadPhotoParams): Promise<Photo> => {
      if (!user?.id) throw new Error('User not authenticated')

      // Validate the file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Compress the image
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1080,
        fileType: 'image/webp',
        initialQuality: 0.8,
      })

      // Generate unique filename
      const fileExt = compressedFile.type.split('/')[1] || 'webp'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      // Get image dimensions
      const dimensions = await getImageDimensions(compressedFile)

      // Save photo record to database
      const { data: photoData, error: dbError } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          entry_id: entryId,
          url: publicUrl,
          caption,
          width: dimensions.width,
          height: dimensions.height,
          file_size: compressedFile.size,
        })
        .select()
        .single()

      if (dbError) {
        // Clean up storage if database insert fails
        await supabase.storage.from('photos').remove([filePath])
        throw dbError
      }

      return photoData
    },
    onSuccess: (newPhoto) => {
      // Invalidate photos cache
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })

  const uploadPhotosMutation = useMutation({
    mutationFn: async ({ files, entryId }: { files: File[]; entryId: string }): Promise<Photo[]> => {
      const uploadedPhotos: Photo[] = []
      
      for (const file of files) {
        try {
          const photo = await uploadPhotoMutation.mutateAsync({
            file,
            entryId,
            caption: file.name.split('.')[0], // Use filename as default caption
          })
          uploadedPhotos.push(photo)
        } catch (error) {
          console.error('Failed to upload photo:', error)
          // Continue with other files even if one fails
        }
      }
      
      return uploadedPhotos
    },
    onSuccess: () => {
      // Invalidate photos cache
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })

  return {
    uploadPhoto: uploadPhotoMutation.mutateAsync,
    uploadPhotos: uploadPhotosMutation.mutateAsync,
    isUploading: uploadPhotoMutation.isPending || uploadPhotosMutation.isPending,
    uploadProgress: 0, // TODO: Implement progress tracking
    error: uploadPhotoMutation.error || uploadPhotosMutation.error,
  }
}

// Helper function to get image dimensions
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
} 