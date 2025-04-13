export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

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
          status_changes: string[] | null
          metadata?: Json
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
          status_changes?: string[] | null
          metadata?: Json
        }
        Update: Partial<Omit<Database['public']['Tables']['animals']['Insert'], 'id'>> & { id?: string }
      }
      adoption_applications: {
        Row: {
          id: string
          created_at: string
          animal_id: string
          user_id: string
          status: string
          application_data: Json
          review_notes: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          animal_id: string
          user_id: string
          status: string
          application_data: Json
          review_notes?: string | null
          reviewed_by?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['adoption_applications']['Insert'], 'id'>> & { id?: string }
      }
      animal_photos: {
        Row: {
          id: string
          animal_id: string
          url: string
          is_primary: boolean
          created_at: string
          uploaded_by: string
          metadata?: Json
        }
        Insert: {
          id?: string
          animal_id: string
          url: string
          is_primary: boolean
          created_at?: string
          uploaded_by: string
          metadata?: Json
        }
        Update: Partial<Omit<Database['public']['Tables']['animal_photos']['Insert'], 'id'>> & { id?: string }
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
        Update: Partial<Omit<Database['public']['Tables']['shelters']['Insert'], 'id'>> & { id?: string }
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
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Insert'], 'id'>> & { id?: string }
      }
      donations: {
        Row: {
          id: string
          created_at: string
          amount: number
          shelter_id: string
          donor_id: string | null
          status: string
          email?: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          amount: number
          shelter_id: string
          donor_id?: string | null
          status: string
          email?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['donations']['Insert'], 'id'>> & { id?: string }
      }
    }
  }
}

// Export commonly used types
export type Animal = Database['public']['Tables']['animals']['Row']
export type AnimalInsert = Database['public']['Tables']['animals']['Insert']
export type AnimalUpdate = Database['public']['Tables']['animals']['Update']
export type AnimalPhoto = Database['public']['Tables']['animal_photos']['Row']
export type AnimalPhotoInsert = Database['public']['Tables']['animal_photos']['Insert']
export type AnimalPhotoUpdate = Database['public']['Tables']['animal_photos']['Update']
export type AdoptionApplication = Database['public']['Tables']['adoption_applications']['Row']
export type AdoptionApplicationInsert = Database['public']['Tables']['adoption_applications']['Insert']
export type AdoptionApplicationUpdate = Database['public']['Tables']['adoption_applications']['Update']
export type Shelter = Database['public']['Tables']['shelters']['Row']
export type ShelterInsert = Database['public']['Tables']['shelters']['Insert']
export type ShelterUpdate = Database['public']['Tables']['shelters']['Update']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type Donation = Database['public']['Tables']['donations']['Row']
export type DonationInsert = Database['public']['Tables']['donations']['Insert']
export type DonationUpdate = Database['public']['Tables']['donations']['Update']

// Add StatusChange type if needed
export type StatusChange = {
  status: string
  timestamp: string
  notes?: string
}
