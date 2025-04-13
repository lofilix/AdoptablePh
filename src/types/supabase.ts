Need to install the following packages:
supabase@2.20.12

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      animals: {
        Row: {
          id: string
          created_at: string
          name: string
          type: 'dog' | 'cat' | 'other'
          status: 'for_rescuing' | 'available' | 'adopted' | 'fostered' | 'under_treatment'
          shelter_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: 'dog' | 'cat' | 'other'
          status?: 'for_rescuing' | 'available' | 'adopted' | 'fostered' | 'under_treatment'
          shelter_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: 'dog' | 'cat' | 'other'
          status?: 'for_rescuing' | 'available' | 'adopted' | 'fostered' | 'under_treatment'
          shelter_id?: string
        }
      }
      // Add other tables as needed
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
