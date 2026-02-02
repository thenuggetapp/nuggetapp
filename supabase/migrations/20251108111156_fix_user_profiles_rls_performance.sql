/*
  # Fix RLS Performance Issues on user_profiles Table

  This migration optimizes RLS policies by using `(select auth.uid())` instead of `auth.uid()`.
  
  ## Problem
  Direct calls to `auth.uid()` in RLS policies are re-evaluated for EVERY row, causing severe
  performance degradation. This is especially problematic for queries that scan multiple rows.
  
  ## Solution
  Wrap `auth.uid()` calls in a SELECT statement: `(select auth.uid())`
  This causes the function to be evaluated ONCE per query instead of once per row.
  
  ## Changes
  1. Drop existing user-facing policies
  2. Recreate them with optimized `(select auth.uid())` syntax
  3. Keep service role policies unchanged (they use `true` and are already optimal)
  
  ## Policies Updated
  - Users can view own profile (SELECT)
  - Users can view own full profile (SELECT) 
  - Users can insert own profile (INSERT)
  - Users can update own profile (UPDATE)
  - Users can view limited public profiles (SELECT)
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own full profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view limited public profiles" ON user_profiles;

-- Recreate with optimized auth.uid() calls using SELECT

-- Allow users to view their own full profile (optimized)
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

-- Allow users to insert their own profile (optimized)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Allow users to update their own profile (optimized)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Allow users to view limited public profiles of other users (optimized)
CREATE POLICY "Users can view limited public profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) <> id 
    AND (
      EXISTS (
        SELECT 1 FROM reviews 
        WHERE reviews.user_id = user_profiles.id
      ) 
      OR EXISTS (
        SELECT 1 FROM favorites 
        WHERE favorites.user_id = user_profiles.id
      )
    )
  );
