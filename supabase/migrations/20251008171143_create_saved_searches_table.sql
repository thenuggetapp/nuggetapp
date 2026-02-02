/*
  # Create saved_searches table

  1. New Tables
    - `saved_searches`
      - `id` (uuid, primary key) - Unique identifier for each saved search
      - `user_id` (uuid, required, references user_profiles) - User who saved the search
      - `query` (text, required) - Search query text
      - `filters` (jsonb) - Applied filters (cuisine, price level, amenities, etc.)
      - `location` (text) - Search location/address
      - `latitude` (decimal) - Search center latitude
      - `longitude` (decimal) - Search center longitude
      - `created_at` (timestamptz) - When the search was saved

  2. Security
    - Enable RLS on `saved_searches` table
    - Add policy for users to view their own saved searches
    - Add policy for users to insert their own saved searches
    - Add policy for users to delete their own saved searches

  3. Indexes
    - Index on user_id for faster user-specific queries
    - Index on created_at for sorting by recency
*/

CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  query text NOT NULL,
  filters jsonb DEFAULT '{}',
  location text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON saved_searches(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own saved searches
CREATE POLICY "Users can view own saved searches"
  ON saved_searches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own saved searches
CREATE POLICY "Users can insert own saved searches"
  ON saved_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own saved searches
CREATE POLICY "Users can delete own saved searches"
  ON saved_searches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);