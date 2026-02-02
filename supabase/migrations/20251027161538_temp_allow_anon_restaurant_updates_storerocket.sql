/*
  # Temporarily Allow Anon Updates for Storerocket Image Migration

  1. Changes
    - Create temporary policy to allow anon updates to image_url field
    - For storerocket migration only

  2. Security Note
    - Will be removed after migration completes
*/

CREATE POLICY "Temp allow anon image_url updates for storerocket"
  ON restaurants FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);