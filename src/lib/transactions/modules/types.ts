/**
 * Tipos e interfaces para o processamento de transações
 */

export interface Transaction {
  id: string;
  user_id: string;
  customer_id?: string;
  service_id: string;
  service?: any;
  status: string;
  payment_method?: string;
  payment_id?: string;
  payment_status?: string;
  payment_provider?: string;
  amount?: number;
  target_username?: string;
  target_link?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id?: string;
  url?: string;
  link?: string;
  media_url?: string;
  thumbnail_url?: string;
  type?: string;
  code?: string;
  postCode?: string;
  shortcode?: string;
  caption?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  views_count?: number;
  engagement_rate?: number;
  is_video?: boolean;
  video_url?: string;
  metadata?: any;
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

export interface OrderResponse {
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

export interface ProviderRequestData {
  service: string;
  link: string;
  quantity: number;
  transaction_id: string;
  target_username?: string;
  key?: string;
  action?: string;
  comments_text?: string;
  refill?: boolean;
  drip_feed?: boolean;
  runs?: number;
  interval?: number;
  username?: string;
  min?: number;
  max?: number;
  delay?: number;
  expiry?: string;
  posts?: Post[];
}

export interface CreateOrderParams {
  service: string;
  link: string;
  quantity: number;
  provider_id: string;
}

/**
 * Resultado do processamento de um pedido
 */
export interface ProcessOrderResult {
  success: boolean;
  data?: {
    order?: any;
    orders?: any[];
    response?: OrderResponse;
  };
  error?: string;
}

/**
 * Ordem criada no banco de dados
 */
export interface Order {
  id: string;
  transaction_id: string;
  user_id: string;
  customer_id?: string;
  service_id: string;
  external_order_id?: string | number;
  status: string;
  amount: number;
  quantity: number;
  target_username?: string;
  target_url?: string;
  payment_method?: string;
  payment_id?: string;
  needs_admin_attention?: boolean;
  error_message?: string;
  metadata?: any;
  created_at: string;
  updated_at?: string;
}
