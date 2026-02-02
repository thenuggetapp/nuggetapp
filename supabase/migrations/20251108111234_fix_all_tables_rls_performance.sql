/*
  # Fix RLS Performance Issues Across All Tables

  This migration optimizes ALL RLS policies by using `(select auth.uid())` instead of `auth.uid()`.
  
  ## Problem
  Direct calls to `auth.uid()` in RLS policies are re-evaluated for EVERY row, causing severe
  performance degradation across the entire application.
  
  ## Solution
  Wrap ALL `auth.uid()` calls in SELECT statements: `(select auth.uid())`
  
  ## Tables Fixed
  1. notifications - user_id checks
  2. reviews - user_id checks
  3. subscriptions - user_id checks
  4. usage_tracking - user_id checks
  5. restaurants - admin/owner/local hero checks
  6. restaurant_analytics - admin checks
  7. restaurant_suggestions - admin checks
  8. local_hero_assignments - admin checks
*/

-- ============================================================
-- FIX NOTIFICATIONS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- FIX REVIEWS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- FIX SUBSCRIPTIONS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;

CREATE POLICY "Users can update their own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- FIX USAGE_TRACKING TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users can update own usage tracking" ON usage_tracking;

CREATE POLICY "Users can update own usage tracking"
  ON usage_tracking
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- FIX RESTAURANTS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Admins can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Owners can update their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Only admins and verified owners can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Local heroes can update restaurants in their cities" ON restaurants;

-- Admin policy (optimized)
CREATE POLICY "Admins can update restaurants"
  ON restaurants
  FOR UPDATE
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

-- Owner policy (optimized)
CREATE POLICY "Owners can update their restaurants"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_ownership 
      WHERE restaurant_ownership.owner_id = (select auth.uid())
      AND restaurant_ownership.restaurant_id = restaurants.id
      AND restaurant_ownership.verified = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_ownership 
      WHERE restaurant_ownership.owner_id = (select auth.uid())
      AND restaurant_ownership.restaurant_id = restaurants.id
      AND restaurant_ownership.verified = true
    )
  );

-- Local hero policy (optimized)
CREATE POLICY "Local heroes can update restaurants in their cities"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'local_hero'
    )
    AND (
      EXISTS (
        SELECT 1 FROM local_hero_assignments
        WHERE local_hero_assignments.user_id = (select auth.uid())
        AND local_hero_assignments.city_name = restaurants.city
        AND local_hero_assignments.is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM restaurant_ownership
        WHERE restaurant_ownership.owner_id = (select auth.uid())
        AND restaurant_ownership.restaurant_id = restaurants.id
        AND restaurant_ownership.verified = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'local_hero'
    )
    AND (
      EXISTS (
        SELECT 1 FROM local_hero_assignments
        WHERE local_hero_assignments.user_id = (select auth.uid())
        AND local_hero_assignments.city_name = restaurants.city
        AND local_hero_assignments.is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM restaurant_ownership
        WHERE restaurant_ownership.owner_id = (select auth.uid())
        AND restaurant_ownership.restaurant_id = restaurants.id
        AND restaurant_ownership.verified = true
      )
    )
  );

-- ============================================================
-- FIX RESTAURANT_ANALYTICS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Only admins can update analytics" ON restaurant_analytics;

CREATE POLICY "Only admins can update analytics"
  ON restaurant_analytics
  FOR UPDATE
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

-- ============================================================
-- FIX RESTAURANT_SUGGESTIONS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Admins can update suggestions" ON restaurant_suggestions;

CREATE POLICY "Admins can update suggestions"
  ON restaurant_suggestions
  FOR UPDATE
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

-- ============================================================
-- FIX LOCAL_HERO_ASSIGNMENTS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Admins can update assignments" ON local_hero_assignments;

CREATE POLICY "Admins can update assignments"
  ON local_hero_assignments
  FOR UPDATE
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
