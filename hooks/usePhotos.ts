import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Photo } from '@/types/database'

interface UsePhotosResult {
  photos: Photo[]
  isLoading: boolean
  error: Error | null
  deletePhoto: (photoId: string) => void
  updatePhotoCaption: (photoId: string, caption: string) => void
  isDeleting: boolean
  isUpdating: boolean
}

export const usePhotos = (entryId: string | null): UsePhotosResult => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: photos = [], isLoading, error } = useQuery({
    queryKey: ['photos', entryId, user?.id],
    queryFn: async (): Promise<Photo[]> => {
      if (!user?.id || !entryId) return []
      
      const { data, error } = await supabase
        .from('photos')
        .select('id, user_id, entry_id, url, caption, width, height, file_size, created_at')
        .eq('user_id', user.id)
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.id && !!entryId,
    staleTime: 30 * 1000, // 30 seconds - photos don't change often
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
  })

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      if (!user?.id) throw new Error('User not authenticated')

      // First, get the photo to get the storage path
      const { data: photo, error: fetchError } = await supabase
        .from('photos')
        .select('url')
        .eq('id', photoId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      if (photo?.url) {
        // Extract the file path from the URL
        const urlParts = photo.url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `${user.id}/${fileName}`

        const { error: storageError } = await supabase.storage
          .from('photos')
          .remove([filePath])

        if (storageError) {
          console.warn('Failed to delete from storage:', storageError)
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', user.id)

      if (error) throw error
      
      return photoId // Return the deleted photo ID
    },
    onMutate: async (photoId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['photos', entryId, user?.id] })

      // Snapshot the previous value
      const previousPhotos = queryClient.getQueryData(['photos', entryId, user?.id])

      // Optimistically update to remove the photo
      queryClient.setQueryData(['photos', entryId, user?.id], (old: Photo[] | undefined) => {
        if (!old) return []
        return old.filter(photo => photo.id !== photoId)
      })

      // Return context with snapshot value
      return { previousPhotos }
    },
    onError: (err, photoId, context) => {
      console.error('Failed to delete photo:', err)
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPhotos) {
        queryClient.setQueryData(['photos', entryId, user?.id], context.previousPhotos)
      }
    },
    onSuccess: (photoId) => {
      // Invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ['photos', entryId, user?.id] })
    },
  })

  const updatePhotoCaptionMutation = useMutation({
    mutationFn: async ({ photoId, caption }: { photoId: string; caption: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('photos')
        .update({ caption })
        .eq('id', photoId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate the specific photos cache for this entry
      queryClient.invalidateQueries({ queryKey: ['photos', entryId, user?.id] })
    },
  })

  return {
    photos,
    isLoading,
    error,
    deletePhoto: deletePhotoMutation.mutate,
    updatePhotoCaption: (photoId: string, caption: string) => 
      updatePhotoCaptionMutation.mutate({ photoId, caption }),
    isDeleting: deletePhotoMutation.isPending,
    isUpdating: updatePhotoCaptionMutation.isPending,
  }
}

// New hook for gallery - fetches all photos with entry information
interface GalleryPhotoEntry {
  entry_id: string
  entry_date: string
  entry_content: string | null
  photos: Photo[]
}

interface UseGalleryPhotosResult {
  photoEntries: GalleryPhotoEntry[]
  isLoading: boolean
  error: Error | null
  totalPhotos: number
}

export const useGalleryPhotos = (searchQuery: string = ''): UseGalleryPhotosResult => {
  const { user } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['gallery-photos', user?.id, searchQuery],
    queryFn: async (): Promise<{ photoEntries: GalleryPhotoEntry[]; totalPhotos: number }> => {
      if (!user?.id) return { photoEntries: [], totalPhotos: 0 }

      // Fetch photos with their entry information
      let query = supabase
        .from('photos')
        .select(`
          id, url, caption, width, height, file_size, created_at,
          entry_id,
          entries!inner(id, date, content)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Apply search filter if provided
      if (searchQuery.trim()) {
        query = query.or(`caption.ilike.%${searchQuery}%,entries.content.ilike.%${searchQuery}%`)
      }

      const { data: photos, error } = await query

      if (error) throw error

      // Group photos by entry
      const entriesMap = new Map<string, GalleryPhotoEntry>()
      let totalPhotos = 0

      photos?.forEach((photo: any) => {
        totalPhotos++
        const entryId = photo.entry_id
        
        if (!entriesMap.has(entryId)) {
          entriesMap.set(entryId, {
            entry_id: entryId,
            entry_date: photo.entries.date,
            entry_content: photo.entries.content,
            photos: []
          })
        }

        const photoData: Photo = {
          id: photo.id,
          user_id: user.id,
          entry_id: photo.entry_id,
          url: photo.url,
          caption: photo.caption,
          width: photo.width,
          height: photo.height,
          file_size: photo.file_size,
          created_at: photo.created_at
        }

        entriesMap.get(entryId)!.photos.push(photoData)
      })

      // Convert to array and sort by entry date (newest first)
      const photoEntries = Array.from(entriesMap.values()).sort((a, b) => 
        new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      )

      return { photoEntries, totalPhotos }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
  })

  return {
    photoEntries: data?.photoEntries || [],
    isLoading,
    error,
    totalPhotos: data?.totalPhotos || 0,
  }
} 