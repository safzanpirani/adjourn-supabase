// Main export file for egress-optimized hooks
// ALWAYS use this export for all data access to ensure optimization

export { useAuth } from './useAuth'
export { useTodayEntry } from './useTodayEntry'
export { useStreaks } from './useStreaks'

// Real database hooks - now implemented!
export { useEntry } from './useEntry'
export { useEntries, useEntriesForMonth } from './useEntries'

// TODO: Implement these hooks when needed
// export { useJournalsOptimized as useJournals } from './useJournalsOptimized'

// Placeholder hooks for development (to be implemented when needed)
import { useQuery } from '@tanstack/react-query'

export const useJournals = () => {
  return useQuery({
    queryKey: ['journals'],
    queryFn: () => Promise.resolve([]),
    enabled: false, // Disable until needed
  })
} 