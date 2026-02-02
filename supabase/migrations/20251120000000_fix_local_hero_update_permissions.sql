/*
  # Fix Local Hero Restaurant Update Permissions
  
  ## Problem
  Local heroes can see the success message when updating restaurants, but
  the database is not being updated. This is an RLS policy issue.
  
  ## Root Cause
  1. RLS policies check (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_hero'
  2. Many local hero users don't have their role in JWT app_metadata
  3. The RLS policy silently blocks the update (returns 0 rows affected)
  4. The application shows "success" because no error was thrown
  
  ## Solution
  1. Ensure local_hero_assignments table exists with proper structure
  2. Sync all local hero roles to JWT app_metadata
  3. Fix RLS policy to check BOTH JWT and user_profiles (for backwards compatibility)
  4. Fix WITH CHECK clause to validate city assignment
  
  ## Security
  - Maintains all existing security checks
  - Adds fallback to user_profiles table for compatibility
  - Properly validates city assignment in WITH CHECK clause
*/

-- =====================================================================
-- 1. ENSURE LOCAL_HERO_ASSIGNMENTS TABLE EXISTS
-- =====================================================================

CREATE TABLE IF NOT EXISTS local_hero_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_name text NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, city_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_local_hero_assignments_user_id 
  ON local_hero_assignments(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_local_hero_assignments_city 
  ON local_hero_assignments(city_name) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_local_hero_assignments_user_city 
  ON local_hero_assignments(user_id, city_name) WHERE is_active = true;

-- Enable RLS
ALTER TABLE local_hero_assignments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for local_hero_assignments (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'local_hero_assignments' 
    AND policyname = 'Users can view their own assignments'
  ) THEN
    CREATE POLICY "Users can view their own assignments"
      ON local_hero_assignments
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'local_hero_assignments' 
    AND policyname = 'Admins can view all assignments using JWT'
  ) THEN
    CREATE POLICY "Admins can view all assignments using JWT"
      ON local_hero_assignments
      FOR SELECT
      TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'local_hero_assignments' 
    AND policyname = 'Admins can manage assignments'
  ) THEN
    CREATE POLICY "Admins can manage assignments"
      ON local_hero_assignments
      FOR ALL
      TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      )
      WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- =====================================================================
-- 2. SYNC ALL LOCAL HERO ROLES TO JWT APP_METADATA
-- =====================================================================

-- Sync all local hero users to have their role in JWT
DO $$
DECLARE
  user_record RECORD;
  sync_count integer := 0;
BEGIN
  FOR user_record IN 
    SELECT up.id, up.role 
    FROM user_profiles up
    WHERE up.role = 'local_hero'
  LOOP
    -- Update auth.users to set role in app_metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', 'local_hero')
    WHERE id = user_record.id;
    
    sync_count := sync_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Synced % local hero users to JWT app_metadata', sync_count;
END $$;

-- =====================================================================
-- 3. FIX RESTAURANTS UPDATE POLICY FOR LOCAL HEROES
-- =====================================================================

-- Drop all existing local hero update policies
DROP POLICY IF EXISTS "Local heroes can update restaurants in their cities" ON restaurants CASCADE;
DROP POLICY IF EXISTS "Local heroes can update restaurants" ON restaurants CASCADE;
DROP POLICY IF EXISTS "Local heroes update policy" ON restaurants CASCADE;

-- Create new policy with BOTH JWT check AND user_profiles fallback
CREATE POLICY "Local heroes can update restaurants in their cities"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (
    -- Check if user is local_hero (check BOTH JWT and user_profiles for compatibility)
    (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_hero' OR
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'local_hero'
      )
    )
    AND
    -- Verify they have access to this restaurant via city assignment OR ownership
    (
      -- Can update restaurants in their assigned cities
      EXISTS (
        SELECT 1 FROM local_hero_assignments
        WHERE user_id = auth.uid()
          AND city_name = restaurants.city
          AND is_active = true
      )
      OR
      -- OR they're a verified owner of this specific restaurant
      EXISTS (
        SELECT 1 FROM restaurant_ownership
        WHERE owner_id = auth.uid()
          AND restaurant_id = restaurants.id
          AND verified = true
      )
    )
  )
  WITH CHECK (
    -- IMPORTANT: WITH CHECK must also verify city assignment/ownership
    -- This prevents someone from updating a restaurant to a city they don't have access to
    (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_hero' OR
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'local_hero'
      )
    )
    AND
    (
      EXISTS (
        SELECT 1 FROM local_hero_assignments
        WHERE user_id = auth.uid()
          AND city_name = restaurants.city
          AND is_active = true
      )
      OR
      EXISTS (
        SELECT 1 FROM restaurant_ownership
        WHERE owner_id = auth.uid()
          AND restaurant_id = restaurants.id
          AND verified = true
      )
    )
  );

-- =====================================================================
-- 4. ADD HELPER FUNCTION TO CHECK LOCAL HERO PERMISSIONS
-- =====================================================================

-- This function can be used for debugging permission issues
CREATE OR REPLACE FUNCTION public.debug_local_hero_permissions(
  check_user_id uuid,
  check_restaurant_id uuid
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  user_role text;
  jwt_role text;
  restaurant_city text;
  has_city_assignment boolean;
  has_ownership boolean;
BEGIN
  -- Get user's role from user_profiles
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = check_user_id;
  
  -- Get role from JWT (if this returns null, JWT doesn't have the role)
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') INTO jwt_role
  WHERE auth.uid() = check_user_id;
  
  -- Get restaurant's city
  SELECT city INTO restaurant_city
  FROM restaurants
  WHERE id = check_restaurant_id;
  
  -- Check city assignment
  SELECT EXISTS (
    SELECT 1 FROM local_hero_assignments
    WHERE user_id = check_user_id
      AND city_name = restaurant_city
      AND is_active = true
  ) INTO has_city_assignment;
  
  -- Check ownership
  SELECT EXISTS (
    SELECT 1 FROM restaurant_ownership
    WHERE owner_id = check_user_id
      AND restaurant_id = check_restaurant_id
      AND verified = true
  ) INTO has_ownership;
  
  -- Build result
  result := jsonb_build_object(
    'user_id', check_user_id,
    'restaurant_id', check_restaurant_id,
    'restaurant_city', restaurant_city,
    'user_role_in_profiles', user_role,
    'user_role_in_jwt', COALESCE(jwt_role, 'NOT SET'),
    'has_city_assignment', has_city_assignment,
    'has_ownership', has_ownership,
    'can_update', (
      (user_role = 'local_hero' OR jwt_role = 'local_hero') AND
      (has_city_assignment OR has_ownership)
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 5. ADD TRIGGER TO KEEP JWT IN SYNC WHEN ROLE CHANGES
-- =====================================================================

-- Function to sync role to JWT when user_profiles role changes
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS trigger AS $$
BEGIN
  -- When role is updated in user_profiles, sync to auth.users
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Synced role % to JWT for user %', NEW.role, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS sync_role_to_jwt_trigger ON user_profiles;

-- Create trigger
CREATE TRIGGER sync_role_to_jwt_trigger
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_role_to_jwt();

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- You can run these queries to verify the fix:
--
-- 1. Check if local heroes have role in JWT:
--    SELECT u.id, u.email, u.raw_app_meta_data->>'role' as jwt_role, up.role as profile_role
--    FROM auth.users u
--    JOIN user_profiles up ON u.id = up.id
--    WHERE up.role = 'local_hero';
--
-- 2. Check city assignments:
--    SELECT * FROM local_hero_assignments WHERE is_active = true;
--
-- 3. Debug specific user permissions:
--    SELECT debug_local_hero_permissions('<user_id>', '<restaurant_id>');


