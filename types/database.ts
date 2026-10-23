export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      metrics: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      submetric_entries: {
        Row: {
          created_at: string
          id: string
          note: string | null
          recorded_at: string
          submetric_id: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          recorded_at?: string
          submetric_id: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          recorded_at?: string
          submetric_id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "submetric_entries_submetric_id_fkey"
            columns: ["submetric_id"]
            isOneToOne: false
            referencedRelation: "submetrics"
            referencedColumns: ["id"]
          },
        ]
      }
      submetrics: {
        Row: {
          aggregation_type: Database["public"]["Enums"]["aggregation_type"]
          created_at: string
          id: string
          metric_id: string
          name: string
          sort_order: number
          target_value: number
          tracking_period: Database["public"]["Enums"]["tracking_period"]
          unit_label: string | null
          unit_type: Database["public"]["Enums"]["unit_type"]
          updated_at: string
          weight: number
        }
        Insert: {
          aggregation_type?: Database["public"]["Enums"]["aggregation_type"]
          created_at?: string
          id?: string
          metric_id: string
          name: string
          sort_order?: number
          target_value?: number
          tracking_period?: Database["public"]["Enums"]["tracking_period"]
          unit_label?: string | null
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
          weight?: number
        }
        Update: {
          aggregation_type?: Database["public"]["Enums"]["aggregation_type"]
          created_at?: string
          id?: string
          metric_id?: string
          name?: string
          sort_order?: number
          target_value?: number
          tracking_period?: Database["public"]["Enums"]["tracking_period"]
          unit_label?: string | null
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "submetrics_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      target_recommendations: {
        Row: {
          confidence: Database["public"]["Enums"]["recommendation_confidence"]
          created_at: string
          formula_id: string
          id: string
          reasoning: string
          recommended_target: number
          status: Database["public"]["Enums"]["recommendation_status"]
          submetric_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: Database["public"]["Enums"]["recommendation_confidence"]
          created_at?: string
          formula_id: string
          id?: string
          reasoning: string
          recommended_target: number
          status?: Database["public"]["Enums"]["recommendation_status"]
          submetric_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: Database["public"]["Enums"]["recommendation_confidence"]
          created_at?: string
          formula_id?: string
          id?: string
          reasoning?: string
          recommended_target?: number
          status?: Database["public"]["Enums"]["recommendation_status"]
          submetric_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "target_recommendations_submetric_id_fkey"
            columns: ["submetric_id"]
            isOneToOne: false
            referencedRelation: "submetrics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_level"] | null
          body_fat_percentage: number | null
          created_at: string
          currency: string
          date_of_birth: string | null
          employer_match_percent: number | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          first_name: string | null
          fitness_goal: Database["public"]["Enums"]["fitness_goal"] | null
          has_employer_match: boolean
          height_cm: number | null
          hide_calorie_recs: boolean
          id: string
          last_name: string | null
          monthly_expenses: number | null
          monthly_income: number | null
          sex: Database["public"]["Enums"]["sex"] | null
          special_conditions: string[]
          total_debt: number | null
          unit_system: Database["public"]["Enums"]["unit_system"]
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          body_fat_percentage?: number | null
          created_at?: string
          currency?: string
          date_of_birth?: string | null
          employer_match_percent?: number | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name?: string | null
          fitness_goal?: Database["public"]["Enums"]["fitness_goal"] | null
          has_employer_match?: boolean
          height_cm?: number | null
          hide_calorie_recs?: boolean
          id?: string
          last_name?: string | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          sex?: Database["public"]["Enums"]["sex"] | null
          special_conditions?: string[]
          total_debt?: number | null
          unit_system?: Database["public"]["Enums"]["unit_system"]
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          body_fat_percentage?: number | null
          created_at?: string
          currency?: string
          date_of_birth?: string | null
          employer_match_percent?: number | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name?: string | null
          fitness_goal?: Database["public"]["Enums"]["fitness_goal"] | null
          has_employer_match?: boolean
          height_cm?: number | null
          hide_calorie_recs?: boolean
          id?: string
          last_name?: string | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          sex?: Database["public"]["Enums"]["sex"] | null
          special_conditions?: string[]
          total_debt?: number | null
          unit_system?: Database["public"]["Enums"]["unit_system"]
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_recommendation: {
        Args: { p_recommendation_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      activity_level:
        | "sedentary"
        | "lightly_active"
        | "moderately_active"
        | "very_active"
        | "extra_active"
      aggregation_type: "sum" | "latest"
      employment_type:
        | "full_time"
        | "part_time"
        | "freelance"
        | "self_employed"
        | "unemployed"
      fitness_goal: "lose_fat" | "maintain" | "build_muscle"
      recommendation_confidence: "high" | "medium" | "low"
      recommendation_status: "pending" | "accepted" | "dismissed" | "expired"
      sex: "male" | "female" | "other"
      tracking_period: "daily" | "weekly" | "monthly"
      unit_system: "metric" | "imperial"
      unit_type: "number" | "boolean" | "time" | "currency" | "percentage"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_level: [
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "extra_active",
      ],
      aggregation_type: ["sum", "latest"],
      employment_type: [
        "full_time",
        "part_time",
        "freelance",
        "self_employed",
        "unemployed",
      ],
      fitness_goal: ["lose_fat", "maintain", "build_muscle"],
      recommendation_confidence: ["high", "medium", "low"],
      recommendation_status: ["pending", "accepted", "dismissed", "expired"],
      sex: ["male", "female", "other"],
      tracking_period: ["daily", "weekly", "monthly"],
      unit_system: ["metric", "imperial"],
      unit_type: ["number", "boolean", "time", "currency", "percentage"],
    },
  },
} as const

