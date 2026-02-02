/*
  # Temporarily Allow Public Storage Uploads for Migration

  1. Changes
    - Create a temporary policy to allow public uploads during migration
    - This will be removed after migration is complete

  2. Security Note
    - This is ONLY for migration purposes
    - Should be removed after migration completes
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Allow authenticated uploads to restaurant images" ON storage.objects;

-- Temporarily allow public uploads for migration
CREATE POLICY "Temporary public upload for migration"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'restaurant-images');