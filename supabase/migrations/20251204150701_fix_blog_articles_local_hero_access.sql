/*
  # Fix Blog Articles Access for Local Heroes

  This migration fixes the "failed to load articles" error on the Manage Articles page.
  
  ## Problem
  Local heroes couldn't view articles because there was no RLS policy allowing them SELECT access.
  Only admins had SELECT access to all articles, and public users could only view published articles.
  
  ## Changes
  - Drop the existing "Admins can view all articles" policy
  - Create a new policy that allows both admins AND local heroes to view all articles
  
  ## Security
  - Maintains security by only allowing authenticated users with admin or local_hero roles
  - Uses EXISTS check with proper user_profiles join to verify role
*/

-- Drop the old admin-only policy
DROP POLICY IF EXISTS "Admins can view all articles" ON blog_articles;

-- Create new policy that allows both admins and local heroes to view all articles
CREATE POLICY "Admins and local heroes can view all articles"
  ON blog_articles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'local_hero')
    )
  );
