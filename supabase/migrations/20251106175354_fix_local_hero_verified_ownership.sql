/*
  # Fix Local Hero Verified Ownership
  
  ## Summary
  This migration fixes an issue where local heroes cannot set verified=true on 
  restaurant_ownership records when they create restaurants. This was preventing
  them from being able to update their own restaurants.
  
  ## Changes
  1. Update prevent_auto_verified_ownership() function to allow local_hero role
     to create verified ownership records (not just admin)
  2. This allows local heroes to properly own and manage restaurants they create
  
  ## Security
  - Only admin and local_hero roles can create verified ownership records
  - Regular customers and owners still require admin approval (verified=false by default)
  - Maintains security while fixing the functionality
*/

-- Update the function to allow both admin and local_hero roles to create verified ownership
CREATE OR REPLACE FUNCTION prevent_auto_verified_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is not an admin or local_hero, they cannot set verified = true
  IF NEW.verified = true AND NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'local_hero')
  ) THEN
    NEW.verified = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comment
COMMENT ON FUNCTION prevent_auto_verified_ownership() IS
'Prevents users from auto-verifying restaurant ownership unless they are admin or local_hero. Regular users must wait for admin approval.';