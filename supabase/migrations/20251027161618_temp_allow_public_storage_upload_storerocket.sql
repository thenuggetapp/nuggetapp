/*
  # Temporarily Allow Public Storage Uploads for Storerocket Migration

  1. Changes
    - Create temporary policy to allow public uploads for storerocket migration
    - Will be removed after migration

  2. Security Note
    - Temporary only for migration
*/

DROP POLICY IF EXISTS "Authenticated users can upload restaurant images" ON storage.objects;

CREATE POLICY "Temp public upload for storerocket migration"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'restaurant-images');