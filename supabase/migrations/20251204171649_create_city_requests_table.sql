/*
  # Create City Requests Table

  1. New Tables
    - `city_requests`
      - `id` (uuid, primary key)
      - `city_name` (text, required) - Name of the requested city
      - `reason` (text, required) - User's reason for requesting the city
      - `email` (text, optional) - User's email for follow-up
      - `user_id` (uuid, optional) - Link to auth.users if user is logged in
      - `status` (text, default 'pending') - Status: pending, approved, rejected
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `admin_notes` (text, optional) - Internal notes from admin

  2. Security
    - Enable RLS on `city_requests` table
    - Allow anyone (anon or authenticated) to insert requests
    - Only admins can view all requests
    - Only admins can update status and notes

  3. Indexes
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create city_requests table
CREATE TABLE IF NOT EXISTS city_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL,
  reason text NOT NULL,
  email text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  admin_notes text
);

-- Enable RLS
ALTER TABLE city_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to submit a city request
CREATE POLICY "Anyone can submit city requests"
  ON city_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Admins can view all city requests
CREATE POLICY "Admins can view all city requests"
  ON city_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Admins can update city requests
CREATE POLICY "Admins can update city requests"
  ON city_requests
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

-- Policy: Admins can delete city requests
CREATE POLICY "Admins can delete city requests"
  ON city_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_city_requests_status ON city_requests(status);
CREATE INDEX IF NOT EXISTS idx_city_requests_created_at ON city_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_requests_user_id ON city_requests(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_city_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER city_requests_updated_at
  BEFORE UPDATE ON city_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_city_requests_updated_at();