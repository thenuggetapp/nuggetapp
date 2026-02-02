/*
  # Create reviews table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key) - Unique identifier for each review
      - `user_id` (uuid, required, references user_profiles) - User who wrote the review
      - `restaurant_id` (uuid, required, references restaurants) - Reviewed restaurant
      - `rating` (integer, required) - Rating 1-5 stars
      - `comment` (text) - Review text/comments
      - `visit_date` (date) - When the user visited the restaurant
      - `created_at` (timestamptz) - When the review was created
      - `updated_at` (timestamptz) - When the review was last updated

  2. Security
    - Enable RLS on `reviews` table
    - Add policy for anyone to view reviews (public read)
    - Add policy for authenticated users to insert reviews
    - Add policy for users to update their own reviews
    - Add policy for users to delete their own reviews

  3. Constraints
    - Unique constraint on user_id + restaurant_id (one review per user per restaurant)
    - Rating must be between 1 and 5

  4. Triggers
    - Automatically update restaurant's average rating when reviews change
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  visit_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view reviews (public read)
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function: Update restaurant rating when reviews change
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE restaurants
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update rating on insert
DROP TRIGGER IF EXISTS on_review_insert ON reviews;
CREATE TRIGGER on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- Trigger: Update rating on update
DROP TRIGGER IF EXISTS on_review_update ON reviews;
CREATE TRIGGER on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- Trigger: Update rating on delete
DROP TRIGGER IF EXISTS on_review_delete ON reviews;
CREATE TRIGGER on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();