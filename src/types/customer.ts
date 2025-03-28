export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  instagram_username?: string;
  metadata?: {
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface CustomerData {
  email: string;
  name?: string;
  phone?: string;
  instagram_username?: string;
  metadata?: {
    [key: string]: any;
  };
}
