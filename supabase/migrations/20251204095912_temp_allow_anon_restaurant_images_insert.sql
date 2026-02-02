/*
  # Temporary: Allow Anonymous Restaurant Image Inserts
  
  This migration temporarily allows anonymous users to insert restaurant images
  for the purpose of batch image fetching. Will be reverted immediately after.
  
  SECURITY WARNING: This should only be active during migration and must be
  reverted as soon as the batch operation completes.
*/

-- Temporarily allow anon to insert restaurant images
CREATE POLICY "TEMP: Allow anon insert for migration"
  ON restaurant_images FOR INSERT
  TO anon
  WITH CHECK (true);
