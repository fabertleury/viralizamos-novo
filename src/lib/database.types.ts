export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          amount: number
          created_at: string
          external_order_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_status: string | null
          quantity: number | null
          service_id: string
          status: string
          target_username: string | null
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          external_order_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          quantity?: number | null
          service_id: string
          status: string
          target_username?: string | null
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          external_order_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          quantity?: number | null
          service_id?: string
          status?: string
          target_username?: string | null
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      refills: {
        Row: {
          created_at: string
          external_refill_id: string | null
          id: string
          metadata: Json | null
          order_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          external_refill_id?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          external_refill_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refills_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          name: string
          price: number
          quantidade: number
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          name: string
          price: number
          quantidade: number
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price?: number
          quantidade?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          metadata: Json | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          status: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          payment_method: string | null
          processed_at: string | null
          service_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          service_id: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          service_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string | null
          role?: string
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
