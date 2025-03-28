export interface Order {
  id: string;
  status: string;
  quantity?: number;
  target_username?: string;
  provider_id?: string;
  external_order_id?: string;
  needs_admin_attention?: boolean;
  metadata?: {
    provider_id?: string;
    provider?: string;
    provider_name?: string;
    provider_error?: string;
    error_message?: string;
    post?: {
      url?: string;
      code?: string;
    };
    link?: string;
  };
} 