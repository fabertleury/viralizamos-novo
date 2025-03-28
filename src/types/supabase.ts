export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'support'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: UserRole
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: UserRole
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: UserRole
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          priority: string
          user_id: string
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: string
          priority?: string
          user_id: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          user_id?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          service_id: string
          status: string
          quantity: number
          amount: number
          target_username: string
          payment_status: string
          payment_method: string | null
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          status?: string
          quantity: number
          amount: number
          target_username: string
          payment_status?: string
          payment_method?: string | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string
          status?: string
          quantity?: number
          amount?: number
          target_username?: string
          payment_status?: string
          payment_method?: string | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          type: string
          quantidade: number
          preco: number
          descricao: string
          categoria: string
          status: 'active' | 'inactive' | 'maintenance'
          delivery_time: number
          min_order: number
          max_order: number
          provider_id: string
          success_rate: number
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          quantidade: number
          preco: number
          descricao: string
          categoria: string
          status?: 'active' | 'inactive' | 'maintenance'
          delivery_time: number
          min_order: number
          max_order: number
          provider_id: string
          success_rate: number
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          quantidade?: number
          preco?: number
          descricao?: string
          categoria?: string
          status?: 'active' | 'inactive' | 'maintenance'
          delivery_time?: number
          min_order?: number
          max_order?: number
          provider_id?: string
          success_rate?: number
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
      }
    }
  }
}
