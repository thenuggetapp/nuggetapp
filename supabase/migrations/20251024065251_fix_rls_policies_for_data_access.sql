/*
  # Fix RLS Policies for Proper Data Access

  ## Changes Made
  
  1. **Restaurants Table**
     - Update SELECT policy to respect the `visible` column
     - Public users can only see visible restaurants
     - Keep existing INSERT/UPDATE policies for authenticated users
  
  2. **User Profiles Table**
     - Add policy for authenticated users to view other profiles (needed for reviews, favorites, etc.)
     - Keep existing policies for users to manage their own profiles
  
  3. **Subscriptions Table**
     - Add INSERT policy so new users can create subscriptions
  
  ## Security Notes
  - All policies maintain proper authentication checks
  - Users can only modify their own data
  - Public access is limited to viewing visible restaurants and public profile info
*/

-- Drop and recreate restaurants SELECT policy to respect visible column
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;

CREATE POLICY "Anyone can view visible restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (visible = true);

-- Add policy for authenticated users to view all profiles (needed for app functionality)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON user_profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Add INSERT policy for subscriptions (needed for new user signups)
DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;

CREATE POLICY "Users can insert their own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
