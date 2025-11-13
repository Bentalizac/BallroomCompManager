export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      category_ruleset: {
        Row: {
          category_id: string;
          id: string;
          ruleset_id: string;
        };
        Insert: {
          category_id: string;
          id?: string;
          ruleset_id: string;
        };
        Update: {
          category_id?: string;
          id?: string;
          ruleset_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_cr_ruleset";
            columns: ["ruleset_id"];
            isOneToOne: false;
            referencedRelation: "rulesets";
            referencedColumns: ["id"];
          },
        ];
      };
      comp_info: {
        Row: {
          created_at: string;
          end_date: string;
          id: string;
          name: string;
          slug: string;
          start_date: string;
          time_zone: string;
          venue_id: string | null;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          id?: string;
          name: string;
          slug: string;
          start_date: string;
          time_zone?: string;
          venue_id?: string | null;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          id?: string;
          name?: string;
          slug?: string;
          start_date?: string;
          time_zone?: string;
          venue_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comp_info_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venue";
            referencedColumns: ["id"];
          },
        ];
      };
      comp_participant: {
        Row: {
          comp_id: string | null;
          created_at: string;
          id: string;
          participation_status: string;
          role: Database["public"]["Enums"]["participant_role"];
          user_id: string | null;
        };
        Insert: {
          comp_id?: string | null;
          created_at?: string;
          id?: string;
          participation_status?: string;
          role: Database["public"]["Enums"]["participant_role"];
          user_id?: string | null;
        };
        Update: {
          comp_id?: string | null;
          created_at?: string;
          id?: string;
          participation_status?: string;
          role?: Database["public"]["Enums"]["participant_role"];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comp_participant_comp_id_fkey";
            columns: ["comp_id"];
            isOneToOne: false;
            referencedRelation: "comp_info";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comp_participant_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_info";
            referencedColumns: ["id"];
          },
        ];
      };
      competition_admins: {
        Row: {
          comp_id: string | null;
          created_at: string | null;
          id: string;
          user_id: string | null;
        };
        Insert: {
          comp_id?: string | null;
          created_at?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Update: {
          comp_id?: string | null;
          created_at?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "competition_admins_comp_id_fkey";
            columns: ["comp_id"];
            isOneToOne: false;
            referencedRelation: "comp_info";
            referencedColumns: ["id"];
          },
        ];
      };
      dance_styles: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      event_audit_log: {
        Row: {
          action: string;
          created_at: string | null;
          event_registration_id: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          event_registration_id?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          event_registration_id?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_audit_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_info";
            referencedColumns: ["id"];
          },
        ];
      };
      event_categories: {
        Row: {
          dance_style: string;
          event_level: string | null;
          id: string;
        };
        Insert: {
          dance_style?: string;
          event_level?: string | null;
          id?: string;
        };
        Update: {
          dance_style?: string;
          event_level?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_categories_dance_style_fkey";
            columns: ["dance_style"];
            isOneToOne: false;
            referencedRelation: "dance_styles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_categories_event_level_fkey";
            columns: ["event_level"];
            isOneToOne: false;
            referencedRelation: "event_levels";
            referencedColumns: ["id"];
          },
        ];
      };
      event_info: {
        Row: {
          category_ruleset_id: string;
          comp_id: string;
          end_at: string | null;
          end_date: string | null;
          entry_type: Database["public"]["Enums"]["entry_type"] | null;
          event_status: string;
          id: string;
          name: string;
          start_at: string | null;
          start_date: string | null;
        };
        Insert: {
          category_ruleset_id: string;
          comp_id: string;
          end_at?: string | null;
          end_date?: string | null;
          entry_type?: Database["public"]["Enums"]["entry_type"] | null;
          event_status?: string;
          id?: string;
          name: string;
          start_at?: string | null;
          start_date?: string | null;
        };
        Update: {
          category_ruleset_id?: string;
          comp_id?: string;
          end_at?: string | null;
          end_date?: string | null;
          entry_type?: Database["public"]["Enums"]["entry_type"] | null;
          event_status?: string;
          id?: string;
          name?: string;
          start_at?: string | null;
          start_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_info_comp_id_fkey";
            columns: ["comp_id"];
            isOneToOne: false;
            referencedRelation: "comp_info";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_event_category_ruleset";
            columns: ["category_ruleset_id"];
            isOneToOne: false;
            referencedRelation: "category_ruleset";
            referencedColumns: ["id"];
          },
        ];
      };
      event_levels: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      event_registration_participants: {
        Row: {
          registration_id: string;
          role: string | null;
          user_id: string;
        };
        Insert: {
          registration_id: string;
          role?: string | null;
          user_id: string;
        };
        Update: {
          registration_id?: string;
          role?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_registration_participants_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: false;
            referencedRelation: "event_registrations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_registration_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_info";
            referencedColumns: ["id"];
          },
        ];
      };
      event_registrations: {
        Row: {
          created_at: string | null;
          event_id: string;
          id: string;
          status: string | null;
          team_name: string | null;
        };
        Insert: {
          created_at?: string | null;
          event_id: string;
          id?: string;
          status?: string | null;
          team_name?: string | null;
        };
        Update: {
          created_at?: string | null;
          event_id?: string;
          id?: string;
          status?: string | null;
          team_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "event_info";
            referencedColumns: ["id"];
          },
        ];
      };
      event_results: {
        Row: {
          event_registration_id: string;
          id: string;
          rank: number | null;
          score: number;
          scoring_method_id: string;
        };
        Insert: {
          event_registration_id: string;
          id?: string;
          rank?: number | null;
          score: number;
          scoring_method_id: string;
        };
        Update: {
          event_registration_id?: string;
          id?: string;
          rank?: number | null;
          score?: number;
          scoring_method_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_results_scoring";
            columns: ["scoring_method_id"];
            isOneToOne: false;
            referencedRelation: "scoring_methods";
            referencedColumns: ["id"];
          },
        ];
      };
      rulesets: {
        Row: {
          id: string;
          name: string;
          scoring_method_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          scoring_method_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          scoring_method_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_ruleset_scoring";
            columns: ["scoring_method_id"];
            isOneToOne: false;
            referencedRelation: "scoring_methods";
            referencedColumns: ["id"];
          },
        ];
      };
      scoring_methods: {
        Row: {
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      user_info: {
        Row: {
          created_at: string;
          created_by: string | null;
          email: string | null;
          firstname: string | null;
          id: string;
          is_stub: boolean | null;
          lastname: string | null;
          ndca_number: string | null;
          role: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          firstname?: string | null;
          id: string;
          is_stub?: boolean | null;
          lastname?: string | null;
          ndca_number?: string | null;
          role?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          firstname?: string | null;
          id?: string;
          is_stub?: boolean | null;
          lastname?: string | null;
          ndca_number?: string | null;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_info_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_info";
            referencedColumns: ["id"];
          },
        ];
      };
      venue: {
        Row: {
          city: string | null;
          country: string | null;
          google_maps_url: string | null;
          id: string;
          name: string;
          postal_code: string | null;
          state: string | null;
          street: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          google_maps_url?: string | null;
          id?: string;
          name: string;
          postal_code?: string | null;
          state?: string | null;
          street?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          google_maps_url?: string | null;
          id?: string;
          name?: string;
          postal_code?: string | null;
          state?: string | null;
          street?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      debug_auth_context: { Args: never; Returns: Json };
      generate_competition_slug: {
        Args: { competition_name: string; created_at: string };
        Returns: string;
      };
    };
    Enums: {
      entry_type: "solo" | "partner" | "team";
      event_role: "competitor" | "judge" | "scrutineer";
      participant_role: "spectator" | "competitor" | "organizer" | "judge";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      entry_type: ["solo", "partner", "team"],
      event_role: ["competitor", "judge", "scrutineer"],
      participant_role: ["spectator", "competitor", "organizer", "judge"],
    },
  },
} as const;
