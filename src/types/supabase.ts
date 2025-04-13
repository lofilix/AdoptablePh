// --- Utility Types ---
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export type UUID = string
export type TimestampTZ = string

// --- Enum Types ---
export type AnimalType = 'dog' | 'cat' | 'other'
export type AnimalStatus = 'for_rescuing' | 'available' | 'adopted' | 'fostered' | 'under_treatment'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'
export type UserRole = 'user' | 'admin' | 'shelter_admin'
export type DonationType = 'general' | 'medical' | 'shelter'
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type ProjectCategory = 'infrastructure' | 'medical' | 'food_supplies' | 'equipment' | 'other'
export type ProjectStatus = 'active' | 'completed' | 'cancelled'
export type EntityType = 'animal' | 'application' | 'project' | 'donation'

// --- Complex Types ---
export type OperatingHours = {
  weekday_hours: {
    open: string
    close: string
  }
  weekend_hours: {
    open: string
    close: string
  }
  holidays?: {
    [key: string]: {
      open: string
      close: string
    }
  }
}

export type SocialMediaLinks = {
  facebook?: string
  instagram?: string
  twitter?: string
  website?: string
  [key: string]: string | undefined
}

export type PhotoMetadata = {
  size?: number
  description?: string
  tags?: string[]
  uploadedAt?: TimestampTZ
  lastModified?: TimestampTZ
  dimensions?: {
    width: number
    height: number
  }
  [key: string]: any
}

export type StatusChangeMetadata = {
  reason?: string
  previousData?: Json
  newData?: Json
  systemGenerated?: boolean
  [key: string]: any
}

// --- Database Interface ---
export interface Database {
  public: {
    Tables: {
      animals: {
        Row: {
          id: UUID
          created_at: TimestampTZ
          updated_at: TimestampTZ
          name: string
          type: AnimalType
          status: AnimalStatus
          shelter_id: UUID
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
          id?: UUID
          created_at?: TimestampTZ
          updated_at?: TimestampTZ
          name: string
          type: AnimalType
          status: AnimalStatus
          shelter_id: UUID
          breed?: string | null
          age_years?: number | null
          age_months?: number | null
          gender?: "male" | "female" | null
          description?: string | null
          image_url?: string | null
          treatment_details?: string | null
          metadata?: Json | null
        }
        Update: Partial<Omit<Database['public']['Tables']['animals']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
      adoption_applications: {
        Row: {
          id: UUID
          created_at: TimestampTZ
          updated_at: TimestampTZ
          animal_id: UUID
          user_id: UUID
          status: ApplicationStatus
          application_data: Json
          review_notes: string | null
          reviewed_by: UUID | null
          reviewed_at: TimestampTZ | null
        }
        Insert: {
          id?: UUID
          created_at?: TimestampTZ
          updated_at?: TimestampTZ
          animal_id: UUID
          user_id: UUID
          status?: ApplicationStatus
          application_data: Json
          review_notes?: string | null
          reviewed_by?: UUID | null
          reviewed_at?: TimestampTZ | null
        }
        Update: Partial<Omit<Database['public']['Tables']['adoption_applications']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
      animal_photos: {
        Row: {
          id: UUID
          animal_id: UUID
          url: string
          is_primary: boolean
          created_at: TimestampTZ
          uploaded_by: UUID
          metadata: PhotoMetadata | null
        }
        Insert: {
          id?: UUID
          animal_id: UUID
          url: string
          is_primary?: boolean
          created_at?: TimestampTZ
          uploaded_by: UUID
          metadata?: PhotoMetadata | null
        }
        Update: Partial<Omit<Database['public']['Tables']['animal_photos']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
      status_changes: {
        Row: {
          id: UUID
          entity_type: EntityType
          entity_id: UUID
          old_status: string | null
          new_status: string
          changed_by: UUID | null
          changed_at: TimestampTZ
          notes: string | null
          metadata: StatusChangeMetadata | null
        }
        Insert: {
          id?: UUID
          entity_type: EntityType
          entity_id: UUID
          old_status?: string | null
          new_status: string
          changed_by?: UUID | null
          changed_at?: TimestampTZ
          notes?: string | null
          metadata?: StatusChangeMetadata | null
        }
        Update: Partial<Omit<Database['public']['Tables']['status_changes']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
      shelter_details: {
        Row: {
          id: UUID
          shelter_id: UUID
          operating_hours: OperatingHours | null
          contact_preferences: Json | null
          social_media_links: SocialMediaLinks | null
          facilities: string[] | null
          services_offered: string[] | null
          created_at: TimestampTZ
          updated_at: TimestampTZ
        }
        Insert: {
          id?: UUID
          shelter_id: UUID
          operating_hours?: OperatingHours | null
          contact_preferences?: Json | null
          social_media_links?: SocialMediaLinks | null
          facilities?: string[] | null
          services_offered?: string[] | null
          created_at?: TimestampTZ
          updated_at?: TimestampTZ
        }
        Update: Partial<Omit<Database['public']['Tables']['shelter_details']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
      donations: {
        Row: {
          id: UUID
          created_at: TimestampTZ
          updated_at: TimestampTZ
          amount: number
          shelter_id: UUID
          donor_id: UUID | null
          status: DonationStatus
          email: string | null
          is_anonymous: boolean
          donation_type: DonationType
          payment_intent_id: string | null
          payment_method: string | null
          receipt_url: string | null
          impact_report_sent: boolean
          metadata: Json | null
        }
        Insert: {
          id?: UUID
          created_at?: TimestampTZ
          updated_at?: TimestampTZ
          amount: number
          shelter_id: UUID
          donor_id?: UUID | null
          status?: DonationStatus
          email?: string | null
          is_anonymous?: boolean
          donation_type: DonationType
          payment_intent_id?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          impact_report_sent?: boolean
          metadata?: Json | null
        }
        Update: Partial<Omit<Database['public']['Tables']['donations']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
      shelter_projects: {
        Row: {
          id: UUID
          shelter_id: UUID
          title: string
          description: string
          goal_amount: number
          current_amount: number
          start_date: TimestampTZ
          end_date: TimestampTZ | null
          status: ProjectStatus
          category: ProjectCategory
          created_at: TimestampTZ
          updated_at: TimestampTZ
          metadata: Json | null
        }
        Insert: {
          id?: UUID
          shelter_id: UUID
          title: string
          description: string
          goal_amount: number
          current_amount?: number
          start_date: TimestampTZ
          end_date?: TimestampTZ | null
          status?: ProjectStatus
          category: ProjectCategory
          created_at?: TimestampTZ
          updated_at?: TimestampTZ
          metadata?: Json | null
        }
        Update: Partial<Omit<Database['public']['Tables']['shelter_projects']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
      shelters: {
        Row: {
          id: UUID
          name: string
          email: string
          contact_number: string
          is_verified: boolean
          created_at: TimestampTZ
          updated_at: TimestampTZ
          address: string
          logo_url: string | null
          description: string | null
          admin_id: UUID | null
        }
        Insert: {
          id?: UUID
          name: string
          email: string
          contact_number: string
          is_verified?: boolean
          created_at?: TimestampTZ
          updated_at?: TimestampTZ
          address: string
          logo_url?: string | null
          description?: string | null
          admin_id?: UUID | null
        }
        Update: Partial<Omit<Database['public']['Tables']['shelters']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
      profiles: {
        Row: {
          id: UUID
          email: string
          role: UserRole
          created_at: TimestampTZ
          updated_at: TimestampTZ
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: UUID
          email: string
          role?: UserRole
          created_at?: TimestampTZ
          updated_at?: TimestampTZ
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>> & { id?: UUID }
      }
    }
  }
}

// --- Export Table Types ---
export type Animal = Database['public']['Tables']['animals']['Row']
export type AnimalInsert = Database['public']['Tables']['animals']['Insert']
export type AnimalUpdate = Database['public']['Tables']['animals']['Update']

export type AdoptionApplication = Database['public']['Tables']['adoption_applications']['Row']
export type AdoptionApplicationInsert = Database['public']['Tables']['adoption_applications']['Insert']
export type AdoptionApplicationUpdate = Database['public']['Tables']['adoption_applications']['Update']

export type AnimalPhoto = Database['public']['Tables']['animal_photos']['Row']
export type AnimalPhotoInsert = Database['public']['Tables']['animal_photos']['Insert']
export type AnimalPhotoUpdate = Database['public']['Tables']['animal_photos']['Update']

export type StatusChange = Database['public']['Tables']['status_changes']['Row']
export type StatusChangeInsert = Database['public']['Tables']['status_changes']['Insert']
export type StatusChangeUpdate = Database['public']['Tables']['status_changes']['Update']

export type ShelterDetail = Database['public']['Tables']['shelter_details']['Row']
export type ShelterDetailInsert = Database['public']['Tables']['shelter_details']['Insert']
export type ShelterDetailUpdate = Database['public']['Tables']['shelter_details']['Update']

export type Donation = Database['public']['Tables']['donations']['Row']
export type DonationInsert = Database['public']['Tables']['donations']['Insert']
export type DonationUpdate = Database['public']['Tables']['donations']['Update']

export type ShelterProject = Database['public']['Tables']['shelter_projects']['Row']
export type ShelterProjectInsert = Database['public']['Tables']['shelter_projects']['Insert']
export type ShelterProjectUpdate = Database['public']['Tables']['shelter_projects']['Update']

export type Shelter = Database['public']['Tables']['shelters']['Row']
export type ShelterInsert = Database['public']['Tables']['shelters']['Insert']
export type ShelterUpdate = Database['public']['Tables']['shelters']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
