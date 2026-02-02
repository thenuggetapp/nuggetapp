/*
  # Temporarily Allow Anon Access for Final Image Migration

  1. Changes
    - Create temporary policies to allow anon uploads and updates
    - For final image migration only

  2. Security Note
    - Will be removed after migration completes
*/

CREATE POLICY "Temp anon restaurant updates"
  ON restaurants FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can upload restaurant images" ON storage.objects;

CREATE POLICY "Temp public storage upload"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'restaurant-images');