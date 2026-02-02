/*
  # Add amenities and features to restaurants table

  1. New Columns - Facilities & Accessibility
    - `wheelchair_access` (boolean) - Wheelchair accessible
    - `baby_change_womens` (boolean) - Baby changing facilities in women's restroom
    - `outdoor_seating` (boolean) - Has outdoor seating area
    - `playground_nearby` (boolean) - Playground nearby
    - `air_conditioning` (boolean) - Air conditioning available
    - `dog_friendly` (boolean) - Dogs allowed

  2. New Columns - Menu Options
    - `vegetarian_options` (boolean) - Vegetarian menu options available
    - `vegan_options` (boolean) - Vegan menu options available
    - `gluten_free_options` (boolean) - Gluten-free menu options available
    - `small_plates` (boolean) - Small sharing plates available
    - `healthy_options` (boolean) - Healthy menu options

  3. New Columns - Atmosphere & Style
    - `fun_quirky` (boolean) - Fun or quirky atmosphere
    - `relaxed` (boolean) - Relaxed atmosphere
    - `buzzy` (boolean) - Buzzy/lively atmosphere
    - `good_for_groups` (boolean) - Good for large groups

  4. New Columns - Kids Features
    - `kids_coloring` (boolean) - Kids' coloring activities available
    - `games_available` (boolean) - Games available
    - `kids_play_space` (boolean) - Dedicated kids' play space
    - `teen_favourite` (boolean) - Popular with teenagers

  5. New Columns - Service
    - `quick_service` (boolean) - Quick service available
    - `friendly_staff` (boolean) - Known for friendly staff

  6. Notes
    - All fields are boolean (true/false) for easy filtering
    - All fields default to false
    - Existing high_chairs and kids_menu fields remain unchanged
    - Indexes created for commonly filtered amenities
*/

DO $$
BEGIN
  -- Facilities & Accessibility
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'wheelchair_access') THEN
    ALTER TABLE restaurants ADD COLUMN wheelchair_access boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'baby_change_womens') THEN
    ALTER TABLE restaurants ADD COLUMN baby_change_womens boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'outdoor_seating') THEN
    ALTER TABLE restaurants ADD COLUMN outdoor_seating boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'playground_nearby') THEN
    ALTER TABLE restaurants ADD COLUMN playground_nearby boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'air_conditioning') THEN
    ALTER TABLE restaurants ADD COLUMN air_conditioning boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'dog_friendly') THEN
    ALTER TABLE restaurants ADD COLUMN dog_friendly boolean DEFAULT false;
  END IF;

  -- Menu Options
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'vegetarian_options') THEN
    ALTER TABLE restaurants ADD COLUMN vegetarian_options boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'vegan_options') THEN
    ALTER TABLE restaurants ADD COLUMN vegan_options boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'gluten_free_options') THEN
    ALTER TABLE restaurants ADD COLUMN gluten_free_options boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'small_plates') THEN
    ALTER TABLE restaurants ADD COLUMN small_plates boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'healthy_options') THEN
    ALTER TABLE restaurants ADD COLUMN healthy_options boolean DEFAULT false;
  END IF;

  -- Atmosphere & Style
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'fun_quirky') THEN
    ALTER TABLE restaurants ADD COLUMN fun_quirky boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'relaxed') THEN
    ALTER TABLE restaurants ADD COLUMN relaxed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'buzzy') THEN
    ALTER TABLE restaurants ADD COLUMN buzzy boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'good_for_groups') THEN
    ALTER TABLE restaurants ADD COLUMN good_for_groups boolean DEFAULT false;
  END IF;

  -- Kids Features
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'kids_coloring') THEN
    ALTER TABLE restaurants ADD COLUMN kids_coloring boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'games_available') THEN
    ALTER TABLE restaurants ADD COLUMN games_available boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'kids_play_space') THEN
    ALTER TABLE restaurants ADD COLUMN kids_play_space boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'teen_favourite') THEN
    ALTER TABLE restaurants ADD COLUMN teen_favourite boolean DEFAULT false;
  END IF;

  -- Service
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'quick_service') THEN
    ALTER TABLE restaurants ADD COLUMN quick_service boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'friendly_staff') THEN
    ALTER TABLE restaurants ADD COLUMN friendly_staff boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for commonly filtered amenities
CREATE INDEX IF NOT EXISTS idx_restaurants_wheelchair_access ON restaurants(wheelchair_access) WHERE wheelchair_access = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_vegetarian ON restaurants(vegetarian_options) WHERE vegetarian_options = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_vegan ON restaurants(vegan_options) WHERE vegan_options = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_gluten_free ON restaurants(gluten_free_options) WHERE gluten_free_options = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_outdoor_seating ON restaurants(outdoor_seating) WHERE outdoor_seating = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_dog_friendly ON restaurants(dog_friendly) WHERE dog_friendly = true;