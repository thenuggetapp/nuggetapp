/*
  # Remove Temporary Migration Policies
  
  Removes the temporary policies that were added to allow anonymous image uploads
  during the batch image fetching process. This restores normal security.
  
  Security Changes:
  - Removes temporary anon insert policy on restaurant_images table
  - Removes temporary anon upload policy on storage.objects
*/

-- Remove temporary policy for restaurant_images inserts
DROP POLICY IF EXISTS "TEMP: Allow anon insert for migration" ON restaurant_images;

-- Remove temporary policy for storage uploads
DROP POLICY IF EXISTS "TEMP: Allow anon upload for migration" ON storage.objects;
