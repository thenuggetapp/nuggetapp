/*
  # Create local_hero_applications table

  1. New Tables
    - `local_hero_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `city` (text)
      - `experience` (text)
      - `motivation` (text)
      - `social_media` (text, optional)
      - `status` (text: pending, approved, rejected)
      - `submitted_at` (timestamptz)
      - `reviewed_at` (timestamptz, optional)
      - `reviewed_by` (uuid, optional, foreign key to user_profiles)
      - `notes` (text, optional)
  
  2. Security
    - Enable RLS on `local_hero_applications` table
    - Add policy for authenticated users to insert their own applications
    - Add policy for authenticated users to view their own applications
    - Add policy for admins to view all applications
    - Add policy for admins to update applications
*/

CREATE TABLE IF NOT EXISTS local_hero_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  city text NOT NULL,
  experience text NOT NULL,
  motivation text NOT NULL,
  social_media text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES user_profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE local_hero_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert own application"
  ON local_hero_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON local_hero_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON local_hero_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can update applications
CREATE POLICY "Admins can update applications"
  ON local_hero_applications
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
CREATE INDEX IF NOT EXISTS idx_local_hero_applications_user_id ON local_hero_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_local_hero_applications_status ON local_hero_applications(status);
CREATE INDEX IF NOT EXISTS idx_local_hero_applications_submitted_at ON local_hero_applications(submitted_at DESC);