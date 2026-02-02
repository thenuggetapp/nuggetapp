/*
  # Create Restaurant Images Table

  1. New Table
    - `restaurant_images`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `image_url` (text, the image URL)
      - `is_featured` (boolean, whether this is the featured image)
      - `display_order` (integer, order for slideshow)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Public can view images
    - Authenticated users can insert images
    - Admins and local heroes can manage all images
    - Owners can manage their restaurant images

  3. Indexes
    - Index on restaurant_id for fast lookups
    - Index on is_featured for finding featured images
*/

-- Create restaurant_images table
CREATE TABLE IF NOT EXISTS restaurant_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_images_restaurant_id ON restaurant_images(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_images_featured ON restaurant_images(restaurant_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_restaurant_images_order ON restaurant_images(restaurant_id, display_order);

-- Enable RLS
ALTER TABLE restaurant_images ENABLE ROW LEVEL SECURITY;

-- Public can view images
CREATE POLICY "Public can view restaurant images"
  ON restaurant_images FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert images
CREATE POLICY "Authenticated users can insert restaurant images"
  ON restaurant_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins and local heroes can update all images
CREATE POLICY "Admins and local heroes can update restaurant images"
  ON restaurant_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'local_hero')
    )
  );

-- Admins and local heroes can delete all images
CREATE POLICY "Admins and local heroes can delete restaurant images"
  ON restaurant_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'local_hero')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_restaurant_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_restaurant_images_updated_at
  BEFORE UPDATE ON restaurant_images
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_images_updated_at();

-- Function to ensure only one featured image per restaurant
CREATE OR REPLACE FUNCTION ensure_single_featured_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = true THEN
    UPDATE restaurant_images
    SET is_featured = false
    WHERE restaurant_id = NEW.restaurant_id
    AND id != NEW.id
    AND is_featured = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure single featured image
CREATE TRIGGER ensure_single_featured_image
  BEFORE INSERT OR UPDATE ON restaurant_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_featured_image();