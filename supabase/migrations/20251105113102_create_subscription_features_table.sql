/*
  # Create Subscription Features Table

  1. New Tables
    - `subscription_features`
      - `id` (uuid, primary key)
      - `subscription_type` (subscription_type enum)
      - `plan_tier` (plan_tier enum)
      - `feature_key` (text) - unique identifier for the feature
      - `feature_value` (text) - value/limit description
      - `feature_limit` (integer) - numeric limit if applicable
      - `description` (text) - user-friendly description
      - `created_at` (timestamptz)
      
    - `usage_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `feature_key` (text)
      - `current_usage` (integer)
      - `period_start` (timestamptz)
      - `period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can read subscription features (public data)
    - Users can only read their own usage tracking
    - Only admins can modify features
    
  3. Data
    - Seed initial features for Free and Pro plans
*/

-- Create subscription_features table
CREATE TABLE IF NOT EXISTS subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_type text NOT NULL,
  plan_tier text NOT NULL,
  feature_key text NOT NULL,
  feature_value text NOT NULL,
  feature_limit integer,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscription_type, plan_tier, feature_key)
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_key text NOT NULL,
  current_usage integer DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_key, period_start)
);

-- Enable RLS
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_features (public read)
CREATE POLICY "Anyone can view subscription features"
  ON subscription_features FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert subscription features"
  ON subscription_features FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update subscription features"
  ON subscription_features FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policies for usage_tracking
CREATE POLICY "Users can view own usage tracking"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage tracking"
  ON usage_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage tracking"
  ON usage_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seed Free Plan Features
INSERT INTO subscription_features (subscription_type, plan_tier, feature_key, feature_value, feature_limit, description) VALUES
  ('customer_subscription', 'free', 'basic_search', 'unlimited', NULL, 'Basic restaurant search'),
  ('customer_subscription', 'free', 'map_view', 'included', NULL, 'Interactive map view'),
  ('customer_subscription', 'free', 'filter_options', 'limited', 3, 'Up to 3 filters at once'),
  ('customer_subscription', 'free', 'saved_places', 'limited', 10, 'Save up to 10 favorite restaurants'),
  ('customer_subscription', 'free', 'reviews', 'read_only', NULL, 'View restaurant reviews'),
  ('customer_subscription', 'free', 'basic_details', 'included', NULL, 'View basic restaurant information')
ON CONFLICT (subscription_type, plan_tier, feature_key) DO NOTHING;

-- Seed Pro Plan Features
INSERT INTO subscription_features (subscription_type, plan_tier, feature_key, feature_value, feature_limit, description) VALUES
  ('customer_subscription', 'pro', 'advanced_search', 'unlimited', NULL, 'Advanced search with AI-powered recommendations'),
  ('customer_subscription', 'pro', 'unlimited_filters', 'unlimited', NULL, 'Use unlimited filters simultaneously'),
  ('customer_subscription', 'pro', 'unlimited_saves', 'unlimited', NULL, 'Save unlimited favorite restaurants'),
  ('customer_subscription', 'pro', 'custom_lists', 'included', NULL, 'Create and organize custom restaurant lists'),
  ('customer_subscription', 'pro', 'priority_support', 'included', NULL, 'Priority customer support'),
  ('customer_subscription', 'pro', 'ad_free', 'included', NULL, 'Ad-free browsing experience'),
  ('customer_subscription', 'pro', 'exclusive_deals', 'included', NULL, 'Access to exclusive restaurant deals'),
  ('customer_subscription', 'pro', 'early_access', 'included', NULL, 'Early access to new restaurants and features'),
  ('customer_subscription', 'pro', 'detailed_analytics', 'included', NULL, 'Personalized dining insights and recommendations'),
  ('customer_subscription', 'pro', 'offline_access', 'included', NULL, 'Download restaurant info for offline viewing')
ON CONFLICT (subscription_type, plan_tier, feature_key) DO NOTHING;
