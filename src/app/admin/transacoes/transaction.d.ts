import { Order } from './orders';

export interface Transaction {
  id: string;
  created_at?: string;
  status: string | null;
  amount?: number;
  payment_method?: string;
  payment_id?: string;
  delivered?: boolean;
  delivered_at?: string;
  order_created?: boolean;
  service_id?: string;
  customer_name?: string;
  customer_email?: string;
  metadata?: {
    customer?: {
      name?: string;
    };
    contact?: {
      email?: string;
    };
    payment?: {
      id?: string;
    };
    posts?: unknown[];
    service?: {
      type?: string;
      name?: string;
    };
  };
  service?: {
    name?: string;
    price?: number;
    provider_id?: string;
  };
  orders?: Order[];
} 