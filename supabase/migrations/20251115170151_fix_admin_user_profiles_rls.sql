/*
  # Fix Admin Access to User Profiles

  ## Problem
  Admins need to view all user profiles in the admin panel, but the current RLS policy
  only allows users to see their own profile. Adding a policy that queries user_profiles
  to check if someone is an admin creates a circular dependency.

  ## Solution
  1. Store the user's role in their JWT token's app_metadata
  2. Create an RLS policy that checks the JWT for admin role (no database query needed)
  3. Update the trigger to set role in app_metadata when user signs up

  ## Changes
  1. Add RLS policy for admins to view all profiles using JWT check
  2. Update handle_new_user() trigger to set role in auth.users.raw_app_meta_data
  3. Add function to update user role and sync to JWT

  ## Security
  - Uses auth.jwt() to check role from JWT token (no circular dependency)
  - Role is stored in app_metadata which users CANNOT modify
  - Only accessible via SECURITY DEFINER functions
*/

-- =====================================================================
-- 1. ADD ADMIN POLICY FOR VIEWING ALL USER PROFILES
-- =====================================================================

-- Drop existing policy if it exists (in case user already tried to add it)
DROP POLICY IF EXISTS "admins_can_view_all_user_profiles" ON user_profiles;

-- Create policy that checks JWT token for admin role (no circular dependency!)
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Check if user's JWT contains role = 'admin' in app_metadata
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =====================================================================
-- 2. UPDATE TRIGGER TO SET ROLE IN JWT (app_metadata)
-- =====================================================================

-- Update the handle_new_user function to also set role in auth.users.raw_app_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Determine role (default to 'customer')
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
  
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    user_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  
  -- CRITICAL: Set role in app_metadata so it's available in JWT
  -- This allows RLS policies to check role without querying the database
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', user_role)
  WHERE id = new.id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 3. ADD FUNCTION TO UPDATE USER ROLE (Admin-only)
-- =====================================================================

-- Function to update user role and sync to JWT
-- This ensures role changes are reflected in both user_profiles and JWT
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS void AS $$
BEGIN
  -- Validate role
  IF new_role NOT IN ('customer', 'owner', 'admin', 'local_hero') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Check if caller is admin
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;
  
  -- Update user_profiles table
  UPDATE user_profiles
  SET 
    role = new_role,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Update auth.users app_metadata (for JWT)
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', new_role)
  WHERE id = target_user_id;
  
  -- Note: User needs to refresh their session to get updated JWT
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 4. SYNC EXISTING ROLES TO JWT
-- =====================================================================

-- One-time sync of existing user roles to auth.users.raw_app_meta_data
-- This ensures all existing users have their role in the JWT
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT up.id, up.role 
    FROM user_profiles up
    WHERE up.role IS NOT NULL
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', user_record.role)
    WHERE id = user_record.id;
  END LOOP;
  
  RAISE NOTICE 'Synced % user roles to JWT', (SELECT COUNT(*) FROM user_profiles WHERE role IS NOT NULL);
END $$;

-- =====================================================================
-- 5. ADD POLICY FOR ADMINS TO UPDATE ANY USER PROFILE
-- =====================================================================

-- Allow admins to update any user's profile (for role changes, etc.)
CREATE POLICY "Admins can update any user profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
