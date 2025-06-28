import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface JournalEntry {
  id: string
  user_id: string
  date: string
  content: string | null
  mood: number | null
  created_at: string
  updated_at: string
}

export const useEntry = (date: string) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: entry, isLoading, error } = useQuery({
    queryKey: ['entry', date, user?.id],
    queryFn: async (): Promise<JournalEntry | null> => {
      if (!user?.id) return null
      
      const { data, error } = await supabase
        .from('entries')
        .select('id, user_id, date, content, mood, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data || null
    },
    enabled: !!user?.id && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })

  const createEntryMutation = useMutation({
    mutationFn: async ({ content, mood }: { content: string; mood?: number }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          date,
          content,
          mood,
        })
        .select('id, user_id, date, content, mood, created_at, updated_at')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newEntry) => {
      // Update the specific entry cache
      queryClient.setQueryData(['entry', date, user?.id], newEntry)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['streaks'] })
      
      // Also update today entry cache if this is today
      const today = new Date().toISOString().split('T')[0]
      if (date === today) {
        queryClient.setQueryData(['today-entry', today, user?.id], newEntry)
      }
    },
  })

  const updateEntryMutation = useMutation({
    mutationFn: async ({ content, mood }: { content: string; mood?: number }) => {
      if (!user?.id || !entry?.id) throw new Error('No entry to update')

      const { data, error } = await supabase
        .from('entries')
        .update({
          content,
          mood,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entry.id)
        .eq('user_id', user.id)
        .select('id, user_id, date, content, mood, created_at, updated_at')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedEntry) => {
      // Update the specific entry cache
      queryClient.setQueryData(['entry', date, user?.id], updatedEntry)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      
      // Also update today entry cache if this is today
      const today = new Date().toISOString().split('T')[0]
      if (date === today) {
        queryClient.setQueryData(['today-entry', today, user?.id], updatedEntry)
      }
    },
  })

  const deleteEntryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !entry?.id) throw new Error('No entry to delete')

      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entry.id)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      // Clear the specific entry cache
      queryClient.setQueryData(['entry', date, user?.id], null)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['streaks'] })
      
      // Also clear today entry cache if this is today
      const today = new Date().toISOString().split('T')[0]
      if (date === today) {
        queryClient.setQueryData(['today-entry', today, user?.id], null)
      }
    },
  })

  return {
    entry,
    isLoading,
    error,
    hasEntry: !!entry,
    createEntry: createEntryMutation.mutate,
    updateEntry: updateEntryMutation.mutate,
    deleteEntry: deleteEntryMutation.mutate,
    isCreating: createEntryMutation.isPending,
    isUpdating: updateEntryMutation.isPending,
    isDeleting: deleteEntryMutation.isPending,
    isSaving: createEntryMutation.isPending || updateEntryMutation.isPending,
    mutationError: createEntryMutation.error || updateEntryMutation.error || deleteEntryMutation.error,
  }
} 