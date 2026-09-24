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
      household_preferences: {
        Row: {
          budget: Database["public"]["Enums"]["budget_preference"]
          cooking_confidence: Database["public"]["Enums"]["cooking_confidence"]
          created_at: string
          cuisines: string[]
          dietary_restrictions: string[]
          dislikes: string[]
          household_id: string
          leftovers: Database["public"]["Enums"]["leftover_preference"]
          max_cook_minutes: number
          updated_at: string
        }
        Insert: {
          budget?: Database["public"]["Enums"]["budget_preference"]
          cooking_confidence?: Database["public"]["Enums"]["cooking_confidence"]
          created_at?: string
          cuisines?: string[]
          dietary_restrictions?: string[]
          dislikes?: string[]
          household_id: string
          leftovers?: Database["public"]["Enums"]["leftover_preference"]
          max_cook_minutes?: number
          updated_at?: string
        }
        Update: {
          budget?: Database["public"]["Enums"]["budget_preference"]
          cooking_confidence?: Database["public"]["Enums"]["cooking_confidence"]
          created_at?: string
          cuisines?: string[]
          dietary_restrictions?: string[]
          dislikes?: string[]
          household_id?: string
          leftovers?: Database["public"]["Enums"]["leftover_preference"]
          max_cook_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_preferences_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: true
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          dinners_per_week: number
          id: string
          owner_id: string
          size: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dinners_per_week?: number
          id?: string
          owner_id: string
          size?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dinners_per_week?: number
          id?: string
          owner_id?: string
          size?: number
          updated_at?: string
        }
        Relationships: []
      }
      pantry_items: {
        Row: {
          created_at: string
          household_id: string
          id: string
          is_staple: boolean
          name: string
          quantity_note: string | null
          state: Database["public"]["Enums"]["pantry_state"]
          updated_at: string
          use_soon: boolean
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          is_staple?: boolean
          name: string
          quantity_note?: string | null
          state?: Database["public"]["Enums"]["pantry_state"]
          updated_at?: string
          use_soon?: boolean
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          is_staple?: boolean
          name?: string
          quantity_note?: string | null
          state?: Database["public"]["Enums"]["pantry_state"]
          updated_at?: string
          use_soon?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pantry_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          onboarded_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          onboarded_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded_at?: string | null
          updated_at?: string
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
      budget_preference: "thrifty" | "balanced" | "flexible"
      cooking_confidence: "beginner" | "comfortable" | "confident"
      leftover_preference: "love" | "sometimes" | "avoid"
      pantry_state: "have" | "low" | "out" | "unsure"
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
      budget_preference: ["thrifty", "balanced", "flexible"],
      cooking_confidence: ["beginner", "comfortable", "confident"],
      leftover_preference: ["love", "sometimes", "avoid"],
      pantry_state: ["have", "low", "out", "unsure"],
    },
  },
} as const

