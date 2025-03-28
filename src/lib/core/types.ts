/**
 * Tipo para posts de transações
 */
export interface Post {
  id: string;
  code?: string;
  url?: string;
  link?: string;
  caption?: string;
  type?: string;
  username?: string;
  quantity?: number;
}

/**
 * Tipo para transações
 */
export interface Transaction {
  id: string;
  service_id: string;
  payment_id?: string;
  status: string;
  target_username: string;
  is_processed: boolean;
  processing_attempts: number;
  created_at: string;
  updated_at?: string;
  metadata?: {
    posts?: Post[];
    service?: {
      id: string;
      name: string;
      type: string;
    };
    [key: string]: any;
  };
}

/**
 * Resultado do processamento de transações
 */
export interface ProcessResult {
  success: boolean;
  message?: string;
  error?: string;
  needsRetry: boolean;
  details?: any; // Resultado detalhado do processamento
}

export interface TransactionMetadata {
  service: {
    id: string;
    provider_id: string | null;
    name: string;
  };
  profile: {
    username: string;
    full_name: string;
    link: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  posts: Array<{
    id: string;
    code?: string;
    url?: string;
    caption?: string;
    username: string;
  }>;
  payment: {
    id: string;
    provider: string;
    method: string;
    qr_code: string;
    qr_code_base64: string;
  };
}

export interface PixPaymentResult {
  success: boolean;
  transaction?: Transaction;
  payment?: {
    id: string;
    qr_code: string;
    qr_code_base64: string;
  };
  reused?: boolean;
  error?: string;
  duplicate?: boolean;
  existingPayment?: {
    transaction_id: string;
    payment_id: string;
    status: string;
  };
} 