/*
  # Create favorites table

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key) - Unique identifier for each favorite
      - `user_id` (uuid, required, references user_profiles) - User who favorited
      - `restaurant_id` (uuid, required, references restaurants) - Favorited restaurant
      - `created_at` (timestamptz) - When the restaurant was favorited

  2. Security
    - Enable RLS on `favorites` table
    - Add policy for users to view their own favorites
    - Add policy for users to insert their own favorites
    - Add policy for users to delete their own favorites

  3. Constraints
    - Unique constraint on user_id + restaurant_id (prevent duplicate favorites)
    - Foreign key constraints with cascade delete
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant_id ON favorites(restaurant_id);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);