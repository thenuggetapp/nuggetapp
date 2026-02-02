/*
  # Add likes count to restaurants
  
  1. Changes
    - Add `likes_count` column to `restaurants` table to track total number of likes
    - Default value is 0
    - Create a function to automatically update likes_count when favorites are added/removed
    - Create triggers to keep the count in sync
  
  2. Notes
    - This denormalized count improves query performance
    - Triggers ensure data consistency
*/

-- Add likes_count column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Create function to update likes count
CREATE OR REPLACE FUNCTION update_restaurant_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE restaurants 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE restaurants 
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.restaurant_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for insert
DROP TRIGGER IF EXISTS trigger_favorites_insert ON favorites;
CREATE TRIGGER trigger_favorites_insert
  AFTER INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_likes_count();

-- Create trigger for delete
DROP TRIGGER IF EXISTS trigger_favorites_delete ON favorites;
CREATE TRIGGER trigger_favorites_delete
  AFTER DELETE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_likes_count();