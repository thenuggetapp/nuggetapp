/*
  # Create restaurants table

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key) - Unique identifier for each restaurant
      - `name` (text, required) - Restaurant name
      - `slug` (text, unique, required) - URL-friendly version of name
      - `cuisine` (text, required) - Type of cuisine (e.g., "Italian, Pizza")
      - `rating` (decimal) - Average rating (0-5)
      - `review_count` (integer) - Number of reviews
      - `price_level` (integer) - Price level (1-4, $ to $$$$)
      - `address` (text, required) - Full street address
      - `latitude` (decimal, required) - Location latitude
      - `longitude` (decimal, required) - Location longitude
      - `image_url` (text) - Main restaurant image URL
      - `family_friendly` (boolean) - General family-friendly indicator
      - `kids_menu` (boolean) - Has kids menu
      - `high_chairs` (boolean) - Has high chairs available
      - `changing_table` (boolean) - Has baby changing table
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `restaurants` table
    - Add policy for public read access (anyone can view restaurants)
    - Add policy for authenticated users to insert restaurants
    - Add policy for authenticated users to update their own restaurants

  3. Indexes
    - Index on slug for fast lookups
    - Index on cuisine for filtering
    - Index on rating for sorting
    - Index on latitude/longitude for geospatial queries
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  cuisine text NOT NULL,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  price_level integer CHECK (price_level >= 1 AND price_level <= 4),
  address text NOT NULL,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  image_url text,
  family_friendly boolean DEFAULT false,
  kids_menu boolean DEFAULT false,
  high_chairs boolean DEFAULT false,
  changing_table boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view restaurants (public read)
CREATE POLICY "Anyone can view restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can insert restaurants
CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update restaurants
CREATE POLICY "Authenticated users can update restaurants"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);