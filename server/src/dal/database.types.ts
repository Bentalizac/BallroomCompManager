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
          slug: string
          start_date: string
          time_zone: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          slug?: string
          start_date: string
          time_zone?: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          slug?: string
          start_date?: string
          time_zone?: string
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
          role: string
        }
        Insert: {
          comp_participant_id: string
          event_info_id: string
          id?: string
          partner_id?: string | null
          registration_status?: string
          role: string
        }
        Update: {
          comp_participant_id?: string
          event_info_id?: string
          id?: string
          partner_id?: string | null
          registration_status?: string
          role?: string
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
            isOneToOne: false
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
        Relationships: [
          {
            foreignKeyName: "user_info_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      participant_role: "spectator" | "competitor" | "organizer" | "judge"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (Database["public"]["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicEnumNameOrOptions["schema"]]["Enums"])[EnumName]
  : PublicEnumNameOrOptions extends keyof (Database["public"]["Enums"])
    ? (Database["public"]["Enums"])[PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof (Database["public"]["CompositeTypes"])
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"])
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"])[CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof (Database["public"]["CompositeTypes"])
    ? (Database["public"]["CompositeTypes"])[PublicCompositeTypeNameOrOptions]
    : never