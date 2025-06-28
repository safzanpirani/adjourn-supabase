import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface StreakData {
  current_streak: number
  longest_streak: number
  total_entries: number
}

export const useStreaks = () => {
  const { user } = useAuth()

  const { data: streaks, isLoading, error } = useQuery({
    queryKey: ['streaks', user?.id],
    queryFn: async (): Promise<StreakData> => {
      if (!user?.id) {
        return { current_streak: 0, longest_streak: 0, total_entries: 0 }
      }

      // Get all entry dates for this user, ordered by date
      const { data: entries, error } = await supabase
        .from('entries')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error

      const totalEntries = entries.length

      if (totalEntries === 0) {
        return { current_streak: 0, longest_streak: 0, total_entries: 0 }
      }

      // Convert dates to Date objects and sort
      const dates = entries.map(entry => new Date(entry.date)).sort((a, b) => b.getTime() - a.getTime())
      
      // Calculate current streak
      let currentStreak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let checkDate = new Date(today)
      
      for (const entryDate of dates) {
        const entryDay = new Date(entryDate)
        entryDay.setHours(0, 0, 0, 0)
        
        if (entryDay.getTime() === checkDate.getTime()) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (entryDay.getTime() < checkDate.getTime()) {
          // Gap found, stop counting current streak
          break
        }
      }
      
      // If no entry today and yesterday, current streak might still be valid
      if (currentStreak === 0 && dates.length > 0) {
        const mostRecentEntry = dates[0]
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (mostRecentEntry.getTime() === yesterday.getTime()) {
          currentStreak = 1
          checkDate = new Date(yesterday)
          checkDate.setDate(checkDate.getDate() - 1)
          
          for (let i = 1; i < dates.length; i++) {
            const entryDate = new Date(dates[i])
            entryDate.setHours(0, 0, 0, 0)
            
            if (entryDate.getTime() === checkDate.getTime()) {
              currentStreak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0
      let tempStreak = 0
      
      // Sort dates ascending for streak calculation
      const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime())
      
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1
        } else {
          const prevDate = new Date(sortedDates[i - 1])
          const currDate = new Date(sortedDates[i])
          const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (dayDiff === 1) {
            tempStreak++
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)

      return {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_entries: totalEntries,
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - streaks don't change often
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  return {
    streaks: streaks || { current_streak: 0, longest_streak: 0, total_entries: 0 },
    isLoading,
    error,
  }
} 