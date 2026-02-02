export type UserRole = 'customer' | 'owner' | 'local_hero' | 'admin';
export type ModerationStatus = 'pending' | 'approved' | 'flagged' | 'rejected';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionType = 'customer_subscription' | 'owner_subscription';
export type PlanTier = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete';
export type ConversionStatus = 'clicked' | 'converted' | 'cancelled' | 'refunded';
export type CommissionStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LocalHeroApplication {
  id: string;
  user_id: string;
  city_preference: string;
  motivation: string;
  experience: string | null;
  bank_details: Record<string, any> | null;
  status: ApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalHeroAssignment {
  id: string;
  user_id: string;
  city_name: string;
  assigned_at: string;
  assigned_by: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ModerationAction {
  id: string;
  local_hero_id: string;
  restaurant_id: string;
  action_type: 'edit' | 'approve' | 'flag' | 'reject' | 'create';
  changes_made: Record<string, any> | null;
  reason: string | null;
  created_at: string;
}

export interface BookingAffiliate {
  id: string;
  partner_name: string;
  affiliate_id: string | null;
  api_credentials: Record<string, any> | null;
  webhook_secret: string | null;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantBookingLink {
  id: string;
  restaurant_id: string;
  affiliate_partner: string;
  affiliate_restaurant_id: string;
  booking_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingConversion {
  id: string;
  click_id: string;
  restaurant_id: string;
  customer_id: string | null;
  local_hero_id: string | null;
  affiliate_partner: string;
  clicked_at: string;
  converted_at: string | null;
  conversion_value: number | null;
  booking_reference: string | null;
  status: ConversionStatus;
  created_at: string;
  updated_at: string;
}

export interface CommissionTracking {
  id: string;
  conversion_id: string;
  local_hero_id: string;
  restaurant_id: string;
  commission_amount: number;
  commission_percentage: number;
  status: CommissionStatus;
  created_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  payout_reference: string | null;
}

export interface LocalHeroEarnings {
  id: string;
  local_hero_id: string;
  month: number;
  year: number;
  total_clicks: number;
  total_conversions: number;
  total_commission: number;
  pending_amount: number;
  paid_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  subscription_type: SubscriptionType;
  plan_tier: PlanTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFeature {
  id: string;
  subscription_type: SubscriptionType;
  plan_tier: PlanTier;
  feature_key: string;
  feature_value: string;
  feature_limit: number | null;
  description: string | null;
  created_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  feature_key: string;
  current_usage: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}
