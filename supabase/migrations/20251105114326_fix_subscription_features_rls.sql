/*
  # Fix Subscription Features RLS Policy

  1. Changes
    - Drop existing restrictive SELECT policy
    - Add new policy that allows both authenticated AND anonymous users to view features
    - Subscription features are public information and should be viewable by everyone
    
  2. Security
    - Keep INSERT/UPDATE policies restricted to admins only
    - Allow public read access for browsing subscription options
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view subscription features" ON subscription_features;

-- Create a new policy that allows both authenticated and anonymous users
CREATE POLICY "Public can view subscription features"
  ON subscription_features FOR SELECT
  USING (true);
