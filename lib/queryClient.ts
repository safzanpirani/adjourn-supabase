import { QueryClient } from '@tanstack/react-query'

// React Query client with egress-optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes - LONGER to reduce refetches
      gcTime: 60 * 60 * 1000,    // 1 hour - keep cached longer
      retry: 2, // Reduce retries to save egress
      refetchOnWindowFocus: false, // CRITICAL: Don't refetch on focus
      refetchOnReconnect: 'always', // Only on actual reconnect
      refetchOnMount: false, // Use cache first
    },
    mutations: {
      retry: 1, // Reduce mutation retries
    },
  },
})

// Persist critical data to localStorage
export const persistCriticalData = () => {
  const persistedQueries = [
    'journals',
    'today-entry',
    'user-settings',
  ]
  
  persistedQueries.forEach(queryKey => {
    const data = queryClient.getQueryData([queryKey])
    if (data) {
      localStorage.setItem(`adjourn-cache-${queryKey}`, JSON.stringify(data))
    }
  })
} 