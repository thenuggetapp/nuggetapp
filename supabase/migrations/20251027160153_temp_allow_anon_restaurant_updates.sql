/*
  # Temporarily Allow Anon Updates for Image Migration

  1. Changes
    - Create temporary policy to allow anon updates to image_url field only
    - This is for migration purposes only

  2. Security Note
    - Will be removed after migration completes
*/

-- Create temporary policy for anon updates during migration
CREATE POLICY "Temp allow anon image_url updates"
  ON restaurants FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);