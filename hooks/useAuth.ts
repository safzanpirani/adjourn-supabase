import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useEffect } from 'react'

export const useAuth = () => {
  const queryClient = useQueryClient()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth'],
    queryFn: async (): Promise<User | null> => {
      // First try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.warn('Session error:', sessionError)
      }
      
      // Then get the user
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error && error.message !== 'Invalid Refresh Token: Refresh Token Not Found') {
        throw error
      }
      return user
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for auth data
    retry: (failureCount, error: any) => {
      // Don't retry if it's an auth error
      if (error?.message?.includes('Refresh Token')) return false
      return failureCount < 1
    },
  })

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT') {
          // Clear all user data from cache
          queryClient.clear()
          localStorage.removeItem('adjourn-cache-journals')
          localStorage.removeItem('adjourn-cache-today-entry')
          localStorage.removeItem('adjourn-cache-user-settings')
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Invalidate auth query to refetch user data
          queryClient.invalidateQueries({ queryKey: ['auth'] })
        }
        
        // Update auth cache
        queryClient.setQueryData(['auth'], session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [queryClient])

  const signInGoogleMutation = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: () => {
      // Auth state change will be handled by the listener
    },
  })

  const signInEmailMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signInWithEmail(email, password),
    onSuccess: () => {
      // Auth state change will be handled by the listener
    },
  })

  const signUpEmailMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signUpWithEmail(email, password),
    onSuccess: () => {
      // Auth state change will be handled by the listener
    },
  })

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Auth state change will be handled by the listener
    },
  })

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signInWithGoogle: signInGoogleMutation.mutate,
    signInWithEmail: signInEmailMutation.mutate,
    signUpWithEmail: signUpEmailMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInGoogleMutation.isPending || signInEmailMutation.isPending,
    isSigningUp: signUpEmailMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    authError: signInGoogleMutation.error || signInEmailMutation.error || signUpEmailMutation.error,
  }
} 