/**
 * Tipos comuns para o sistema de pagamento
 */

/**
 * Interface para definir a forma de uma transação
 */
export interface TransactionType {
  id: string;
  status: string;
  payment_id?: string;
  order_created?: boolean;
  payment_method?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
  service_id?: string;
  provider_id?: string;
  post_id?: string;
  user_id?: string;
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  target_username?: string;
  target_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// Alias para compatibilidade com código existente
export type Transaction = TransactionType;

/**
 * Interface para representar o resultado de uma verificação de status de pagamento
 */
export interface PaymentStatusResult {
  status: string;
  statusDetail?: string;
  transaction_id?: string;
  transaction?: TransactionType;
  payment?: Record<string, unknown>;
  source?: 'cache' | 'mercadopago' | 'mercadopago_direct' | 'error_mercadopago_direct' | string;
  error?: string;
}

/**
 * Interface para representar o resultado do processamento de uma transação
 */
export interface TransactionProcessResult {
  status: 'processed' | 'skipped' | 'error' | string;
  reason?: string;
  payment_status?: string;
  result?: {
    status: 'created' | 'updated' | 'error' | string;
    order_id?: string;
    error?: string;
  };
  error?: string;
}

/**
 * Interface para representar o resultado da verificação de transações expirando
 */
export interface ExpirationCheckResult {
  status?: string;
  error?: string;
  message?: string;
  results?: Array<{
    transaction_id: string;
    status?: string;
    message?: string;
    [key: string]: unknown;
  }>;
}

/**
 * Interface para representar o resultado do cancelamento de transações expiradas
 */
export interface ExpiredCancellationResult {
  status?: string;
  error?: string;
  message?: string;
  cancelled_count?: number;
  results?: Array<{
    transaction_id: string;
    status: string;
    error?: string;
    message?: string;
  }>;
}

/**
 * Interface para representar o resultado da inicialização do verificador de pagamentos
 */
export interface PaymentCheckerStartResult {
  status: 'success' | 'already_initialized' | 'already_running' | 'error';
  checked: boolean;
  result?: Record<string, unknown>;
  error?: string;
}

/**
 * Interface para representar o resultado da verificação de pagamentos pendentes
 */
export interface PendingPaymentsCheckResult extends Record<string, unknown> {
  status: 'success' | 'error';
  processed?: number;
  error?: string;
}

/**
 * Tipos de status de pagamento possíveis
 */
export type PaymentStatus = 
  | 'pending'
  | 'approved'
  | 'processing'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'chargeback'
  | 'error'; 