/*
  # Simplify Blog Articles to Admin-Only Access

  ## Changes
  - Remove all existing policies
  - Create simple admin-only policies for all operations
  - Keep public read access for published articles

  ## Security
  - Only admins can create, update, and delete articles
  - Public users can view published articles
  - Admins can view all articles (published and unpublished)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can delete articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins can create articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins and local heroes can view all articles" ON blog_articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins and local heroes can update articles" ON blog_articles;

-- Create simple admin-only policies
CREATE POLICY "Admins can insert articles"
  ON blog_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update articles"
  ON blog_articles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete articles"
  ON blog_articles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can view all articles
CREATE POLICY "Admins can view all articles"
  ON blog_articles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Public can view published articles
CREATE POLICY "Public can view published articles"
  ON blog_articles
  FOR SELECT
  TO public
  USING (published = true);
