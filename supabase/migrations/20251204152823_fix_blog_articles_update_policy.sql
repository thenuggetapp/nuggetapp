/*
  # Fix Blog Articles Update Policy

  ## Problem
  The current UPDATE policy for blog_articles has a circular dependency issue.
  It checks blog_articles.author_id within the policy, which can cause performance
  issues and potential failures.

  ## Changes
  - Drop the existing update policy
  - Create a simpler, more performant policy that:
    - Allows admins and local_heroes to update any article
    - This matches the business logic where admins/local_heroes manage content

  ## Security
  - Maintains security by requiring authenticated users with admin or local_hero roles
  - Uses a direct role check instead of circular table references
*/

-- Drop the old policy with circular dependency
DROP POLICY IF EXISTS "Admins and local heroes can update articles" ON blog_articles;

-- Create new policy without circular dependency
CREATE POLICY "Admins and local heroes can update articles"
  ON blog_articles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'local_hero')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'local_hero')
    )
  );
