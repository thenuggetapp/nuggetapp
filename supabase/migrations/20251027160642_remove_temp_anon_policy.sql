/*
  # Remove Temporary Anon Policy

  1. Changes
    - Remove the temporary policy that allowed anon updates during migration
    - Restore proper security

  2. Security
    - Only authenticated users can update restaurants
*/

-- Remove temporary policy
DROP POLICY IF EXISTS "Temp allow anon image_url updates" ON restaurants;