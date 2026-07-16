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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["admin_department"]
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: Database["public"]["Enums"]["admin_department"]
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["admin_department"]
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft_types: {
        Row: {
          created_at: string
          type: string
          type_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          type: string
          type_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          type?: string
          type_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      aircraft_weight_balance_configs: {
        Row: {
          aircraft_id: string
          arm: number
          basic_empty_weight: number
          created_at: string
          id: string
          moment: number
          updated_at: string
        }
        Insert: {
          aircraft_id: string
          arm: number
          basic_empty_weight: number
          created_at?: string
          id?: string
          moment: number
          updated_at?: string
        }
        Update: {
          aircraft_id?: string
          arm?: number
          basic_empty_weight?: number
          created_at?: string
          id?: string
          moment?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_weight_balance_configs_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: true
            referencedRelation: "aircrafts"
            referencedColumns: ["id"]
          },
        ]
      }
      aircrafts: {
        Row: {
          aircraft_identification: string
          aircraft_type: string
          color_markings: string
          created_at: string
          id: string
          model: string
          photo_content_type: string | null
          photo_path: string | null
          photo_size_bytes: number | null
          photo_uploaded_at: string | null
          registration: string
          remarks: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["aircraft_status"]
          updated_at: string
        }
        Insert: {
          aircraft_identification: string
          aircraft_type: string
          color_markings: string
          created_at?: string
          id?: string
          model: string
          photo_content_type?: string | null
          photo_path?: string | null
          photo_size_bytes?: number | null
          photo_uploaded_at?: string | null
          registration: string
          remarks?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["aircraft_status"]
          updated_at?: string
        }
        Update: {
          aircraft_identification?: string
          aircraft_type?: string
          color_markings?: string
          created_at?: string
          id?: string
          model?: string
          photo_content_type?: string | null
          photo_path?: string | null
          photo_size_bytes?: number | null
          photo_uploaded_at?: string | null
          registration?: string
          remarks?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["aircraft_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircrafts_aircraft_type_fkey"
            columns: ["aircraft_type"]
            isOneToOne: false
            referencedRelation: "aircraft_types"
            referencedColumns: ["type_key"]
          },
        ]
      }
      instructor_profiles: {
        Row: {
          created_at: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          license_number: string | null
          license_type: string | null
          profile_photo_content_type: string | null
          profile_photo_path: string | null
          profile_photo_size_bytes: number | null
          profile_photo_uploaded_at: string | null
          rating: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          license_number?: string | null
          license_type?: string | null
          profile_photo_content_type?: string | null
          profile_photo_path?: string | null
          profile_photo_size_bytes?: number | null
          profile_photo_uploaded_at?: string | null
          rating?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          license_number?: string | null
          license_type?: string | null
          profile_photo_content_type?: string | null
          profile_photo_path?: string | null
          profile_photo_size_bytes?: number | null
          profile_photo_uploaded_at?: string | null
          rating?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id_document_content_type: string | null
          id_document_path: string | null
          id_document_size_bytes: number | null
          id_document_uploaded_at: string | null
          profile_id: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          student_id_number: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id_document_content_type?: string | null
          id_document_path?: string | null
          id_document_size_bytes?: number | null
          id_document_uploaded_at?: string | null
          profile_id: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          student_id_number?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id_document_content_type?: string | null
          id_document_path?: string | null
          id_document_size_bytes?: number | null
          id_document_uploaded_at?: string | null
          profile_id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          student_id_number?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_profiles_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_department:
        | "flight_operations_personnel"
        | "air_traffic_controller"
        | "safety_personnel"
      aircraft_status: "active" | "maintenance" | "grounded" | "retired"
      app_role: "student" | "instructor" | "admin" | "superadmin"
      approval_status: "pending" | "approved" | "rejected"
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
      admin_department: [
        "flight_operations_personnel",
        "air_traffic_controller",
        "safety_personnel",
      ],
      aircraft_status: ["active", "maintenance", "grounded", "retired"],
      app_role: ["student", "instructor", "admin", "superadmin"],
      approval_status: ["pending", "approved", "rejected"],
    },
  },
} as const
