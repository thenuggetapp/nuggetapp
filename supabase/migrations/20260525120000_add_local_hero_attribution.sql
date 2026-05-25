-- Add local hero attribution to restaurants and website to user profiles

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS added_by_user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_added_by_user_id
ON restaurants(added_by_user_id);

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS website text;
