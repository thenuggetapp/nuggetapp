/*
  # Optimize Blog Articles RLS with Helper Function

  ## Changes
  - Create a helper function to check if user is admin
  - Add index on user_profiles for faster lookups
  - Update RLS policies to use the helper function

  ## Security
  - Only admins can create, update, and delete articles
  - Public users can view published articles
  - Admins can view all articles
*/

-- Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_id_role ON user_profiles(id, role);

-- Create a helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can delete articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins can insert articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins can view all articles" ON blog_articles;
DROP POLICY IF EXISTS "Public can view published articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins can update articles" ON blog_articles;

-- Create policies using the helper function
CREATE POLICY "Admins can insert articles"
  ON blog_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update articles"
  ON blog_articles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete articles"
  ON blog_articles
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can view all articles"
  ON blog_articles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Public can view published articles"
  ON blog_articles
  FOR SELECT
  TO public
  USING (published = true);
