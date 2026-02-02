/*
  # Add service role access for Google Auth Edge Function

  1. Changes
    - Add policy to allow service role to insert/update user_profiles
    - This is needed for the Google Auth edge function to create profiles
    - Service role is only accessible from secure edge functions

  2. Security
    - Policy is restricted to service_role only
    - Regular users cannot use this policy
    - Maintains existing user policies
*/

-- Policy: Allow service role to insert user profiles (for Google Auth)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Service role can insert user profiles'
  ) THEN
    CREATE POLICY "Service role can insert user profiles"
      ON user_profiles
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Policy: Allow service role to update user profiles (for Google Auth)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Service role can update user profiles'
  ) THEN
    CREATE POLICY "Service role can update user profiles"
      ON user_profiles
      FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Policy: Allow service role to select user profiles (for Google Auth)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Service role can select user profiles'
  ) THEN
    CREATE POLICY "Service role can select user profiles"
      ON user_profiles
      FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;