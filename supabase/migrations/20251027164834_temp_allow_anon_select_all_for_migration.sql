/*
  # Temporarily Allow Anon to Select All Restaurants

  1. Changes
    - Create temporary policy to allow anon to see all restaurants
    - For final image migration only

  2. Security Note
    - Will be removed after migration completes
*/

CREATE POLICY "Temp allow anon to view all restaurants"
  ON restaurants FOR SELECT
  TO anon
  USING (true);