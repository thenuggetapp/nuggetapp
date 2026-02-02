/*
  # Create restaurant suggestions table

  1. New Tables
    - `restaurant_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text, restaurant name)
      - `cuisine` (text, cuisine type)
      - `address` (text, street address)
      - `city` (text, city name)
      - `postcode` (text, postal code)
      - `phone` (text, optional phone number)
      - `website` (text, optional website)
      - `description` (text, why they suggest it)
      - `status` (text, pending/approved/rejected)
      - `admin_notes` (text, internal notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `restaurant_suggestions` table
    - Policy: Authenticated users can insert their own suggestions
    - Policy: Users can view their own suggestions
    - Policy: Admins can view and update all suggestions
*/

CREATE TABLE IF NOT EXISTS restaurant_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  cuisine text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  postcode text,
  phone text,
  website text,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE restaurant_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own suggestions
CREATE POLICY "Users can create suggestions"
  ON restaurant_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own suggestions
CREATE POLICY "Users can view own suggestions"
  ON restaurant_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all suggestions
CREATE POLICY "Admins can view all suggestions"
  ON restaurant_suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can update suggestions
CREATE POLICY "Admins can update suggestions"
  ON restaurant_suggestions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_restaurant_suggestions_user_id ON restaurant_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_suggestions_status ON restaurant_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_suggestions_created_at ON restaurant_suggestions(created_at DESC);