/*
  # Fix Storage Upload Policy

  1. Changes
    - Drop the existing restrictive upload policy
    - Create a more permissive policy that allows all authenticated users to upload
    - This is needed for the migration script to work

  2. Security
    - Still requires authentication
    - Public can still only read images
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can upload restaurant images" ON storage.objects;

-- Create new permissive upload policy for migration
CREATE POLICY "Allow authenticated uploads to restaurant images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'restaurant-images'
  );