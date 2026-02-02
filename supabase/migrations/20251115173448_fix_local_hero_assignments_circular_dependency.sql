/*
  # Fix Local Hero Assignments Circular Dependency

  ## Problem
  The `local_hero_assignments` table has RLS policies that query `user_profiles`
  to check if a user is an admin. This creates a CIRCULAR DEPENDENCY when
  AuthContext tries to fetch user profiles with joined assignments:

  1. Query user_profiles with local_hero_assignments join
  2. local_hero_assignments RLS checks user_profiles for admin role
  3. This triggers another RLS check on user_profiles
  4. INFINITE LOOP → Query times out after 5 seconds

  ## Solution
  Replace the policies that query user_profiles with policies that check
  the JWT token directly (same fix we did for user_profiles).

  ## Changes
  1. Drop old policies that cause circular dependency
  2. Create new policies using auth.jwt() to check role
  3. No database queries needed = no circular dependency
*/

-- =====================================================================
-- 1. DROP OLD POLICIES WITH CIRCULAR DEPENDENCY
-- =====================================================================

DROP POLICY IF EXISTS "Admins can view all assignments" ON local_hero_assignments;
DROP POLICY IF EXISTS "Admins can insert assignments" ON local_hero_assignments;
DROP POLICY IF EXISTS "Admins can update assignments" ON local_hero_assignments;

-- =====================================================================
-- 2. CREATE NEW POLICIES USING JWT (NO CIRCULAR DEPENDENCY)
-- =====================================================================

-- Allow users to view their own assignments
-- This policy is fine - no circular dependency
-- (Already exists, but recreate to be safe)
DROP POLICY IF EXISTS "Users can view their own assignments" ON local_hero_assignments;
CREATE POLICY "Users can view their own assignments"
  ON local_hero_assignments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to view all assignments (using JWT - no circular dependency!)
CREATE POLICY "Admins can view all assignments using JWT"
  ON local_hero_assignments
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Allow admins to insert assignments (using JWT - no circular dependency!)
CREATE POLICY "Admins can insert assignments using JWT"
  ON local_hero_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Allow admins to update assignments (using JWT - no circular dependency!)
CREATE POLICY "Admins can update assignments using JWT"
  ON local_hero_assignments
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Allow admins to delete assignments (using JWT - no circular dependency!)
CREATE POLICY "Admins can delete assignments using JWT"
  ON local_hero_assignments
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =====================================================================
-- 3. ADD SERVICE ROLE POLICIES FOR EDGE FUNCTIONS
-- =====================================================================

-- Service role can do anything (for system operations)
CREATE POLICY "Service role can manage all assignments"
  ON local_hero_assignments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
