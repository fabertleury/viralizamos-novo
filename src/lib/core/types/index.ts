/**
 * Tipos centrais do sistema de processamento de transações
 */

export interface Transaction {
  id: string;
  user_id: string;
  customer_id?: string;
  service_id: string;
  status: string;
  payment_method?: string;
  payment_id?: string;
  payment_status?: string;
  payment_provider?: string;
  amount?: number;
  target_username?: string;
  target_url?: string;
  metadata?: TransactionMetadata;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionMetadata {
  service?: ServiceMetadata;
  profile?: ProfileMetadata;
  customer?: CustomerMetadata;
  posts?: Post[];
  payment?: PaymentMetadata;
  [key: string]: any;
}

export interface ServiceMetadata {
  id: string;
  provider_id?: string;
  name: string;
  quantity?: number;
  type?: string;
  [key: string]: any;
}

export interface ProfileMetadata {
  username: string;
  full_name?: string;
  link?: string;
  [key: string]: any;
}

export interface CustomerMetadata {
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface PaymentMetadata {
  id?: string;
  provider?: string;
  method?: string;
  qr_code?: string;
  qr_code_base64?: string;
  [key: string]: any;
}

export interface Post {
  id?: string;
  url?: string;
  link?: string;
  code?: string;
  postCode?: string;
  shortcode?: string;
  caption?: string;
  username?: string;
  media_url?: string;
  thumbnail_url?: string;
  type?: string;
  timestamp?: string;
  metadata?: any;
}

export interface Order {
  id: string;
  transaction_id: string;
  user_id: string;
  customer_id?: string;
  service_id: string;
  external_order_id?: string | number;
  status: string;
  status_text?: string;
  amount: number;
  quantity: number;
  target_username?: string;
  target_url?: string;
  provider_id: string;
  provider_order_id?: string;
  payment_method?: string;
  payment_id?: string;
  needs_admin_attention?: boolean;
  error_message?: string;
  metadata?: OrderMetadata;
  created_at: string;
  updated_at?: string;
}

export interface OrderMetadata {
  provider?: string;
  requestData?: any;
  responseData?: any;
  post?: Post;
  [key: string]: any;
}

export interface Provider {
  id: string;
  name: string;
  api_url: string;
  api_key: string;
  status: string;
  default_delay?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderRequestData {
  service: string;
  link: string;
  quantity: number;
  transaction_id: string;
  target_username?: string;
  key?: string;
  action?: string;
  [key: string]: any;
}

export interface ProviderResponse {
  order: string | number | null;
  orderId?: string | number | null;
  status?: string;
  error?: string;
  remains?: number;
  start_count?: number;
  cost?: number;
  currency?: string;
  connection_error?: boolean;
  needs_retry?: boolean;
  [key: string]: any;
}

export interface ProcessResult {
  success: boolean;
  message?: string;
  error?: string;
  orders?: Order[];
  needsRetry?: boolean;
} 