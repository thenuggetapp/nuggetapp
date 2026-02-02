/*
  # Fix handle_new_user() Trigger Deadlock
  
  ## Problem
  The handle_new_user() trigger is trying to UPDATE auth.users from within
  a trigger ON auth.users. This causes a deadlock during OAuth sign-ups,
  making the profile query hang for 10+ seconds.
  
  ## Root Cause
  In migration 20251115170151, we added code to update auth.users.raw_app_meta_data
  from within the trigger. This creates a lock contention:
  1. New user inserted into auth.users
  2. Trigger fires and tries to INSERT into user_profiles
  3. Trigger tries to UPDATE the same auth.users row that triggered it
  4. Database locks up waiting for the transaction to complete
  5. Query times out after 10 seconds
  
  ## Solution
  1. Remove the UPDATE auth.users from the trigger
  2. Use a separate function that admins can call to sync roles to JWT
  3. For new OAuth users, rely on Supabase to handle the JWT properly
  
  ## Changes
  1. Simplify handle_new_user() to ONLY insert into user_profiles
  2. Keep the admin_update_user_role() function for manual role changes
  3. Add proper error handling
*/

-- =====================================================================
-- 1. FIX THE TRIGGER - REMOVE AUTH.USERS UPDATE
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from user metadata if it exists, otherwise default to 'customer'
  user_role := COALESCE(
    new.raw_user_meta_data->>'role',
    new.raw_app_meta_data->>'role',
    'customer'
  );
  
  -- Validate role is one of the allowed values
  IF user_role NOT IN ('customer', 'owner', 'admin', 'local_hero') THEN
    user_role := 'customer';
  END IF;
  
  -- Insert user profile with explicit role
  -- Use ON CONFLICT to handle race conditions
  INSERT INTO public.user_profiles (id, email, full_name, role, avatar_url, preferences)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    user_role,
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    '{}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    updated_at = now();
  
  -- ❌ REMOVED: Do NOT try to UPDATE auth.users here - it causes deadlock!
  -- The role sync to JWT should happen via a separate admin function
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 2. KEEP THE ADMIN FUNCTION FOR MANUAL ROLE UPDATES
-- =====================================================================

-- This function can be called by admins to update roles AND sync to JWT
-- It's safe because it's not called from within a trigger
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
  
  -- Check if caller is admin (using JWT to avoid circular dependency)
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
  -- This is SAFE here because we're not in a trigger
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', new_role)
  WHERE id = target_user_id;
  
  -- Note: User needs to sign out and back in to get updated JWT
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 3. ADD FUNCTION TO SYNC EXISTING ROLES TO JWT (Admin Tool)
-- =====================================================================

-- This function can be called manually to sync roles for existing users
CREATE OR REPLACE FUNCTION public.admin_sync_all_roles_to_jwt()
RETURNS TABLE(synced_count bigint) AS $$
DECLARE
  user_record RECORD;
  sync_count bigint := 0;
BEGIN
  -- Check if caller is admin
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Only admins can sync roles to JWT';
  END IF;
  
  -- Sync all users
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
    
    sync_count := sync_count + 1;
  END LOOP;
  
  RETURN QUERY SELECT sync_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates user profile when new user signs up. Does NOT update auth.users to avoid deadlock. Sets role to customer by default.';

COMMENT ON FUNCTION public.admin_update_user_role(uuid, text) IS
'Admin function to update user role in both user_profiles and auth.users JWT metadata. User must sign out/in to see changes.';

COMMENT ON FUNCTION public.admin_sync_all_roles_to_jwt() IS
'Admin function to sync all existing user roles to their JWT tokens. Returns number of users synced.';

