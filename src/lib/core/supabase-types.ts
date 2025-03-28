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
      api_configurations: {
        Row: {
          context: string
          created_at: string | null
          description: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          name: string
          page_link: string | null
          rapid_api_host: string
          rapid_api_key: string
          type: string
          updated_at: string | null
        }
        Insert: {
          context: string
          created_at?: string | null
          description?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          name: string
          page_link?: string | null
          rapid_api_host: string
          rapid_api_key: string
          type: string
          updated_at?: string | null
        }
        Update: {
          context?: string
          created_at?: string | null
          description?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          name?: string
          page_link?: string | null
          rapid_api_host?: string
          rapid_api_key?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_order: {
        Row: {
          created_at: string | null
          current_requests: number | null
          enabled: boolean | null
          id: number
          max_requests: number | null
          name: string
          order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_requests?: number | null
          enabled?: boolean | null
          id?: number
          max_requests?: number | null
          name: string
          order: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_requests?: number | null
          enabled?: boolean | null
          id?: number
          max_requests?: number | null
          name?: string
          order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      all_logs: {
        Row: {
          created_at: string | null
          id: string | null
          level: string | null
          message: string | null
          metadata: Json | null
          order_id: string | null
          source: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      orders_with_safe_status: {
        Row: {
          amount: number | null
          created_at: string | null
          customer_id: string | null
          display_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      acquire_transaction_lock: {
        Args: {
          p_transaction_id: string
          p_locked_by: string
          p_lock_duration_seconds?: number
        }
        Returns: boolean
      }
      apply_coupon: {
        Args: {
          p_coupon_code: string
          p_customer_id: string
          p_service_id: string
          p_purchase_amount: number
        }
        Returns: number
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "canceled"
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "refunded"
        | "in_process"
      ticket_priority: "low" | "medium" | "high"
      ticket_status: "open" | "in_progress" | "closed"
      user_role: "admin" | "user" | "support" | "cliente"
      user_status: "active" | "inactive" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never 