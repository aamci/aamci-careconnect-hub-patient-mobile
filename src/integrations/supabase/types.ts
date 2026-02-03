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
    PostgrestVersion: "14.1"
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
      sender_type: ["patient", "practitioner", "system"],
    },
  },
} as const
