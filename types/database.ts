// Database types for Supabase with egress optimization
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          user_id: string
          date: string // DATE format YYYY-MM-DD
          content: string | null
          mood: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          content?: string | null
          mood?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          content?: string | null
          mood?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          user_id: string
          entry_id: string
          url: string
          caption: string | null
          width: number | null
          height: number | null
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_id: string
          url: string
          caption?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_id?: string
          url?: string
          caption?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          created_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          entry_id: string
          messages: any // JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_id: string
          messages?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_id?: string
          messages?: any
          created_at?: string
          updated_at?: string
        }
      }
      voice_recordings: {
        Row: {
          id: string
          user_id: string
          entry_id: string
          url: string
          duration: number | null
          file_size: number | null
          transcription: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_id: string
          url: string
          duration?: number | null
          file_size?: number | null
          transcription?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_id?: string
          url?: string
          duration?: number | null
          file_size?: number | null
          transcription?: string | null
          created_at?: string
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
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Entry = Database['public']['Tables']['entries']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row']
export type VoiceRecording = Database['public']['Tables']['voice_recordings']['Row']

// Egress-optimized partial types for listings
export type EntryListItem = Pick<Entry, 'id' | 'date' | 'content' | 'updated_at'>
export type PhotoListItem = Pick<Photo, 'id' | 'url' | 'caption' | 'created_at'>

// Simple Voice Recorder Props
export interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

// Helper for today's date key
export const getTodayDateKey = (): string => {
  return new Date().toISOString().split('T')[0]
} 