/*
  # Fix Local Hero Applications - Use JWT for Admin Check

  1. Security Changes
    - Update admin policies to use JWT check instead of is_admin() function
    - This matches the pattern used successfully in other tables like user_profiles
    - More reliable for client-side queries

  2. Notes
    - JWT-based checks are more reliable for RLS policies in client queries
    - The app_metadata.role is set during authentication and available in JWT
*/

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all applications" ON local_hero_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON local_hero_applications;

-- Recreate policies using JWT-based admin check (matches user_profiles pattern)
CREATE POLICY "Admins can view all applications"
  ON local_hero_applications
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update applications"
  ON local_hero_applications
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
