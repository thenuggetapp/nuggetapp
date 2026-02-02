/*
  # Temporary: Allow Anonymous Storage Uploads
  
  This migration temporarily allows anonymous users to upload images to storage
  for the purpose of batch image fetching. Will be reverted immediately after.
  
  SECURITY WARNING: This should only be active during migration and must be
  reverted as soon as the batch operation completes.
*/

-- Temporarily allow anon to upload to storage
CREATE POLICY "TEMP: Allow anon upload for migration"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'restaurant-images');
