/*
  # Fix Blog Articles Access for Authenticated Users

  ## Issue
  Authenticated non-admin users cannot view published articles because:
  - The "Admins can view all articles" policy requires admin role
  - The "Public can view published articles" policy only applies to anonymous users
  
  ## Solution
  Update the public policy to also apply to authenticated users, allowing everyone
  (both anonymous and authenticated) to view published articles.

  ## Changes
  - Drop existing "Public can view published articles" policy
  - Create new policy that allows both public and authenticated users to view published articles
*/

-- Drop the existing public-only policy
DROP POLICY IF EXISTS "Public can view published articles" ON blog_articles;

-- Create new policy that allows both public and authenticated users to view published articles
CREATE POLICY "Anyone can view published articles"
  ON blog_articles
  FOR SELECT
  USING (published = true);
