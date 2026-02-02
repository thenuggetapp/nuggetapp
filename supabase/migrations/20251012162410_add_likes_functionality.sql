/*
  # Add liked column to reviews and create RPC functions
  
  1. Changes to reviews table
    - Add `liked` column (boolean, default false) to track like-only entries
  
  2. New Functions
    - `increment_likes` - Safely increments the likes_count for a restaurant
    - `decrement_likes` - Safely decrements the likes_count for a restaurant
  
  3. Notes
    - The liked column allows users to like a restaurant without writing a full review
    - RPC functions ensure atomic updates to the likes_count
*/

-- Add liked column to reviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'liked'
  ) THEN
    ALTER TABLE reviews ADD COLUMN liked boolean DEFAULT false;
  END IF;
END $$;

-- Make rating optional when liked is true
DO $$
BEGIN
  ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;
  ALTER TABLE reviews ALTER COLUMN rating DROP NOT NULL;
END $$;

-- Create function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes(restaurant_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE restaurants
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes(restaurant_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE restaurants
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;