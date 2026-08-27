export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          duration: number
          facility_id: string | null
          id: string
          notes: string | null
          patient_profile_id: string
          practitioner_id: string
          pre_consultation_answers: Json | null
          reason: string
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          type: Database["public"]["Enums"]["appointment_type"]
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          duration?: number
          facility_id?: string | null
          id?: string
          notes?: string | null
          patient_profile_id: string
          practitioner_id: string
          pre_consultation_answers?: Json | null
          reason: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          duration?: number
          facility_id?: string | null
          id?: string
          notes?: string | null
          patient_profile_id?: string
          practitioner_id?: string
          pre_consultation_answers?: Json | null
          reason?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_reports: {
        Row: {
          appointment_id: string | null
          created_at: string
          follow_up: string | null
          follow_up_date: string | null
          id: string
          is_read: boolean
          observations: string | null
          patient_profile_id: string
          practitioner_id: string | null
          reason: string | null
          recommendations: string | null
          source: Database["public"]["Enums"]["report_source"]
          summary: string
          symptoms: string | null
          title: string
          treatment: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          follow_up?: string | null
          follow_up_date?: string | null
          id?: string
          is_read?: boolean
          observations?: string | null
          patient_profile_id: string
          practitioner_id?: string | null
          reason?: string | null
          recommendations?: string | null
          source?: Database["public"]["Enums"]["report_source"]
          summary: string
          symptoms?: string | null
          title?: string
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          follow_up?: string | null
          follow_up_date?: string | null
          id?: string
          is_read?: boolean
          observations?: string | null
          patient_profile_id?: string
          practitioner_id?: string | null
          reason?: string | null
          recommendations?: string | null
          source?: Database["public"]["Enums"]["report_source"]
          summary?: string
          symptoms?: string | null
          title?: string
          treatment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_reports_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_reports_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_reports_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          appointment_id: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          file_url: string
          id: string
          issued_at: string | null
          mime_type: string | null
          name: string
          patient_profile_id: string
          practitioner_id: string | null
          size: number | null
          type: Database["public"]["Enums"]["document_type"]
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          file_url: string
          id?: string
          issued_at?: string | null
          mime_type?: string | null
          name: string
          patient_profile_id: string
          practitioner_id?: string | null
          size?: number | null
          type?: Database["public"]["Enums"]["document_type"]
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          file_url?: string
          id?: string
          issued_at?: string | null
          mime_type?: string | null
          name?: string
          patient_profile_id?: string
          practitioner_id?: string | null
          size?: number | null
          type?: Database["public"]["Enums"]["document_type"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          postal_code: string | null
          street: string | null
          type: Database["public"]["Enums"]["facility_type"]
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          street?: string | null
          type?: Database["public"]["Enums"]["facility_type"]
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          street?: string | null
          type?: Database["public"]["Enums"]["facility_type"]
          updated_at?: string
        }
        Relationships: []
      }
      facility_reviews: {
        Row: {
          cleanliness_rating: number | null
          comment: string | null
          created_at: string
          equipment_rating: number | null
          facility_id: string
          id: string
          is_anonymous: boolean
          is_visible: boolean
          moderated_at: string | null
          moderation_reason: string | null
          moderation_status: Database["public"]["Enums"]["review_moderation_status"]
          patient_profile_id: string
          rating: number
          reception_rating: number | null
          report_count: number
          updated_at: string
        }
        Insert: {
          cleanliness_rating?: number | null
          comment?: string | null
          created_at?: string
          equipment_rating?: number | null
          facility_id: string
          id?: string
          is_anonymous?: boolean
          is_visible?: boolean
          moderated_at?: string | null
          moderation_reason?: string | null
          moderation_status?: Database["public"]["Enums"]["review_moderation_status"]
          patient_profile_id: string
          rating: number
          reception_rating?: number | null
          report_count?: number
          updated_at?: string
        }
        Update: {
          cleanliness_rating?: number | null
          comment?: string | null
          created_at?: string
          equipment_rating?: number | null
          facility_id?: string
          id?: string
          is_anonymous?: boolean
          is_visible?: boolean
          moderated_at?: string | null
          moderation_reason?: string | null
          moderation_status?: Database["public"]["Enums"]["review_moderation_status"]
          patient_profile_id?: string
          rating?: number
          reception_rating?: number | null
          report_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_reviews_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_reviews_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          practitioner_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          practitioner_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          practitioner_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      health_forms: {
        Row: {
          additional_notes: string | null
          allergies: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string
          current_medications: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          family_history: string | null
          height_cm: string | null
          id: string
          lifestyle: string | null
          patient_profile_id: string
          surgeries: string | null
          updated_at: string
          vaccination_notes: string | null
          weight_kg: string | null
        }
        Insert: {
          additional_notes?: string | null
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          current_medications?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          family_history?: string | null
          height_cm?: string | null
          id?: string
          lifestyle?: string | null
          patient_profile_id: string
          surgeries?: string | null
          updated_at?: string
          vaccination_notes?: string | null
          weight_kg?: string | null
        }
        Update: {
          additional_notes?: string | null
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          current_medications?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          family_history?: string | null
          height_cm?: string | null
          id?: string
          lifestyle?: string | null
          patient_profile_id?: string
          surgeries?: string | null
          updated_at?: string
          vaccination_notes?: string | null
          weight_kg?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_forms_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: true
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_metrics: {
        Row: {
          created_at: string
          id: string
          measured_at: string
          metric_type: string
          note: string | null
          patient_profile_id: string
          secondary_value: number | null
          unit: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          measured_at?: string
          metric_type: string
          note?: string | null
          patient_profile_id: string
          secondary_value?: number | null
          unit?: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          measured_at?: string
          metric_type?: string
          note?: string | null
          patient_profile_id?: string
          secondary_value?: number | null
          unit?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          is_archived: boolean | null
          patient_profile_id: string
          practitioner_id: string
          unread_count: number | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          patient_profile_id: string
          practitioner_id: string
          unread_count?: number | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          patient_profile_id?: string
          practitioner_id?: string
          unread_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type"]
          status: Database["public"]["Enums"]["message_status"]
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type"]
          status?: Database["public"]["Enums"]["message_status"]
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_type?: Database["public"]["Enums"]["sender_type"]
          status?: Database["public"]["Enums"]["message_status"]
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          appointment_reminders: boolean | null
          created_at: string
          document_notifications: boolean | null
          email_enabled: boolean | null
          id: string
          marketing_emails: boolean | null
          message_notifications: boolean | null
          push_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_reminders?: boolean | null
          created_at?: string
          document_notifications?: boolean | null
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          message_notifications?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_reminders?: boolean | null
          created_at?: string
          document_notifications?: boolean | null
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          message_notifications?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          postal_code: string | null
          profile_type: Database["public"]["Enums"]["profile_type"]
          social_security_number: string | null
          street: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          postal_code?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"]
          social_security_number?: string | null
          street?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"]
          social_security_number?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      practitioner_reviews: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          is_visible: boolean
          moderated_at: string | null
          moderation_reason: string | null
          moderation_status: Database["public"]["Enums"]["review_moderation_status"]
          patient_profile_id: string
          practitioner_id: string
          rating: number
          report_count: number
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          is_visible?: boolean
          moderated_at?: string | null
          moderation_reason?: string | null
          moderation_status?: Database["public"]["Enums"]["review_moderation_status"]
          patient_profile_id: string
          practitioner_id: string
          rating: number
          report_count?: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          is_visible?: boolean
          moderated_at?: string | null
          moderation_reason?: string | null
          moderation_status?: Database["public"]["Enums"]["review_moderation_status"]
          patient_profile_id?: string
          practitioner_id?: string
          rating?: number
          report_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_reviews_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_reviews_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioners: {
        Row: {
          accepts_new_patients: boolean | null
          avatar_url: string | null
          bio: string | null
          consultation_price: number | null
          created_at: string
          facility_id: string | null
          first_name: string
          id: string
          languages: string[] | null
          last_name: string
          next_availability: string | null
          rating: number | null
          review_count: number | null
          specialty_id: string | null
          teleconsultation_enabled: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepts_new_patients?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          consultation_price?: number | null
          created_at?: string
          facility_id?: string | null
          first_name: string
          id?: string
          languages?: string[] | null
          last_name: string
          next_availability?: string | null
          rating?: number | null
          review_count?: number | null
          specialty_id?: string | null
          teleconsultation_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepts_new_patients?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          consultation_price?: number | null
          created_at?: string
          facility_id?: string | null
          first_name?: string
          id?: string
          languages?: string[] | null
          last_name?: string
          next_availability?: string | null
          rating?: number | null
          review_count?: number | null
          specialty_id?: string | null
          teleconsultation_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioners_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioners_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      record_shares: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          message: string | null
          patient_profile_id: string
          practitioner_id: string | null
          revoked_at: string | null
          share_documents: boolean
          share_health_form: boolean
          share_metrics: boolean
          share_reports: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          message?: string | null
          patient_profile_id: string
          practitioner_id?: string | null
          revoked_at?: string | null
          share_documents?: boolean
          share_health_form?: boolean
          share_metrics?: boolean
          share_reports?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          message?: string | null
          patient_profile_id?: string
          practitioner_id?: string | null
          revoked_at?: string | null
          share_documents?: boolean
          share_health_form?: boolean
          share_metrics?: boolean
          share_reports?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "record_shares_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_shares_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_user_id: string
          status: string
          target_id: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_user_id: string
          status?: string
          target_id?: string | null
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_user_id?: string
          status?: string
          target_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_disputes: {
        Row: {
          created_at: string
          details: string | null
          disputer_user_id: string
          id: string
          reason: string
          resolution_note: string | null
          review_id: string
          review_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          disputer_user_id: string
          id?: string
          reason: string
          resolution_note?: string | null
          review_id: string
          review_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          disputer_user_id?: string
          id?: string
          reason?: string
          resolution_note?: string | null
          review_id?: string
          review_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_responses: {
        Row: {
          created_at: string
          id: string
          responder_user_id: string
          response: string
          review_id: string
          review_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          responder_user_id: string
          response: string
          review_id: string
          review_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          responder_user_id?: string
          response?: string
          review_id?: string
          review_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_appointment: {
        Args: { appointment_id: string }
        Returns: boolean
      }
      can_access_document: { Args: { document_id: string }; Returns: boolean }
      is_profile_owner: { Args: { profile_id: string }; Returns: boolean }
      is_thread_participant: { Args: { thread_id: string }; Returns: boolean }
      notify_user: {
        Args: {
          _body: string
          _link: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      appointment_type: "in_person" | "teleconsultation"
      document_type:
        | "prescription"
        | "lab_result"
        | "imaging"
        | "report"
        | "certificate"
        | "invoice"
        | "other"
      facility_type: "clinic" | "hospital" | "cabinet" | "laboratory"
      gender_type: "male" | "female" | "other"
      message_status: "sending" | "sent" | "delivered" | "read" | "failed"
      profile_type: "self" | "child" | "dependent"
      report_source: "ai_generated" | "practitioner" | "patient_note"
      review_moderation_status: "published" | "under_review" | "rejected"
      sender_type: "patient" | "practitioner" | "system"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      appointment_type: ["in_person", "teleconsultation"],
      document_type: [
        "prescription",
        "lab_result",
        "imaging",
        "report",
        "certificate",
        "invoice",
        "other",
      ],
      facility_type: ["clinic", "hospital", "cabinet", "laboratory"],
      gender_type: ["male", "female", "other"],
      message_status: ["sending", "sent", "delivered", "read", "failed"],
      profile_type: ["self", "child", "dependent"],
      report_source: ["ai_generated", "practitioner", "patient_note"],
      review_moderation_status: ["published", "under_review", "rejected"],
      sender_type: ["patient", "practitioner", "system"],
    },
  },
} as const
