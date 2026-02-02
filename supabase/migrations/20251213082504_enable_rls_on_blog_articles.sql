/*
  # Re-enable RLS on Blog Articles

  ## Overview
  Re-enables Row Level Security on the blog_articles table to ensure proper access control.

  ## Changes
  1. Enable Row Level Security on blog_articles table
  2. Create policies for:
     - Public read access to published articles
     - Authenticated users (admins) can view all articles
     - Admins and local heroes can insert articles
     - Admins, local heroes, and authors can update articles
     - Admins can delete articles

  ## Security
  - Public users can only read published articles
  - Only authenticated admins and local heroes can create/modify articles
  - Only admins can delete articles
*/

-- Enable RLS on blog_articles table
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- Public can view published articles only
CREATE POLICY "Public can view published articles"
  ON blog_articles
  FOR SELECT
  USING (published = true);

-- Admins can view all articles (published and unpublished)
CREATE POLICY "Admins can view all articles"
  ON blog_articles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins and local heroes can insert articles
CREATE POLICY "Admins and local heroes can insert articles"
  ON blog_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'local_hero')
    )
  );

-- Admins, local heroes, and authors can update articles
CREATE POLICY "Admins and authors can update articles"
  ON blog_articles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        user_profiles.role IN ('admin', 'local_hero')
        OR user_profiles.id = blog_articles.author_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        user_profiles.role IN ('admin', 'local_hero')
        OR user_profiles.id = blog_articles.author_id
      )
    )
  );

-- Only admins can delete articles
CREATE POLICY "Admins can delete articles"
  ON blog_articles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
