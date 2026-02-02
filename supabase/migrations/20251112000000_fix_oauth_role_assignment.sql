-- Migration: Fix OAuth role assignment
-- Description: Update handle_new_user() trigger to properly set role column when creating profiles
-- Issue: OAuth users were getting NULL role or not respecting default 'customer' role
-- 
-- Changes:
--   1. Update handle_new_user() function to explicitly set role column
--   2. Use default 'customer' role for all new OAuth users
--   3. Allow override via user_metadata if role is specified
--
-- Date: 2025-11-12

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to include role assignment
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
  INSERT INTO public.user_profiles (id, email, full_name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    user_role,
    new.raw_user_meta_data->>'avatar_url'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing users who might have NULL role (shouldn't happen, but just in case)
UPDATE user_profiles 
SET role = 'customer' 
WHERE role IS NULL;

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when new user signs up. Sets role to customer by default, or uses role from user_metadata if provided.';

