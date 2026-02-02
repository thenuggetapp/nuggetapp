/*
  # Add local_hero role to user_profiles

  1. Changes
    - Drop existing role check constraint
    - Add new check constraint that includes 'local_hero' role
    - Valid roles: customer, owner, admin, local_hero
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'user_profiles' AND constraint_name = 'user_profiles_role_check'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_role_check;
  END IF;
END $$;

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('customer', 'owner', 'admin', 'local_hero'));
