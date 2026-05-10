export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ApplicationStatus =
  | 'draft'
  | 'profile_incomplete'
  | 'documents_pending'
  | 'ready_for_payment'
  | 'paid'
  | 'in_review'
  | 'missing_documents'
  | 'ready_for_submission'
  | 'submitted'
  | 'completed'
  | 'rejected'

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentType = 'upfront' | 'deferred'
export type UserRole = 'user' | 'admin'
export type DocumentType =
  | 'passport'
  | 'lohnsteuer'
  | 'payslip'
  | 'student_proof'
  | 'home_tax_statement'
  | 'power_of_attorney'
  | 'bank_proof'
  | 'work_contract'
export type DocumentReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_reupload'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
          last_login_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          role?: UserRole
          created_at?: string
          last_login_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          last_login_at?: string | null
          is_active?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          date_of_birth: string | null
          nationality: string | null
          phone: string | null
          country_of_residence: string | null
          city: string | null
          address: string | null
          preferred_language: string
          passport_number: string | null
          document_type: string | null
          issuing_country: string | null
          document_expiry: string | null
          tax_id: string | null
          student_status: boolean | null
          university: string | null
          employer_name: string | null
          work_start: string | null
          work_end: string | null
          gross_income_eur: number | null
          bank_name: string | null
          iban: string | null
          swift_bic: string | null
          bank_account_holder: string | null
          bank_country: string | null
          profile_complete: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          phone?: string | null
          country_of_residence?: string | null
          city?: string | null
          address?: string | null
          preferred_language?: string
          passport_number?: string | null
          document_type?: string | null
          issuing_country?: string | null
          document_expiry?: string | null
          tax_id?: string | null
          student_status?: boolean | null
          university?: string | null
          employer_name?: string | null
          work_start?: string | null
          work_end?: string | null
          gross_income_eur?: number | null
          bank_name?: string | null
          iban?: string | null
          swift_bic?: string | null
          bank_account_holder?: string | null
          bank_country?: string | null
          profile_complete?: boolean
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      applications: {
        Row: {
          id: string
          user_id: string
          tax_year: number
          country: string
          status: ApplicationStatus
          payment_status: PaymentStatus
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          created_at: string
          updated_at: string
          submitted_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          tax_year: number
          country?: string
          status?: ApplicationStatus
          payment_status?: PaymentStatus
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
        }
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      documents: {
        Row: {
          id: string
          application_id: string
          document_type: DocumentType
          file_path: string
          file_name: string
          file_size: number
          mime_type: string
          review_status: DocumentReviewStatus
          admin_note: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          document_type: DocumentType
          file_path: string
          file_name: string
          file_size: number
          mime_type: string
          review_status?: DocumentReviewStatus
          admin_note?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      payments: {
        Row: {
          id: string
          application_id: string
          amount: number
          currency: string
          payment_type: PaymentType
          status: PaymentStatus
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          amount: number
          currency?: string
          payment_type: PaymentType
          status?: PaymentStatus
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          paid_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      notes: {
        Row: {
          id: string
          application_id: string
          text: string
          created_by: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          text: string
          created_by: string
          is_public?: boolean
        }
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }
      status_logs: {
        Row: {
          id: string
          application_id: string
          old_status: string | null
          new_status: string
          changed_by: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          old_status?: string | null
          new_status: string
          changed_by: string
          reason?: string | null
        }
        Update: Partial<Database['public']['Tables']['status_logs']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          is_read?: boolean
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
        }
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>
      }
    }
  }
}
