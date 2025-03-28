export interface APIConfig {
  id?: string;
  context: string;
  name: string;
  type: 'profile_info' | 'posts' | 'reels' | 'followers' | 'comments';
  endpoint: string;
  rapidApiKey: string;
  rapidApiHost: string;
  description?: string;
  pageLink?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type APIContext = 
  | 'homepage_profile_check'
  | 'profile_analysis'
  | 'checkout_likes_step1'
  | 'checkout_likes_step2'
  | 'checkout_followers_step1'
  | 'checkout_followers_step2'
  | 'checkout_views_step1'
  | 'checkout_views_step2'
  | 'checkout_comments_step1'
  | 'checkout_comments_step2';
