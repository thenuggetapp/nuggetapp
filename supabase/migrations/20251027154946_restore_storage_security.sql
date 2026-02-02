/*
  # Restore Proper Storage Security

  1. Changes
    - Remove temporary public upload policy
    - Restore proper authenticated-only upload policy
    - Maintain public read access

  2. Security
    - Only authenticated users can upload
    - Public can read/view images
    - Authenticated users can update/delete
*/

-- Remove temporary public upload policy
DROP POLICY IF EXISTS "Temporary public upload for migration" ON storage.objects;

-- Restore proper authenticated upload policy
CREATE POLICY "Authenticated users can upload restaurant images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'restaurant-images');