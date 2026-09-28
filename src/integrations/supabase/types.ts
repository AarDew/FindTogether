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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cases: {
        Row: {
          age: number
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          description: string | null
          distinguishing_features: string | null
          gender: string
          id: string
          last_seen_date: string
          last_seen_location: string
          name: string
          photo_url: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age: number
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          description?: string | null
          distinguishing_features?: string | null
          gender: string
          id?: string
          last_seen_date: string
          last_seen_location: string
          name: string
          photo_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          description?: string | null
          distinguishing_features?: string | null
          gender?: string
          id?: string
          last_seen_date?: string
          last_seen_location?: string
          name?: string
          photo_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      face_embeddings: {
        Row: {
          case_id: string
          created_at: string
          embedding: Json
          id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          embedding: Json
          id?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          embedding?: Json
          id?: string
        }
        Relationships: []
      }
      footage_uploads: {
        Row: {
          case_id: string
          error_message: string | null
          id: string
          processed_at: string | null
          status: string
          uploaded_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          case_id: string
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          uploaded_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          case_id?: string
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          uploaded_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "footage_uploads_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          admin_comment: string | null
          case_id: string
          confidence: number
          frame_timestamp: number
          id: string
          processed_at: string
          status: string | null
        }
        Insert: {
          admin_comment?: string | null
          case_id: string
          confidence: number
          frame_timestamp: number
          id?: string
          processed_at?: string
          status?: string | null
        }
        Update: {
          admin_comment?: string | null
          case_id?: string
          confidence?: number
          frame_timestamp?: number
          id?: string
          processed_at?: string
          status?: string | null
        }
        Relationships: []
      }
      reid_matches: {
        Row: {
          admin_comment: string | null
          admin_verified: boolean | null
          bbox: Json | null
          created_at: string
          cropped_image_url: string | null
          frame_number: number
          id: string
          rank: number | null
          result_id: string
          similarity: number
          timestamp_seconds: number
        }
        Insert: {
          admin_comment?: string | null
          admin_verified?: boolean | null
          bbox?: Json | null
          created_at?: string
          cropped_image_url?: string | null
          frame_number: number
          id?: string
          rank?: number | null
          result_id: string
          similarity: number
          timestamp_seconds: number
        }
        Update: {
          admin_comment?: string | null
          admin_verified?: boolean | null
          bbox?: Json | null
          created_at?: string
          cropped_image_url?: string | null
          frame_number?: number
          id?: string
          rank?: number | null
          result_id?: string
          similarity?: number
          timestamp_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "reid_matches_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "reid_results"
            referencedColumns: ["id"]
          },
        ]
      }
      reid_results: {
        Row: {
          case_id: string
          created_at: string
          error_message: string | null
          footage_id: string | null
          id: string
          processing_time_seconds: number | null
          reference_photo_url: string
          status: string | null
          threshold: number | null
          total_frames_processed: number | null
          total_persons_detected: number | null
          updated_at: string
          video_url: string
        }
        Insert: {
          case_id: string
          created_at?: string
          error_message?: string | null
          footage_id?: string | null
          id?: string
          processing_time_seconds?: number | null
          reference_photo_url: string
          status?: string | null
          threshold?: number | null
          total_frames_processed?: number | null
          total_persons_detected?: number | null
          updated_at?: string
          video_url: string
        }
        Update: {
          case_id?: string
          created_at?: string
          error_message?: string | null
          footage_id?: string | null
          id?: string
          processing_time_seconds?: number | null
          reference_photo_url?: string
          status?: string | null
          threshold?: number | null
          total_frames_processed?: number | null
          total_persons_detected?: number | null
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "reid_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reid_results_footage_id_fkey"
            columns: ["footage_id"]
            isOneToOne: false
            referencedRelation: "footage_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      sightings: {
        Row: {
          additional_notes: string | null
          confidence_level: string | null
          created_at: string
          description: string
          id: string
          missing_person_name: string | null
          photo_url: string | null
          reporter_email: string | null
          reporter_name: string
          reporter_phone: string
          sighting_date: string
          sighting_location: string
          sighting_time: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          confidence_level?: string | null
          created_at?: string
          description: string
          id?: string
          missing_person_name?: string | null
          photo_url?: string | null
          reporter_email?: string | null
          reporter_name: string
          reporter_phone: string
          sighting_date: string
          sighting_location: string
          sighting_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          confidence_level?: string | null
          created_at?: string
          description?: string
          id?: string
          missing_person_name?: string | null
          photo_url?: string | null
          reporter_email?: string | null
          reporter_name?: string
          reporter_phone?: string
          sighting_date?: string
          sighting_location?: string
          sighting_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
