export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

// Define reusable metadata types
export type PhotoMetadata = {
  size: number
  description: string
  tags: string[]
}

export type DonationType = 'general' | 'medical' | 'shelter'

export interface Database {
  public: {
    Tables: {
      animals: {
        Row: {
          id: string
          created_at: string
          name: string
          type: "dog" | "cat" | "other"
          status: string
          shelter_id: string
          breed: string | null
          age_years: number | null
          age_months: number | null
          gender: "male" | "female" | null
          description: string | null
          image_url: string | null
          treatment_details: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: "dog" | "cat" | "other"
          status: string
          shelter_id: string
          breed?: string | null
          age_years?: number | null
          age_months?: number | null
          gender?: "male" | "female" | null
          description?: string | null
          image_url?: string | null
          treatment_details?: string | null
          metadata?: Json | null
        }
        Update: Partial<Omit<Database['public']['Tables']['animals']['Row'], 'id'>> & { id?: string }
      }
      status_changes: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          old_status: string
          new_status: string
          changed_at: string
          changed_by: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          old_status: string
          new_status: string
          changed_at?: string
          changed_by: string
          metadata?: Json | null
        }
        Update: Partial<Omit<Database['public']['Tables']['status_changes']['Row'], 'id'>> & { id?: string }
      }
      animal_photos: {
        Row: {
          id: string
          animal_id: string
          url: string
          is_primary: boolean
          created_at: string
          uploaded_by: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          animal_id: string
          url: string
          is_primary: boolean
          created_at?: string
          uploaded_by: string
          metadata?: Json | null
        }
        Update: Partial<Omit<Database['public']['Tables']['animal_photos']['Row'], 'id'>> & { id?: string }
      }
      shelters: {
        Row: {
          id: string
          name: string
          email: string
          contact_number: string
          is_verified: boolean
          created_at: string
          address: string
          logo_url: string | null
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          contact_number: string
          is_verified?: boolean
          created_at?: string
          address: string
          logo_url?: string | null
          description?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['shelters']['Row'], 'id'>> & { id?: string }
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: string
          created_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id'>> & { id?: string }
      }
      donations: {
        Row: {
          id: string
          created_at: string
          amount: number
          shelter_id: string
          donor_id: string | null
          status: string
          email: string | null
          is_anonymous: boolean
          donation_type: DonationType
        }
        Insert: {
          id?: string
          created_at?: string
          amount: number
          shelter_id: string
          donor_id?: string | null
          status: string
          email?: string | null
          is_anonymous?: boolean
          donation_type: DonationType
        }
        Update: Partial<Omit<Database['public']['Tables']['donations']['Row'], 'id'>> & { id?: string }
      }
    }
  }
}

// Export commonly used types
export type Animal = Database['public']['Tables']['animals']['Row']
export type AnimalInsert = Database['public']['Tables']['animals']['Insert']
export type AnimalUpdate = Database['public']['Tables']['animals']['Update']

export type StatusChange = Database['public']['Tables']['status_changes']['Row']
export type StatusChangeInsert = Database['public']['Tables']['status_changes']['Insert']
export type StatusChangeUpdate = Database['public']['Tables']['status_changes']['Update']

export type AnimalPhoto = Database['public']['Tables']['animal_photos']['Row']
export type AnimalPhotoInsert = Database['public']['Tables']['animal_photos']['Insert']
export type AnimalPhotoUpdate = Database['public']['Tables']['animal_photos']['Update']

export type Donation = Database['public']['Tables']['donations']['Row']
export type DonationInsert = Database['public']['Tables']['donations']['Insert']
export type DonationUpdate = Database['public']['Tables']['donations']['Update']

export type Shelter = Database['public']['Tables']['shelters']['Row']
export type ShelterInsert = Database['public']['Tables']['shelters']['Insert']
export type ShelterUpdate = Database['public']['Tables']['shelters']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Helper type for metadata
export type JsonMetadata = {
  size?: number
  description?: string
  tags?: string[]
  [key: string]: any
}
