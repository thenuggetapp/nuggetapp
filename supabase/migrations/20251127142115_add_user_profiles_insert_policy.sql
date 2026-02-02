/*
  # Add INSERT Policy for user_profiles

  ## Problem
  Users signing in via OAuth in iframe environments (Bolt preview) can't create
  their own profile because there's no INSERT policy on user_profiles table.

  ## Solution
  Add an INSERT policy that allows authenticated users to create their own profile
  with the id matching their auth.uid().

  ## Changes
  1. Add INSERT policy for authenticated users to insert their own profile
  2. Add UPDATE policy for authenticated users to update their own profile
*/

-- =====================================================================
-- 1. ADD INSERT POLICY
-- =====================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================================
-- 2. ADD UPDATE POLICY
-- =====================================================================

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================================
-- 3. GRANT INSERT/UPDATE PERMISSIONS
-- =====================================================================

GRANT INSERT ON user_profiles TO authenticated;
GRANT UPDATE ON user_profiles TO authenticated;
