export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      pitch_decks: {
        Row: {
          analysis_complete: boolean | null
          analysis_results: Json | null
          created_at: string
          file_name: string
          file_url: string
          id: string
          startup_id: string
        }
        Insert: {
          analysis_complete?: boolean | null
          analysis_results?: Json | null
          created_at?: string
          file_name: string
          file_url: string
          id?: string
          startup_id: string
        }
        Update: {
          analysis_complete?: boolean | null
          analysis_results?: Json | null
          created_at?: string
          file_name?: string
          file_url?: string
          id?: string
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitch_decks_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          claude_api_key: string | null
          created_at: string
          free_analyses_used: number | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          claude_api_key?: string | null
          created_at?: string
          free_analyses_used?: number | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          claude_api_key?: string | null
          created_at?: string
          free_analyses_used?: number | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      startups: {
        Row: {
          created_at: string
          description: string | null
          factors: Json | null
          id: string
          manually_edited: boolean | null
          name: string
          score: number | null
          scored_manually: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          factors?: Json | null
          id?: string
          manually_edited?: boolean | null
          name: string
          score?: number | null
          scored_manually?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          factors?: Json | null
          id?: string
          manually_edited?: boolean | null
          name?: string
          score?: number | null
          scored_manually?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}