/*
  # Fix Blog Articles RLS for All Users

  ## Issue
  The previous migration created a policy with "TO public" which only applies to anonymous users.
  We need a policy that applies to BOTH anonymous and authenticated users.

  ## Solution
  Drop the existing policy and create one without role restriction.
  In PostgreSQL RLS, omitting the role clause makes the policy apply to all roles.

  ## Changes
  - Drop "Anyone can view published articles" policy
  - Create new policy without role restriction that applies to everyone
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can view published articles" ON blog_articles;

-- Create policy for all users (no role restriction = applies to everyone)
CREATE POLICY "Published articles are publicly viewable"
  ON blog_articles
  FOR SELECT
  TO authenticated, anon
  USING (published = true);
