// Database types for Supabase with egress optimization
export interface Database {
  public: {
    Tables: {
      journals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          last_accessed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          last_accessed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          last_accessed_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          user_id: string
          journal_id: string
          title: string | null
          content: string
          date_key: string // YYYY-MM-DD format for efficient indexing
          word_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          journal_id: string
          title?: string | null
          content: string
          date_key: string
          word_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          journal_id?: string
          title?: string | null
          content?: string
          date_key?: string
          word_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          entry_id: string
          user_id: string
          storage_path: string
          filename: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          user_id: string
          storage_path: string
          filename: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          user_id?: string
          storage_path?: string
          filename?: string
          display_order?: number
          created_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_entry_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_entry_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_entry_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: 'light' | 'dark' | 'sepia'
          font_family: string
          font_size: number
          sound_enabled: boolean
          haptic_enabled: boolean
          daily_prompts_enabled: boolean
          default_journal_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: 'light' | 'dark' | 'sepia'
          font_family?: string
          font_size?: number
          sound_enabled?: boolean
          haptic_enabled?: boolean
          daily_prompts_enabled?: boolean
          default_journal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: 'light' | 'dark' | 'sepia'
          font_family?: string
          font_size?: number
          sound_enabled?: boolean
          haptic_enabled?: boolean
          daily_prompts_enabled?: boolean
          default_journal_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Utility types for components
export type Journal = Database['public']['Tables']['journals']['Row']
export type Entry = Database['public']['Tables']['entries']['Row']
export type Image = Database['public']['Tables']['images']['Row']
export type Streak = Database['public']['Tables']['streaks']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

// Egress-optimized partial types for listings
export type EntryListItem = Pick<Entry, 'id' | 'title' | 'date_key' | 'word_count' | 'updated_at'>
export type JournalListItem = Pick<Journal, 'id' | 'name' | 'last_accessed_at'>

// Helper for today's date key
export const getTodayDateKey = (): string => {
  return new Date().toISOString().split('T')[0]
} 