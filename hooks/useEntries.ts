import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface JournalEntrySummary {
  id: string
  date: string
  content: string | null
  mood: number | null
  created_at: string
  updated_at: string
  // Computed fields
  preview: string
  wordCount: number
  hasPhotos?: boolean // TODO: Will be computed when photos are implemented
}

export interface UseEntriesOptions {
  limit?: number
  offset?: number
  searchQuery?: string
  startDate?: string
  endDate?: string
}

export const useEntries = (options: UseEntriesOptions = {}) => {
  const { user } = useAuth()
  const { 
    limit = 20, 
    offset = 0, 
    searchQuery = '', 
    startDate, 
    endDate 
  } = options

  return useQuery({
    queryKey: ['entries', user?.id, limit, offset, searchQuery, startDate, endDate],
    queryFn: async (): Promise<{ entries: JournalEntrySummary[]; totalCount: number }> => {
      if (!user?.id) return { entries: [], totalCount: 0 }

      // Build the query - select only what we need for egress optimization
      let query = supabase
        .from('entries')
        .select('id, date, content, mood, created_at, updated_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      // Apply filters
      if (searchQuery) {
        query = query.ilike('content', `%${searchQuery}%`)
      }

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      // Process entries to add computed fields
      const processedEntries: JournalEntrySummary[] = (data || []).map((entry: any) => {
        const content = entry.content || ''
        
        // Create preview (first 120 characters, end at word boundary)
        let preview = content.slice(0, 120)
        if (content.length > 120) {
          const lastSpace = preview.lastIndexOf(' ')
          if (lastSpace > 80) { // Don't cut too short
            preview = preview.slice(0, lastSpace) + '...'
          } else {
            preview = preview + '...'
          }
        }

        // Calculate word count
        const wordCount = content
          .trim()
          .split(/\s+/)
          .filter((word: string) => word.length > 0).length

        return {
          ...entry,
          preview,
          wordCount,
          hasPhotos: false, // Will be updated below with real photo data
        }
      })

      // Get photo data for the entries
      if (processedEntries.length > 0) {
        const entryIds = processedEntries.map(entry => entry.id)
        const { data: photoData } = await supabase
          .from('photos')
          .select('entry_id')
          .in('entry_id', entryIds)

        // Create set of entry IDs that have photos
        const entriesWithPhotos = new Set((photoData || []).map(photo => photo.entry_id))
        
        // Update hasPhotos flag
        processedEntries.forEach(entry => {
          entry.hasPhotos = entriesWithPhotos.has(entry.id)
        })
      }

      return {
        entries: processedEntries,
        totalCount: count || 0
      }
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute - entries list can change more frequently
    gcTime: 3 * 60 * 1000, // Keep in cache for 3 minutes
  })
}

// Hook for getting entries for a specific month (for calendar view)
export const useEntriesForMonth = (year: number, month: number) => {
  const { user } = useAuth()

  // Create start and end dates for the month
  const startDate = new Date(year, month, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

  return useQuery({
    queryKey: ['entries-month', user?.id, year, month],
    queryFn: async (): Promise<Record<string, { hasEntry: boolean; hasPhotos: boolean; wordCount: number }>> => {
      if (!user?.id) return {}

      // Query entries for the month
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('id, date, content')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)

      if (entriesError) throw entriesError

      // Query photos for entries in this month
      const entryIds = (entriesData || []).map(entry => entry.id)
      let photosData: any[] = []
      
      if (entryIds.length > 0) {
        const { data: photoResults, error: photosError } = await supabase
          .from('photos')
          .select('entry_id')
          .in('entry_id', entryIds)

        if (photosError) throw photosError
        photosData = photoResults || []
      }

      // Create a set of entry IDs that have photos
      const entriesWithPhotos = new Set(photosData.map(photo => photo.entry_id))

      // Convert to object for easy lookup
      const entriesMap: Record<string, { hasEntry: boolean; hasPhotos: boolean; wordCount: number }> = {}
      
      if (entriesData) {
        entriesData.forEach((entry: { id: string; date: string; content: string | null }) => {
          const wordCount = (entry.content || '')
            .trim()
            .split(/\s+/)
            .filter((word: string) => word.length > 0).length

          entriesMap[entry.date] = {
            hasEntry: true,
            hasPhotos: entriesWithPhotos.has(entry.id),
            wordCount
          }
        })
      }

      return entriesMap
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // Keep month data longer
  })
} 