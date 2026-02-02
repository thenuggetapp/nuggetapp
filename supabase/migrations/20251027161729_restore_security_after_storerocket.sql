/*
  # Restore Security After Storerocket Migration

  1. Changes
    - Remove temporary policies
    - Restore proper authenticated-only policies

  2. Security
    - Only authenticated users can upload/update
    - Public can read
*/

-- Remove temporary policies
DROP POLICY IF EXISTS "Temp allow anon image_url updates for storerocket" ON restaurants;
DROP POLICY IF EXISTS "Temp public upload for storerocket migration" ON storage.objects;

-- Restore proper authenticated upload policy
CREATE POLICY "Authenticated users can upload restaurant images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'restaurant-images');