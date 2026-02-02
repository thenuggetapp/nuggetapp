/*
  # Fix City Requests RLS Performance

  ## Problem
  The city_requests table RLS policies are using slow EXISTS subqueries that
  query the user_profiles table, causing performance issues for admins.

  ## Solution
  Optimize all admin policies to use JWT metadata checks instead of database
  queries. This follows the same pattern we used for other admin tables.

  ## Changes
  1. Drop existing slow admin policies
  2. Create optimized policies using JWT checks (no database queries)
  3. Keep the public insert policy as-is
*/

-- =====================================================================
-- 1. DROP EXISTING SLOW POLICIES
-- =====================================================================

DROP POLICY IF EXISTS "Admins can view all city requests" ON city_requests;
DROP POLICY IF EXISTS "Admins can update city requests" ON city_requests;
DROP POLICY IF EXISTS "Admins can delete city requests" ON city_requests;

-- =====================================================================
-- 2. CREATE OPTIMIZED POLICIES
-- =====================================================================

-- Policy: Admins can view all city requests (FAST - JWT check, no database query)
CREATE POLICY "Admins can view all city requests"
  ON city_requests
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Policy: Admins can update city requests (FAST - JWT check)
CREATE POLICY "Admins can update city requests"
  ON city_requests
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Policy: Admins can delete city requests (FAST - JWT check)
CREATE POLICY "Admins can delete city requests"
  ON city_requests
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =====================================================================
-- 3. GRANT NECESSARY PERMISSIONS
-- =====================================================================

-- Ensure authenticated users can query (RLS will still filter)
GRANT SELECT, INSERT, UPDATE, DELETE ON city_requests TO authenticated;
GRANT INSERT ON city_requests TO anon;