export interface ProfileData {
  username: string;
  full_name: string;
  profile_pic_url: string;
  follower_count: number;
  following_count: number;
  is_private: boolean;
}

export interface Service {
  id: string;
  name: string;
  preco: number;
  quantidade: number;
  metadata?: {
    service_details?: {
      global_reach?: boolean;
      fast_delivery?: boolean;
      guaranteed_security?: boolean;
      [key: string]: any;
    };
  };
  service_details?: {
    icon: string;
    title: string;
  }[];
  checkout?: {
    slug: string;
  };
}

export interface Post {
  id: string;
  code: string;
  shortcode: string;
  image_url: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  thumbnail_url?: string;
  display_url?: string;
  image_versions?: any;
}

export interface InstagramPost extends Post {}

export interface PaymentData {
  qrCodeText: string;
  paymentId: string;
  amount: number;
  qrCodeBase64?: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
}
