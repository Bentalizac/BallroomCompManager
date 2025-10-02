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
      category_ruleset: {
        Row: {
          category_id: string
          id: string
          ruleset_id: string
        }
        Insert: {
          category_id: string
          id?: string
          ruleset_id: string
        }
        Update: {
          category_id?: string
          id?: string
          ruleset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cr_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cr_ruleset"
            columns: ["ruleset_id"]
            isOneToOne: false
            referencedRelation: "rulesets"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_info: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          start_date: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          start_date: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_info_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venue"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_participant: {
        Row: {
          comp_id: string | null
          created_at: string
          id: string
          participation_status: string
          role: Database["public"]["Enums"]["participant_role"]
          user_id: string | null
        }
        Insert: {
          comp_id?: string | null
          created_at?: string
          id?: string
          participation_status?: string
          role: Database["public"]["Enums"]["participant_role"]
          user_id?: string | null
        }
        Update: {
          comp_id?: string | null
          created_at?: string
          id?: string
          participation_status?: string
          role?: Database["public"]["Enums"]["participant_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comp_participant_comp_id_fkey"
            columns: ["comp_id"]
            isOneToOne: false
            referencedRelation: "comp_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comp_participant_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_admins: {
        Row: {
          comp_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          comp_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          comp_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_admins_comp_id_fkey"
            columns: ["comp_id"]
            isOneToOne: false
            referencedRelation: "comp_info"
            referencedColumns: ["id"]
          },
        ]
      }
      event_audit_log: {
        Row: {
          action: string
          created_at: string | null
          event_registration_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          event_registration_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          event_registration_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_audit_log_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registration"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      event_info: {
        Row: {
          category_ruleset_id: string
          comp_id: string
          end_date: string
          event_status: string
          id: string
          name: string
          start_date: string
        }
        Insert: {
          category_ruleset_id: string
          comp_id: string
          end_date: string
          event_status?: string
          id?: string
          name: string
          start_date: string
        }
        Update: {
          category_ruleset_id?: string
          comp_id?: string
          end_date?: string
          event_status?: string
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_info_comp_id_fkey"
            columns: ["comp_id"]
            isOneToOne: false
            referencedRelation: "comp_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_category_ruleset"
            columns: ["category_ruleset_id"]
            isOneToOne: false
            referencedRelation: "category_ruleset"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registration: {
        Row: {
          comp_participant_id: string
          event_info_id: string
          id: string
          partner_id: string | null
          registration_status: string
          role: Database["public"]["Enums"]["event_role"]
        }
        Insert: {
          comp_participant_id: string
          event_info_id: string
          id?: string
          partner_id?: string | null
          registration_status?: string
          role: Database["public"]["Enums"]["event_role"]
        }
        Update: {
          comp_participant_id?: string
          event_info_id?: string
          id?: string
          partner_id?: string | null
          registration_status?: string
          role?: Database["public"]["Enums"]["event_role"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_er_event"
            columns: ["event_info_id"]
            isOneToOne: false
            referencedRelation: "event_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_er_participant"
            columns: ["comp_participant_id"]
            isOneToOne: false
            referencedRelation: "comp_participant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_registration_partner"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "event_registration"
            referencedColumns: ["id"]
          },
        ]
      }
      event_results: {
        Row: {
          event_registration_id: string
          id: string
          rank: number | null
          score: number
          scoring_method_id: string
        }
        Insert: {
          event_registration_id: string
          id?: string
          rank?: number | null
          score: number
          scoring_method_id: string
        }
        Update: {
          event_registration_id?: string
          id?: string
          rank?: number | null
          score?: number
          scoring_method_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_results_event_registration"
            columns: ["event_registration_id"]
            isOneToOne: true
            referencedRelation: "event_registration"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_results_scoring"
            columns: ["scoring_method_id"]
            isOneToOne: false
            referencedRelation: "scoring_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      rulesets: {
        Row: {
          id: string
          name: string
          scoring_method_id: string
        }
        Insert: {
          id?: string
          name: string
          scoring_method_id: string
        }
        Update: {
          id?: string
          name?: string
          scoring_method_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ruleset_scoring"
            columns: ["scoring_method_id"]
            isOneToOne: false
            referencedRelation: "scoring_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_methods: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_info: {
        Row: {
          created_at: string
          email: string | null
          firstname: string | null
          id: string
          lastname: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          firstname?: string | null
          id: string
          lastname?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          firstname?: string | null
          id?: string
          lastname?: string | null
          role?: string
        }
        Relationships: []
      }
      venue: {
        Row: {
          city: string | null
          country: string | null
          google_maps_url: string | null
          id: string
          name: string
          postal_code: string | null
          state: string | null
          street: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          google_maps_url?: string | null
          id?: string
          name: string
          postal_code?: string | null
          state?: string | null
          street?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          google_maps_url?: string | null
          id?: string
          name?: string
          postal_code?: string | null
          state?: string | null
          street?: string | null
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
      event_role: "competitor" | "judge" | "scrutineer"
      participant_role: "spectator" | "competitor" | "organizer" | "judge"
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
      event_role: ["competitor", "judge", "scrutineer"],
      participant_role: ["spectator", "competitor", "organizer", "judge"],
    },
  },
} as const

