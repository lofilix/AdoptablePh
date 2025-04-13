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
          type: string
          status: string
          shelter_id: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
      }
      shelters: {
        Row: {
          id: string
          name: string
          email: string
          contact_number: string
          is_verified: boolean
          created_at: string
        }
      }
    }
  }
}
