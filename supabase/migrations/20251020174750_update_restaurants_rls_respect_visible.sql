/*
  # Update Restaurants RLS Policy to Respect Visible Column

  1. Changes
    - Drop existing "Anyone can view restaurants" policy
    - Create new policy that only shows visible restaurants to public
    - Authenticated users can still see all restaurants (for admin/owner purposes)
  
  2. Security
    - Public users can only see restaurants where visible = true
    - Authenticated users can see all restaurants
    - Maintains existing insert/update/delete policies
*/

-- Drop the old policy that shows all restaurants
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;

-- Create new policy: Public can only view visible restaurants
CREATE POLICY "Public can view visible restaurants"
  ON restaurants
  FOR SELECT
  TO public
  USING (visible = true);

-- Create new policy: Authenticated users can view all restaurants
CREATE POLICY "Authenticated users can view all restaurants"
  ON restaurants
  FOR SELECT
  TO authenticated
  USING (true);
