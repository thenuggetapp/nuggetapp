/*
  # Restaurant Owner Platform - Core Tables
  
  ## Overview
  This migration creates the foundational tables for the restaurant owner dashboard,
  enabling multi-restaurant management, subscriptions, coupons, and analytics.
  
  ## New Tables Created
  
  ### 1. Restaurant Ownership & Roles
  - Adds `role` column to `user_profiles` (customer, owner, admin)
  - Creates `restaurant_ownership` junction table for many-to-many restaurant-owner relationships
  - Tracks ownership permissions and verification status
  
  ### 2. Subscriptions & Billing
  - `subscriptions` table for managing Pro/Free tier memberships
  - Tracks Stripe customer and subscription IDs
  - Manages subscription status and billing periods
  
  ### 3. Coupons & Promotions
  - `coupons` table for discount codes and deals
  - `coupon_redemptions` table for tracking customer usage
  - Supports percentage and fixed amount discounts
  
  ### 4. Marketing & Campaigns
  - `marketing_campaigns` table for paid promotions
  - Tracks featured listings, priority placement, and boost campaigns
  - Records impressions and clicks for ROI analysis
  
  ### 5. Gallery & Media
  - `restaurant_gallery` table for multiple restaurant images
  - Supports image ordering, captions, and hero image designation
  
  ### 6. Social Media Integration
  - `restaurant_social_links` table for platform URLs
  - Supports Facebook, Instagram, Twitter, TikTok, Yelp
  
  ### 7. Analytics & Insights
  - `restaurant_analytics` table for daily metrics
  - Tracks views, clicks, and engagement per restaurant
  
  ### 8. Notifications
  - `notifications` table for owner alerts
  - Supports multiple notification types with read tracking
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure owners only access their own data
  - Public read access only where appropriate
  
  ## Indexes
  - Performance indexes on foreign keys and frequently queried columns
  - Date range indexes for analytics queries
*/

-- =====================================================================
-- 1. EXTEND USER PROFILES WITH ROLE
-- =====================================================================

-- Add role column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role text DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin'));
    CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
  END IF;
END $$;

-- =====================================================================
-- 2. RESTAURANT OWNERSHIP JUNCTION TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS restaurant_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  permission_level text DEFAULT 'owner' CHECK (permission_level IN ('owner', 'manager', 'viewer')),
  is_primary_owner boolean DEFAULT false,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(owner_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_ownership_owner ON restaurant_ownership(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_ownership_restaurant ON restaurant_ownership(restaurant_id);

ALTER TABLE restaurant_ownership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their restaurant ownership"
  ON restaurant_ownership FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage their restaurant ownership"
  ON restaurant_ownership FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id);

-- =====================================================================
-- 3. SUBSCRIPTIONS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  trial_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- 4. COUPONS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value decimal(10,2) NOT NULL,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz NOT NULL,
  usage_limit integer DEFAULT NULL,
  current_usage integer DEFAULT 0,
  terms text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_restaurant ON coupons(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_to);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  TO public
  USING (active = true AND valid_from <= now() AND valid_to >= now());

CREATE POLICY "Restaurant owners can manage their coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_ownership WHERE owner_id = auth.uid()
    )
  );

-- =====================================================================
-- 5. COUPON REDEMPTIONS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  customer_email text,
  redeemed_at timestamptz DEFAULT now(),
  order_value decimal(10,2)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_date ON coupon_redemptions(redeemed_at);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view their coupon redemptions"
  ON coupon_redemptions FOR SELECT
  TO authenticated
  USING (
    coupon_id IN (
      SELECT c.id FROM coupons c
      JOIN restaurant_ownership ro ON ro.restaurant_id = c.restaurant_id
      WHERE ro.owner_id = auth.uid()
    )
  );

-- =====================================================================
-- 6. MARKETING CAMPAIGNS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  campaign_type text NOT NULL CHECK (campaign_type IN ('featured', 'priority', 'boost')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  budget decimal(10,2),
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_restaurant ON marketing_campaigns(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_active ON marketing_campaigns(active);

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can manage their campaigns"
  ON marketing_campaigns FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_ownership WHERE owner_id = auth.uid()
    )
  );

-- =====================================================================
-- 7. RESTAURANT GALLERY TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS restaurant_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  alt_text text,
  display_order integer DEFAULT 0,
  is_hero boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_gallery_restaurant ON restaurant_gallery(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_gallery_order ON restaurant_gallery(restaurant_id, display_order);

ALTER TABLE restaurant_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurant gallery images"
  ON restaurant_gallery FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Restaurant owners can manage their gallery"
  ON restaurant_gallery FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_ownership WHERE owner_id = auth.uid()
    )
  );

-- =====================================================================
-- 8. RESTAURANT SOCIAL LINKS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS restaurant_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'tiktok', 'yelp')),
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_social_links_restaurant ON restaurant_social_links(restaurant_id);

ALTER TABLE restaurant_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view restaurant social links"
  ON restaurant_social_links FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Restaurant owners can manage their social links"
  ON restaurant_social_links FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_ownership WHERE owner_id = auth.uid()
    )
  );

-- =====================================================================
-- 9. RESTAURANT ANALYTICS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS restaurant_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date date NOT NULL,
  views integer DEFAULT 0,
  profile_clicks integer DEFAULT 0,
  direction_requests integer DEFAULT 0,
  phone_clicks integer DEFAULT 0,
  website_clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_restaurant ON restaurant_analytics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_date ON restaurant_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_restaurant_date ON restaurant_analytics(restaurant_id, date DESC);

ALTER TABLE restaurant_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view their analytics"
  ON restaurant_analytics FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_ownership WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics"
  ON restaurant_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update analytics"
  ON restaurant_analytics FOR UPDATE
  TO authenticated
  USING (true);

-- =====================================================================
-- 10. NOTIFICATIONS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('coupon_redeemed', 'payment_due', 'payment_failed', 'restaurant_published', 'verification_approved', 'weekly_summary', 'marketing_tip')),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- 11. HELPER FUNCTIONS
-- =====================================================================

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE coupons
  SET current_usage = current_usage + 1
  WHERE id = coupon_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is restaurant owner
CREATE OR REPLACE FUNCTION is_restaurant_owner(user_uuid uuid, restaurant_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurant_ownership
    WHERE owner_id = user_uuid AND restaurant_id = restaurant_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get owner's subscription plan
CREATE OR REPLACE FUNCTION get_user_subscription_plan(user_uuid uuid)
RETURNS text AS $$
DECLARE
  plan text;
BEGIN
  SELECT plan_type INTO plan
  FROM subscriptions
  WHERE user_id = user_uuid AND status = 'active';
  
  RETURN COALESCE(plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;