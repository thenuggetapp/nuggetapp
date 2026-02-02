/*
  # Add missing amenity columns to restaurants table

  1. New Columns
    - Adds all missing boolean amenity columns that are referenced in the admin form
    - These columns were defined in migration files but not actually applied to the database
    
  2. Amenity Columns Being Added
    - `wheelchair_access` - Wheelchair accessible venue
    - `outdoor_seating` - Has outdoor seating area
    - `playground_nearby` - Playground in close proximity
    - `air_conditioning` - Air conditioned venue
    - `dog_friendly` - Allows dogs
    - `vegetarian_options` - Serves vegetarian food
    - `vegan_options` - Serves vegan food
    - `gluten_free_options` - Serves gluten-free food
    - `halal` - Serves halal food
    - `kosher` - Serves kosher food
    - `healthy_options` - Has healthy meal options
    - `small_plates` - Serves small plates/tapas style
    - `takeaway` - Offers takeaway service
    - `fun_quirky` - Fun and quirky atmosphere
    - `relaxed` - Relaxed atmosphere
    - `buzzy` - Buzzy/lively atmosphere
    - `posh` - Upscale/posh venue
    - `good_for_groups` - Good for large groups
    - `kids_coloring` - Provides coloring for kids
    - `games_available` - Has games available
    - `kids_play_space` - Dedicated kids play area
    - `kids_potty_toilet` - Has kids-size toilets
    - `teen_favourite` - Popular with teenagers
    - `quick_service` - Quick service restaurant
    - `friendly_staff` - Known for friendly staff
    - `free_kids_meal` - Offers free kids meals
    - `one_pound_kids_meal` - Offers £1 kids meals
    - `tourist_attraction_nearby` - Near tourist attractions
    - `baby_change_womens` - Baby changing in women's restroom
    - `baby_change_mens` - Baby changing in men's restroom
    - `baby_change_unisex` - Baby changing in unisex restroom
    - `pram_storage` - Has pram/stroller storage
    
  3. Notes
    - All columns default to false for existing restaurants
    - These columns enable comprehensive filtering and search functionality
*/

DO $$
BEGIN
  -- Accessibility Features
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'wheelchair_access'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN wheelchair_access boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'outdoor_seating'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN outdoor_seating boolean DEFAULT false;
  END IF;

  -- Child-Friendly Features
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'playground_nearby'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN playground_nearby boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'kids_coloring'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN kids_coloring boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'games_available'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN games_available boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'kids_play_space'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN kids_play_space boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'kids_potty_toilet'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN kids_potty_toilet boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'teen_favourite'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN teen_favourite boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'free_kids_meal'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN free_kids_meal boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'one_pound_kids_meal'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN one_pound_kids_meal boolean DEFAULT false;
  END IF;

  -- Baby Facilities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'baby_change_womens'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN baby_change_womens boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'baby_change_mens'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN baby_change_mens boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'baby_change_unisex'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN baby_change_unisex boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'pram_storage'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN pram_storage boolean DEFAULT false;
  END IF;

  -- Venue Amenities
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'air_conditioning'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN air_conditioning boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'dog_friendly'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN dog_friendly boolean DEFAULT false;
  END IF;

  -- Dietary Options
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'vegetarian_options'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN vegetarian_options boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'vegan_options'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN vegan_options boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'gluten_free_options'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN gluten_free_options boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'halal'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN halal boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'kosher'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN kosher boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'healthy_options'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN healthy_options boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'small_plates'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN small_plates boolean DEFAULT false;
  END IF;

  -- Service Features
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'takeaway'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN takeaway boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'quick_service'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN quick_service boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'good_for_groups'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN good_for_groups boolean DEFAULT false;
  END IF;

  -- Atmosphere
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'fun_quirky'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN fun_quirky boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'relaxed'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN relaxed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'buzzy'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN buzzy boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'posh'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN posh boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'friendly_staff'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN friendly_staff boolean DEFAULT false;
  END IF;

  -- Location
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'tourist_attraction_nearby'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN tourist_attraction_nearby boolean DEFAULT false;
  END IF;
END $$;