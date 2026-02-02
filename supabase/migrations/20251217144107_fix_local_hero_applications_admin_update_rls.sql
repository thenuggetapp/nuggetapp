/*
  # Fix Local Hero Applications Admin Update RLS

  1. Security Changes
    - Update admin UPDATE policy to use the is_admin() function for consistency
    - This ensures admins can properly update application statuses

  2. Notes
    - Using is_admin() function is more consistent and maintainable
    - Matches the pattern used for SELECT policy
*/

-- Drop the existing admin UPDATE policy
DROP POLICY IF EXISTS "Admins can update applications" ON local_hero_applications;

-- Recreate with is_admin() function
CREATE POLICY "Admins can update applications"
  ON local_hero_applications
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
