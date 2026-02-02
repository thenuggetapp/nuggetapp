/*
  # Backfill Google Avatars for Existing Users

  Updates existing user profiles to include their Google avatar URLs.
  
  1. Changes
    - Updates all user_profiles where avatar_url is null
    - Extracts avatar from auth.users raw_user_meta_data
    - Only updates users who signed up with Google OAuth
  
  2. Notes
    - This is a one-time backfill for existing users
    - New users will get avatars automatically via the trigger
*/

-- Backfill avatars for existing Google OAuth users
UPDATE user_profiles up
SET avatar_url = COALESCE(
  au.raw_user_meta_data->>'avatar_url',
  au.raw_user_meta_data->>'picture'
)
FROM auth.users au
WHERE up.id = au.id
  AND up.avatar_url IS NULL
  AND (
    au.raw_user_meta_data->>'avatar_url' IS NOT NULL 
    OR au.raw_user_meta_data->>'picture' IS NOT NULL
  );
