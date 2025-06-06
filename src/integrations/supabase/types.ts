export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      business_claims: {
        Row: {
          coming_soon_business_id: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string | null
          status: string
        }
        Insert: {
          coming_soon_business_id: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          status?: string
        }
        Update: {
          coming_soon_business_id?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_claims_coming_soon_business_id_fkey"
            columns: ["coming_soon_business_id"]
            isOneToOne: false
            referencedRelation: "coming_soon_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          business_type: string
          cover_image: string | null
          created_at: string | null
          description: string | null
          email: string
          id: string
          logo: string | null
          name: string
          phone: string | null
          qr_code: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          business_type: string
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          logo?: string | null
          name: string
          phone?: string | null
          qr_code?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          business_type?: string
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          logo?: string | null
          name?: string
          phone?: string | null
          qr_code?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cards: {
        Row: {
          barcode_type: string | null
          barcode_value: string | null
          created_at: string | null
          id: string
          image_url: string | null
          shop_name: string
          user_id: string | null
        }
        Insert: {
          barcode_type?: string | null
          barcode_value?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          shop_name: string
          user_id?: string | null
        }
        Update: {
          barcode_type?: string | null
          barcode_value?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          shop_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coming_soon_businesses: {
        Row: {
          business_name: string
          business_type: string
          created_at: string
          description: string | null
          id: string
          logo: string | null
        }
        Insert: {
          business_name: string
          business_type: string
          created_at?: string
          description?: string | null
          id?: string
          logo?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string
          created_at?: string
          description?: string | null
          id?: string
          logo?: string | null
        }
        Relationships: []
      }
      loyalty_offers: {
        Row: {
          business_id: string | null
          created_at: string
          eligibility_rules: Json | null
          id: string
          is_active: boolean
          offer_config: Json | null
          offer_name: string | null
          offer_rule: string | null
          offer_type: string | null
          points_earned: number
          points_per_euro: number | null
          reward_description: string
          reward_threshold: number
          scheduling: Json | null
          spend_amount: number
          time_from: string | null
          time_to: string | null
          updated_at: string
          usage_limits: Json | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          eligibility_rules?: Json | null
          id?: string
          is_active?: boolean
          offer_config?: Json | null
          offer_name?: string | null
          offer_rule?: string | null
          offer_type?: string | null
          points_earned: number
          points_per_euro?: number | null
          reward_description: string
          reward_threshold: number
          scheduling?: Json | null
          spend_amount: number
          time_from?: string | null
          time_to?: string | null
          updated_at?: string
          usage_limits?: Json | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          eligibility_rules?: Json | null
          id?: string
          is_active?: boolean
          offer_config?: Json | null
          offer_name?: string | null
          offer_rule?: string | null
          offer_type?: string | null
          points_earned?: number
          points_per_euro?: number | null
          reward_description?: string
          reward_threshold?: number
          scheduling?: Json | null
          spend_amount?: number
          time_from?: string | null
          time_to?: string | null
          updated_at?: string
          usage_limits?: Json | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_offers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          amount_spent: number
          business_id: string
          created_at: string
          customer_id: string
          id: string
          points_earned: number
          processed_by: string | null
          transaction_date: string
        }
        Insert: {
          amount_spent: number
          business_id: string
          created_at?: string
          customer_id: string
          id?: string
          points_earned: number
          processed_by?: string | null
          transaction_date?: string
        }
        Update: {
          amount_spent?: number
          business_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          points_earned?: number
          processed_by?: string | null
          transaction_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          business_type: string | null
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          trial_start_date: string | null
          user_role: string
        }
        Insert: {
          avatar?: string | null
          business_type?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          phone?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          trial_start_date?: string | null
          user_role: string
        }
        Update: {
          avatar?: string | null
          business_type?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          trial_start_date?: string | null
          user_role?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          business_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          points_required: number
          title: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          points_required: number
          title: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          points_required?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          business_id: string | null
          customer_id: string | null
          id: string
          total_points: number
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          customer_id?: string | null
          id?: string
          total_points?: number
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          customer_id?: string | null
          id?: string
          total_points?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_points_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
