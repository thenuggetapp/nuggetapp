/*
  # Comprehensive RLS Performance Fix - All Remaining Policies (Corrected)

  Fix ALL remaining policies across all tables that use unoptimized auth.uid().
  This includes SELECT, INSERT, UPDATE, and DELETE policies.
  
  ## Tables Fixed
  - notifications (all operations)
  - reviews (all operations)
  - subscriptions (all operations)
  - usage_tracking (all operations)
  - restaurants (all operations)
  - restaurant_analytics (all operations)
  - restaurant_suggestions (all operations) - using correct column name user_id
  - local_hero_assignments (all operations)
*/

-- ============================================================
-- NOTIFICATIONS TABLE - Complete Fix
-- ============================================================

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- REVIEWS TABLE - Complete Fix
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- SUBSCRIPTIONS TABLE - Complete Fix
-- ============================================================

DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;

CREATE POLICY "Users can insert their own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- USAGE_TRACKING TABLE - Complete Fix
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own usage tracking" ON usage_tracking;
DROP POLICY IF EXISTS "Users can view own usage tracking" ON usage_tracking;
DROP POLICY IF EXISTS "Users can update own usage tracking" ON usage_tracking;

CREATE POLICY "Users can insert own usage tracking"
  ON usage_tracking FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own usage tracking"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own usage tracking"
  ON usage_tracking FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- RESTAURANTS TABLE - Complete Fix
-- ============================================================

DROP POLICY IF EXISTS "Admins can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Only admins and verified owners can delete restaurants" ON restaurants;
DROP POLICY IF EXISTS "Owners can update their restaurants" ON restaurants;
DROP POLICY IF EXISTS "Local heroes can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Local heroes can update restaurants in their cities" ON restaurants;

CREATE POLICY "Admins can insert restaurants"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update restaurants"
  ON restaurants FOR UPDATE
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

CREATE POLICY "Only admins and verified owners can delete restaurants"
  ON restaurants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM restaurant_ownership
      WHERE restaurant_ownership.restaurant_id = restaurants.id
      AND restaurant_ownership.owner_id = (select auth.uid())
      AND restaurant_ownership.verified = true
    )
  );

CREATE POLICY "Owners can update their restaurants"
  ON restaurants FOR UPDATE
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

CREATE POLICY "Local heroes can insert restaurants"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'local_hero'
    )
    AND EXISTS (
      SELECT 1 FROM local_hero_assignments
      WHERE local_hero_assignments.user_id = (select auth.uid())
      AND local_hero_assignments.is_active = true
    )
  );

CREATE POLICY "Local heroes can update restaurants in their cities"
  ON restaurants FOR UPDATE
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
-- RESTAURANT_ANALYTICS TABLE - Complete Fix
-- ============================================================

DROP POLICY IF EXISTS "Only admins can insert analytics" ON restaurant_analytics;
DROP POLICY IF EXISTS "Only admins can update analytics" ON restaurant_analytics;
DROP POLICY IF EXISTS "Restaurant owners can view their analytics" ON restaurant_analytics;

CREATE POLICY "Only admins can insert analytics"
  ON restaurant_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update analytics"
  ON restaurant_analytics FOR UPDATE
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

CREATE POLICY "Restaurant owners can view their analytics"
  ON restaurant_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_ownership
      WHERE restaurant_ownership.restaurant_id = restaurant_analytics.restaurant_id
      AND restaurant_ownership.owner_id = (select auth.uid())
      AND restaurant_ownership.verified = true
    )
  );

-- ============================================================
-- RESTAURANT_SUGGESTIONS TABLE - Complete Fix (using user_id)
-- ============================================================

DROP POLICY IF EXISTS "Users can create suggestions" ON restaurant_suggestions;
DROP POLICY IF EXISTS "Users can view own suggestions" ON restaurant_suggestions;
DROP POLICY IF EXISTS "Admins can view all suggestions" ON restaurant_suggestions;
DROP POLICY IF EXISTS "Admins can update suggestions" ON restaurant_suggestions;

CREATE POLICY "Users can create suggestions"
  ON restaurant_suggestions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own suggestions"
  ON restaurant_suggestions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all suggestions"
  ON restaurant_suggestions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update suggestions"
  ON restaurant_suggestions FOR UPDATE
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
-- LOCAL_HERO_ASSIGNMENTS TABLE - Complete Fix
-- ============================================================

DROP POLICY IF EXISTS "Admins can insert assignments" ON local_hero_assignments;
DROP POLICY IF EXISTS "Admins can view all assignments" ON local_hero_assignments;
DROP POLICY IF EXISTS "Users can view their own assignments" ON local_hero_assignments;
DROP POLICY IF EXISTS "Admins can update assignments" ON local_hero_assignments;

CREATE POLICY "Admins can insert assignments"
  ON local_hero_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all assignments"
  ON local_hero_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own assignments"
  ON local_hero_assignments FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can update assignments"
  ON local_hero_assignments FOR UPDATE
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
