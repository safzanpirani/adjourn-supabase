// Main export file for egress-optimized hooks
// ALWAYS use this export for all data access to ensure optimization

export { useAuth } from './useAuth'
export { useTodayEntry } from './useTodayEntry'
export { useStreaks } from './useStreaks'

// TODO: Implement these hooks when needed
// export { useEntriesOptimized as useEntries } from './useEntriesOptimized'
// export { useJournalsOptimized as useJournals } from './useJournalsOptimized'

// Placeholder hooks for development (to be implemented when needed)
import { useQuery } from '@tanstack/react-query'

export const useEntries = (journalId?: string) => {
  return useQuery({
    queryKey: ['entries', journalId],
    queryFn: () => Promise.resolve([]),
    enabled: false, // Disable until needed
  })
}

export const useJournals = () => {
  return useQuery({
    queryKey: ['journals'],
    queryFn: () => Promise.resolve([]),
    enabled: false, // Disable until needed
  })
} 