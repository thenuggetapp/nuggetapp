/*
  # Add additional amenity columns to restaurants table

  1. New Columns
    - `baby_change_unisex` (boolean) - Baby changing facilities in unisex room
    - `baby_change_mens` (boolean) - Baby changing facilities in men's room
    - `kids_potty_toilet` (boolean) - Kids potty or child-sized toilet available
    - `pram_storage` (boolean) - Pram/stroller storage available
    - `halal` (boolean) - Halal food options available
    - `kosher` (boolean) - Kosher food options available
    - `posh` (boolean) - Upscale/posh atmosphere

  2. Notes
    - baby_change_womens already exists from previous migration
    - wheelchair_access already exists from previous migration
    - high_chairs already exists from initial table creation
    - air_conditioning already exists from previous migration
    - All new fields are boolean and default to false
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'baby_change_unisex') THEN
    ALTER TABLE restaurants ADD COLUMN baby_change_unisex boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'baby_change_mens') THEN
    ALTER TABLE restaurants ADD COLUMN baby_change_mens boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'kids_potty_toilet') THEN
    ALTER TABLE restaurants ADD COLUMN kids_potty_toilet boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'pram_storage') THEN
    ALTER TABLE restaurants ADD COLUMN pram_storage boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'halal') THEN
    ALTER TABLE restaurants ADD COLUMN halal boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'kosher') THEN
    ALTER TABLE restaurants ADD COLUMN kosher boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'posh') THEN
    ALTER TABLE restaurants ADD COLUMN posh boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for dietary requirements filtering
CREATE INDEX IF NOT EXISTS idx_restaurants_halal ON restaurants(halal) WHERE halal = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_kosher ON restaurants(kosher) WHERE kosher = true;