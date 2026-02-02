/*
  # Restore All Security After Final Migration

  1. Changes
    - Remove all temporary policies
    - Restore proper security policies

  2. Security
    - Public can only see visible restaurants
    - Only authenticated users can upload/update
*/

-- Remove temporary policies
DROP POLICY IF EXISTS "Temp allow anon to view all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Temp anon restaurant updates" ON restaurants;
DROP POLICY IF EXISTS "Temp public storage upload" ON storage.objects;

-- Restore proper authenticated upload policy
CREATE POLICY "Authenticated users can upload restaurant images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'restaurant-images');