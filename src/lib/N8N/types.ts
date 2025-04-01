/**
 * Tipos para integração com N8N
 */

/**
 * Representa um pedido para processamento no N8N
 */
export interface N8NOrder {
  order_id: string;
  transaction_id: string;
  service_id: string;
  provider_id: string;
  external_service_id: string;
  quantity: number;
  target_url?: string;
  target_username?: string;
  metadata?: Record<string, unknown>;
  webhook_timestamp?: string;
}

/**
 * Resposta de um pedido enviado ao N8N
 */
export interface N8NResponse {
  success: boolean;
  order_id?: string;
  external_order_id?: string;
  error?: string;
}

/**
 * Callback recebido do N8N
 */
export interface N8NCallback {
  order_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'cancelled';
  message?: string;
  external_order_id?: string;
  details?: Record<string, unknown>;
}

/**
 * Representa um post/reel para processamento
 */
export interface N8NPostItem {
  id: string;
  code: string;
  url: string;
  type: 'post' | 'reel';
  quantity: number;
  username: string;
  service_type: string;
  selected: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Status de um pedido no sistema
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

/**
 * Configuração da integração com N8N
 */
export interface N8NConfig {
  enabled: boolean;
  webhookUrl: string;
  testWebhookUrl: string;
  apiKey: string;
  callbackSecret: string;
} 