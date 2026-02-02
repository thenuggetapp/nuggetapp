/*
  # Add additional fields to restaurants table

  1. New Columns
    - `opening_times` (jsonb) - Store opening hours for each day of the week
    - `city` (text) - City where restaurant is located
    - `country` (text) - Country where restaurant is located
    - `google_maps_url` (text) - Direct link to Google Maps directions
    - `website_url` (text) - Restaurant's official website URL

  2. Notes
    - opening_times will store structured data like:
      {
        "monday": {"open": "09:00", "close": "22:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
        ...
      }
    - All fields are optional to allow gradual data population
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'opening_times'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN opening_times jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'city'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'country'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'google_maps_url'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN google_maps_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN website_url text;
  END IF;
END $$;

-- Create indexes for city and country filtering
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_country ON restaurants(country);

-- Update existing restaurants with city and country data
UPDATE restaurants
SET 
  city = CASE
    WHEN address LIKE '%London%' THEN 'London'
    WHEN address LIKE '%Northampton%' THEN 'Northampton'
    WHEN address LIKE '%Maidenhead%' THEN 'Maidenhead'
    ELSE 'London'
  END,
  country = 'United Kingdom'
WHERE city IS NULL;