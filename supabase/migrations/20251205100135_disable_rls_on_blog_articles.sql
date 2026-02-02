/*
  # Disable RLS on Blog Articles

  ## Changes
  - Drop all RLS policies on blog_articles table
  - Disable Row Level Security on blog_articles table
  - This makes all blog articles publicly accessible without restrictions

  ## Security Note
  - Blog articles will be fully public (no access control)
  - Anyone can read all articles (published or not)
  - Write operations (INSERT/UPDATE/DELETE) still require proper application-level permissions
*/

-- Drop all existing policies on blog_articles
DROP POLICY IF EXISTS "Admins can delete articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins can insert articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins can update articles" ON blog_articles;
DROP POLICY IF EXISTS "Admins can view all articles" ON blog_articles;
DROP POLICY IF EXISTS "Published articles are publicly viewable" ON blog_articles;
DROP POLICY IF EXISTS "Public can view published articles" ON blog_articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON blog_articles;

-- Disable RLS on blog_articles table
ALTER TABLE blog_articles DISABLE ROW LEVEL SECURITY;
