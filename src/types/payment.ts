/**
 * Interfaces para lidar com pagamentos e transações
 */

export interface InstagramPost {
  id?: string;
  code?: string;
  shortcode?: string;
  url?: string;
  caption?: string;
  image_url?: string;
  thumbnail_url?: string;
  display_url?: string;
  is_reel?: boolean;
  like_count?: number;
  comment_count?: number;
  quantity?: number;
  metadata?: {
    quantity?: number;
    [key: string]: any;
  };
  postId?: string;
  postCode?: string;
  postLink?: string;
}

export interface PaymentProfile {
  username: string;
  full_name?: string;
  link?: string;
}

export interface PaymentCustomer {
  name?: string;
  email: string;
  phone?: string;
}

export interface PaymentService {
  id: string;
  name: string;
  price?: number;
  preco?: number;
  provider_id?: string;
}

export interface PaymentRequestData {
  service: PaymentService;
  profile: PaymentProfile;
  customer: PaymentCustomer;
  posts?: InstagramPost[];
  amount?: number;
}

export interface PaymentResponse {
  success: boolean;
  transaction_id?: string;
  payment_id?: string;
  qr_code?: string;
  qr_code_base64?: string;
  status?: string;
  message?: string;
  duplicate?: boolean;
  error?: string;
}

export interface DuplicatePaymentInfo {
  transaction_id: string;
  payment_id: string;
  status: string;
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

export interface Transaction {
  id: string;
  created_at: string;
  status: string;
  payment_method?: string;
  payment_id?: string;
  amount?: number;
  metadata?: TransactionMetadata;
  service?: {
    name: string;
    [key: string]: unknown;
  };
  orders?: Array<{
    id: string;
    status: string;
    external_order_id: string | null;
    created_at: string;
  }>;
}

/**
 * Resultado de uma operação de criação de pagamento PIX
 */
export interface PixPaymentResult {
  success: boolean;
  error?: string;
  transaction?: any;
  payment?: {
    id: string;
    qr_code: string;
    qr_code_base64: string;
  };
  duplicate?: boolean;
  existingPayment?: DuplicatePaymentInfo;
  reused?: boolean;
} 