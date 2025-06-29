import { createClient } from '@supabase/supabase-js'

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Supabase client with egress-optimized configuration
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      storageKey: 'adjourn-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce',
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 2, // Limit realtime events to reduce egress
      },
    },
  }
)

// Auth helper functions for Google OAuth + Email/Password
export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    // @ts-ignore - flowType is allowed by supabase-js but missing in older type version
    flowType: 'pkce',
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      // @ts-ignore ensure pkce in options for older builds
      flowType: 'pkce',
    },
  })
  if (error) throw error
}

export const signInWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
}

export const signUpWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
} 