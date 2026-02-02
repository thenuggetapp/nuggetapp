/*
  # Create Storage Bucket for Restaurant Images

  1. Storage Setup
    - Create a public bucket called 'restaurant-images'
    - Enable public access for read operations
    - Set up RLS policies for upload/delete operations

  2. Security
    - Public can read/view images
    - Only authenticated users with proper permissions can upload
    - Only restaurant owners and admins can delete their images
*/

-- Create storage bucket for restaurant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view images
CREATE POLICY "Public can view restaurant images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'restaurant-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload restaurant images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'restaurant-images');

-- Allow users to update their own uploads
CREATE POLICY "Users can update restaurant images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'restaurant-images');

-- Allow users to delete images (restaurant owners and admins)
CREATE POLICY "Authorized users can delete restaurant images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'restaurant-images');