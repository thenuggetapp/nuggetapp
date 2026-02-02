/*
  # Fix Local Hero Applications Admin RLS

  1. Security Changes
    - Update admin SELECT policy to use the is_admin() function for consistency
    - This fixes the issue where admins cannot view applications in the admin panel

  2. Notes
    - The existing policy uses a subquery which should work, but using is_admin() function is more consistent
    - This ensures admins can properly view and manage applications
*/

-- Drop the existing admin SELECT policy
DROP POLICY IF EXISTS "Admins can view all applications" ON local_hero_applications;

-- Recreate with is_admin() function
CREATE POLICY "Admins can view all applications"
  ON local_hero_applications
  FOR SELECT
  TO authenticated
  USING (is_admin());
