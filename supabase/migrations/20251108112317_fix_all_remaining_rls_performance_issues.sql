/*
  # Fix All Remaining RLS Performance and Security Issues

  This migration addresses 17 remaining unoptimized RLS policies across multiple tables.
  
  ## Tables Fixed
  1. audit_logs - Admin view policy
  2. favorites - User insert/select policies
  3. restaurant_ownership - Owner management policies
  4. coupons - Owner management policy
  5. coupon_redemptions - Owner view policy
  6. marketing_campaigns - Owner management policy
  7. restaurant_gallery - Owner management policy
  8. restaurant_social_links - Owner management policy
  9. rate_limits - Admin management policy
  10. stripe_customers - User view policy
  11. stripe_orders - User view policy
  12. stripe_subscriptions - User view policy
  13. subscription_features - Admin insert/update policies
  
  ## Performance Improvement
  Wraps all `auth.uid()` calls in SELECT statements for optimal performance.
*/

-- ============================================================
-- AUDIT_LOGS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================
-- FAVORITES TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- RESTAURANT_OWNERSHIP TABLE
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can claim restaurants" ON restaurant_ownership;
DROP POLICY IF EXISTS "Owners can manage their restaurant ownership" ON restaurant_ownership;
DROP POLICY IF EXISTS "Owners can view their restaurant ownership" ON restaurant_ownership;

CREATE POLICY "Authenticated users can claim restaurants"
  ON restaurant_ownership FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Owners can manage their restaurant ownership"
  ON restaurant_ownership FOR ALL
  TO authenticated
  USING ((select auth.uid()) = owner_id);

CREATE POLICY "Owners can view their restaurant ownership"
  ON restaurant_ownership FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = owner_id);

-- ============================================================
-- COUPONS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Restaurant owners can manage their coupons" ON coupons;

CREATE POLICY "Restaurant owners can manage their coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_ownership.restaurant_id
      FROM restaurant_ownership
      WHERE restaurant_ownership.owner_id = (select auth.uid())
    )
  );

-- ============================================================
-- COUPON_REDEMPTIONS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Restaurant owners can view their coupon redemptions" ON coupon_redemptions;

CREATE POLICY "Restaurant owners can view their coupon redemptions"
  ON coupon_redemptions FOR SELECT
  TO authenticated
  USING (
    coupon_id IN (
      SELECT c.id
      FROM coupons c
      JOIN restaurant_ownership ro ON ro.restaurant_id = c.restaurant_id
      WHERE ro.owner_id = (select auth.uid())
    )
  );

-- ============================================================
-- MARKETING_CAMPAIGNS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Restaurant owners can manage their campaigns" ON marketing_campaigns;

CREATE POLICY "Restaurant owners can manage their campaigns"
  ON marketing_campaigns FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_ownership.restaurant_id
      FROM restaurant_ownership
      WHERE restaurant_ownership.owner_id = (select auth.uid())
    )
  );

-- ============================================================
-- RESTAURANT_GALLERY TABLE
-- ============================================================

DROP POLICY IF EXISTS "Restaurant owners can manage their gallery" ON restaurant_gallery;

CREATE POLICY "Restaurant owners can manage their gallery"
  ON restaurant_gallery FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_ownership.restaurant_id
      FROM restaurant_ownership
      WHERE restaurant_ownership.owner_id = (select auth.uid())
    )
  );

-- ============================================================
-- RESTAURANT_SOCIAL_LINKS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Restaurant owners can manage their social links" ON restaurant_social_links;

CREATE POLICY "Restaurant owners can manage their social links"
  ON restaurant_social_links FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_ownership.restaurant_id
      FROM restaurant_ownership
      WHERE restaurant_ownership.owner_id = (select auth.uid())
    )
  );

-- ============================================================
-- RATE_LIMITS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Only system can manage rate limits" ON rate_limits;

CREATE POLICY "Only system can manage rate limits"
  ON rate_limits FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================
-- STRIPE_CUSTOMERS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    AND deleted_at IS NULL
  );

-- ============================================================
-- STRIPE_ORDERS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT stripe_customers.customer_id
      FROM stripe_customers
      WHERE stripe_customers.user_id = (select auth.uid())
      AND stripe_customers.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- ============================================================
-- STRIPE_SUBSCRIPTIONS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT stripe_customers.customer_id
      FROM stripe_customers
      WHERE stripe_customers.user_id = (select auth.uid())
      AND stripe_customers.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- ============================================================
-- SUBSCRIPTION_FEATURES TABLE
-- ============================================================

DROP POLICY IF EXISTS "Only admins can insert subscription features" ON subscription_features;
DROP POLICY IF EXISTS "Only admins can update subscription features" ON subscription_features;

CREATE POLICY "Only admins can insert subscription features"
  ON subscription_features FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update subscription features"
  ON subscription_features FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );
