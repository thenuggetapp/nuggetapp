/*
  # Add Google Avatar to User Profiles

  Updates the `handle_new_user()` trigger to capture Google profile pictures.
  
  1. Changes
    - Modify trigger to extract `avatar_url` or `picture` from Google OAuth metadata
    - Store it in the user_profiles.avatar_url field
  
  2. Notes
    - Google provides profile pictures in `raw_user_meta_data->>'avatar_url'` or `picture`
    - This will automatically populate for new Google sign-ins
    - Existing users can be backfilled separately if needed
*/

-- Update the trigger function to capture avatar from Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
