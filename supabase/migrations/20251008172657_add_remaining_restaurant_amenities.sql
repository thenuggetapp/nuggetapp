/*
  # Add remaining amenity columns to restaurants table

  1. New Columns
    - `takeaway` (boolean) - Takeaway service available
    - `free_kids_meal` (boolean) - Free kids meal offer available
    - `one_pound_kids_meal` (boolean) - £1 kids meal offer available
    - `tourist_attraction_nearby` (boolean) - Tourist attraction nearby

  2. Notes
    - The following fields already exist from previous migrations:
      - good_for_groups
      - friendly_staff
      - small_plates
      - kids_menu
      - playground_nearby
      - teen_favourite
      - dog_friendly
      - kids_coloring
      - games_available
      - kids_play_space
    - All new fields are boolean and default to false
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'takeaway') THEN
    ALTER TABLE restaurants ADD COLUMN takeaway boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'free_kids_meal') THEN
    ALTER TABLE restaurants ADD COLUMN free_kids_meal boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'one_pound_kids_meal') THEN
    ALTER TABLE restaurants ADD COLUMN one_pound_kids_meal boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'tourist_attraction_nearby') THEN
    ALTER TABLE restaurants ADD COLUMN tourist_attraction_nearby boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for value offers
CREATE INDEX IF NOT EXISTS idx_restaurants_free_kids_meal ON restaurants(free_kids_meal) WHERE free_kids_meal = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_one_pound_kids_meal ON restaurants(one_pound_kids_meal) WHERE one_pound_kids_meal = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_takeaway ON restaurants(takeaway) WHERE takeaway = true;