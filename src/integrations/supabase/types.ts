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
      badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          icon_url: string | null
          id: string
          name_en: string
          name_hi: string | null
          points: number | null
          requirements: Json
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          icon_url?: string | null
          id?: string
          name_en: string
          name_hi?: string | null
          points?: number | null
          requirements: Json
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          icon_url?: string | null
          id?: string
          name_en?: string
          name_hi?: string | null
          points?: number | null
          requirements?: Json
        }
        Relationships: []
      }
      health_conditions: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          id: string
          keywords: string[] | null
          name_en: string
          name_hi: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          id?: string
          keywords?: string[] | null
          name_en: string
          name_hi?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          id?: string
          keywords?: string[] | null
          name_en?: string
          name_hi?: string | null
        }
        Relationships: []
      }
      plant_recommendations: {
        Row: {
          ai_response: string | null
          created_at: string | null
          health_condition_id: string | null
          id: string
          query_text: string
          recommended_plants: Json
          user_id: string | null
        }
        Insert: {
          ai_response?: string | null
          created_at?: string | null
          health_condition_id?: string | null
          id?: string
          query_text: string
          recommended_plants: Json
          user_id?: string | null
        }
        Update: {
          ai_response?: string | null
          created_at?: string | null
          health_condition_id?: string | null
          id?: string
          query_text?: string
          recommended_plants?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plant_recommendations_health_condition_id_fkey"
            columns: ["health_condition_id"]
            isOneToOne: false
            referencedRelation: "health_conditions"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          ayurvedic_properties: Json | null
          color: string | null
          created_at: string | null
          cultivation_en: string | null
          cultivation_hi: string | null
          description_en: string | null
          description_hi: string | null
          dosage_en: string | null
          dosage_hi: string | null
          glb_url: string | null
          habitat_en: string | null
          habitat_hi: string | null
          id: string
          image_url: string | null
          medicinal_parts_en: string[] | null
          medicinal_parts_hi: string[] | null
          name_en: string
          name_hi: string | null
          precautions_en: string | null
          precautions_hi: string | null
          preparation_methods_en: string[] | null
          preparation_methods_hi: string[] | null
          real_images: string[] | null
          research_references: string[] | null
          scientific_name: string | null
          updated_at: string | null
          uses_en: string[] | null
          uses_hi: string[] | null
          vr_position: Json | null
          vr_rotation: Json | null
          vr_scale: Json | null
        }
        Insert: {
          ayurvedic_properties?: Json | null
          color?: string | null
          created_at?: string | null
          cultivation_en?: string | null
          cultivation_hi?: string | null
          description_en?: string | null
          description_hi?: string | null
          dosage_en?: string | null
          dosage_hi?: string | null
          glb_url?: string | null
          habitat_en?: string | null
          habitat_hi?: string | null
          id: string
          image_url?: string | null
          medicinal_parts_en?: string[] | null
          medicinal_parts_hi?: string[] | null
          name_en: string
          name_hi?: string | null
          precautions_en?: string | null
          precautions_hi?: string | null
          preparation_methods_en?: string[] | null
          preparation_methods_hi?: string[] | null
          real_images?: string[] | null
          research_references?: string[] | null
          scientific_name?: string | null
          updated_at?: string | null
          uses_en?: string[] | null
          uses_hi?: string[] | null
          vr_position?: Json | null
          vr_rotation?: Json | null
          vr_scale?: Json | null
        }
        Update: {
          ayurvedic_properties?: Json | null
          color?: string | null
          created_at?: string | null
          cultivation_en?: string | null
          cultivation_hi?: string | null
          description_en?: string | null
          description_hi?: string | null
          dosage_en?: string | null
          dosage_hi?: string | null
          glb_url?: string | null
          habitat_en?: string | null
          habitat_hi?: string | null
          id?: string
          image_url?: string | null
          medicinal_parts_en?: string[] | null
          medicinal_parts_hi?: string[] | null
          name_en?: string
          name_hi?: string | null
          precautions_en?: string | null
          precautions_hi?: string | null
          preparation_methods_en?: string[] | null
          preparation_methods_hi?: string[] | null
          real_images?: string[] | null
          research_references?: string[] | null
          scientific_name?: string | null
          updated_at?: string | null
          uses_en?: string[] | null
          uses_hi?: string[] | null
          vr_position?: Json | null
          vr_rotation?: Json | null
          vr_scale?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          preferred_language: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          preferred_language?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          difficulty_level: number | null
          id: string
          is_active: boolean | null
          questions: Json
          quiz_type: Database["public"]["Enums"]["quiz_type"]
          title_en: string
          title_hi: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          questions: Json
          quiz_type: Database["public"]["Enums"]["quiz_type"]
          title_en: string
          title_hi?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          quiz_type?: Database["public"]["Enums"]["quiz_type"]
          title_en?: string
          title_hi?: string | null
        }
        Relationships: []
      }
      tour_stops: {
        Row: {
          content_en: string | null
          content_hi: string | null
          created_at: string | null
          id: string
          interactive_elements: Json | null
          learning_objectives: string[] | null
          plant_id: string
          stop_order: number
          title_en: string
          title_hi: string | null
          tour_id: string | null
        }
        Insert: {
          content_en?: string | null
          content_hi?: string | null
          created_at?: string | null
          id?: string
          interactive_elements?: Json | null
          learning_objectives?: string[] | null
          plant_id: string
          stop_order: number
          title_en: string
          title_hi?: string | null
          tour_id?: string | null
        }
        Update: {
          content_en?: string | null
          content_hi?: string | null
          created_at?: string | null
          id?: string
          interactive_elements?: Json | null
          learning_objectives?: string[] | null
          plant_id?: string
          stop_order?: number
          title_en?: string
          title_hi?: string | null
          tour_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_stops_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "virtual_tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_waypoints: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          id: string
          order_index: number
          plant_id: string | null
          position: Json
          rotation: Json | null
          title_en: string | null
          title_hi: string | null
          tour_id: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          id?: string
          order_index: number
          plant_id?: string | null
          position: Json
          rotation?: Json | null
          title_en?: string | null
          title_hi?: string | null
          tour_id?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          id?: string
          order_index?: number
          plant_id?: string | null
          position?: Json
          rotation?: Json | null
          title_en?: string | null
          title_hi?: string | null
          tour_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_waypoints_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_waypoints_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "virtual_tours"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          plant_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plant_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plant_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_likes: {
        Row: {
          created_at: string
          id: string
          plant_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          plant_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          plant_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_plant_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_private: boolean | null
          plant_id: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          plant_id: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          plant_id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_quiz_scores: {
        Row: {
          completed_at: string | null
          id: string
          quiz_id: string | null
          score: number
          time_taken: number | null
          total_questions: number
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          quiz_id?: string | null
          score: number
          time_taken?: number | null
          total_questions: number
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          quiz_id?: string | null
          score?: number
          time_taken?: number | null
          total_questions?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_scores_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_remedies: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          dosage: string | null
          effectiveness_rating: number | null
          id: string
          image_urls: string[] | null
          ingredients: Json | null
          is_approved: boolean | null
          is_public: boolean | null
          precautions: string | null
          preparation_method: string | null
          title_en: string
          title_hi: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          dosage?: string | null
          effectiveness_rating?: number | null
          id?: string
          image_urls?: string[] | null
          ingredients?: Json | null
          is_approved?: boolean | null
          is_public?: boolean | null
          precautions?: string | null
          preparation_method?: string | null
          title_en: string
          title_hi?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          dosage?: string | null
          effectiveness_rating?: number | null
          id?: string
          image_urls?: string[] | null
          ingredients?: Json | null
          is_approved?: boolean | null
          is_public?: boolean | null
          precautions?: string | null
          preparation_method?: string | null
          title_en?: string
          title_hi?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_tour_progress: {
        Row: {
          completed_at: string | null
          completed_stops: number[] | null
          current_stop: number | null
          id: string
          progress_percentage: number | null
          started_at: string | null
          tour_id: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_stops?: number[] | null
          current_stop?: number | null
          id?: string
          progress_percentage?: number | null
          started_at?: string | null
          tour_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_stops?: number[] | null
          current_stop?: number | null
          id?: string
          progress_percentage?: number | null
          started_at?: string | null
          tour_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tour_progress_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "virtual_tours"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_tours: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          difficulty_level: number | null
          environment_settings: Json | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          starting_position: Json | null
          theme: string
          title_en: string
          title_hi: string | null
          vr_enabled: boolean | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          difficulty_level?: number | null
          environment_settings?: Json | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          starting_position?: Json | null
          theme: string
          title_en: string
          title_hi?: string | null
          vr_enabled?: boolean | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          difficulty_level?: number | null
          environment_settings?: Json | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          starting_position?: Json | null
          theme?: string
          title_en?: string
          title_hi?: string | null
          vr_enabled?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      badge_type:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert"
        | "specialist"
      quiz_type:
        | "image_identification"
        | "name_matching"
        | "medicinal_uses"
        | "ayurvedic_properties"
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
      badge_type: [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
        "specialist",
      ],
      quiz_type: [
        "image_identification",
        "name_matching",
        "medicinal_uses",
        "ayurvedic_properties",
      ],
    },
  },
} as const
