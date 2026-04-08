-- Persist only Google Place ID per Places API storage rules; photos resolved at runtime.
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS google_place_id text;

COMMENT ON COLUMN public.restaurants.google_place_id IS 'Google Place ID; photo references are not stored.';

CREATE INDEX IF NOT EXISTS idx_restaurants_google_place_id
  ON public.restaurants (google_place_id)
  WHERE google_place_id IS NOT NULL;
