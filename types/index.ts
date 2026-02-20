export interface Brand {
  id: string;
  name: string;
  logo_url: string;
  domain: string;
  campaign_count: number;
  category_ids: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  category_id: string;
  brand_id: string;
  start_date: string;
  end_date: string;
  discount_rate: number | null;
  image_url: string;
  source_url: string;
  status: 'active' | 'expired' | 'hidden';
  created_at: string;
  updated_at: string;
  last_seen_at: string;
}

export type SortOption = 'newest' | 'ending_soon' | 'highest_discount' | 'popular';

export type FollowFilter = 'all' | 'following' | 'not_following';

export type StatusFilter = 'active' | 'ending_soon';

export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_yearly';

export interface UserSubscription {
  plan: SubscriptionPlan;
  expiresAt: string | null;
}

export type UserRole = 'user' | 'admin';

export interface CrawlRule {
  id: string;
  brand_id: string;
  url: string;
  selector_title: string;
  selector_discount: string;
  selector_image: string;
  selector_description: string;
  schedule: 'hourly' | 'daily' | 'weekly';
  is_active: boolean;
  last_crawled_at: string | null;
  created_at: string;
}
