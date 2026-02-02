-- Fix restaurant INSERT policy to allow owners to create their own restaurants
-- Current policy only allows admins, but owners need to be able to add restaurants too

-- =====================================================================
-- 1. Fix restaurants INSERT policy
-- =====================================================================

DROP POLICY IF EXISTS "Only admins can insert restaurants" ON restaurants;

CREATE POLICY "Admins and owners can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User is an admin
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR
    -- User is an owner (they can create their own restaurants)
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'owner'
    )
  );

-- =====================================================================
-- 2. Fix restaurant_analytics INSERT policy
-- Owners need to be able to create analytics for their restaurants
-- =====================================================================

DROP POLICY IF EXISTS "Only admins can insert analytics" ON restaurant_analytics;

CREATE POLICY "Admins and owners can insert analytics"
  ON restaurant_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User is an admin
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR
    -- User is an owner
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'owner'
    )
  );

-- =====================================================================
-- 3. Fix restaurant_analytics UPDATE policy (for consistency)
-- =====================================================================

DROP POLICY IF EXISTS "Only admins can update analytics" ON restaurant_analytics;

CREATE POLICY "Admins and owners can update analytics"
  ON restaurant_analytics
  FOR UPDATE
  TO authenticated
  USING (
    -- User is an admin
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR
    -- User is an owner
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'owner'
    )
  )
  WITH CHECK (
    -- Same check for updated data
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'owner'
    )
  );

-- Note: After a restaurant is created, the owner must create a corresponding
-- record in restaurant_ownership to establish ownership.
-- This is already handled in the application code (page.tsx line 244-259)

