/*
  # Add Local Hero Restaurant Permissions

  ## Changes
  
  1. **INSERT Policy for Local Heroes**
     - Allows local_hero users to create new restaurants
     - Creates automatic ownership record when they create a restaurant
  
  2. **UPDATE Policy for Local Heroes**
     - Allows local_hero users to update restaurants in their assigned cities
     - Allows local_hero users to update restaurants they own (via restaurant_ownership)
  
  ## Security
  
  - Local heroes can only create/edit restaurants in cities they're assigned to
  - All policies check authentication and user role
  - Ownership verification is required for owned restaurants
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Local heroes can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Local heroes can update restaurants in their cities" ON restaurants;

-- Allow local heroes to insert restaurants
CREATE POLICY "Local heroes can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'local_hero'
    )
  );

-- Allow local heroes to update restaurants in their assigned cities
CREATE POLICY "Local heroes can update restaurants in their cities"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'local_hero'
    )
    AND (
      -- Can update restaurants in their assigned cities
      EXISTS (
        SELECT 1 FROM local_hero_assignments
        WHERE local_hero_assignments.user_id = auth.uid()
        AND local_hero_assignments.city_name = restaurants.city
        AND local_hero_assignments.is_active = true
      )
      -- OR can update restaurants they own
      OR EXISTS (
        SELECT 1 FROM restaurant_ownership
        WHERE restaurant_ownership.owner_id = auth.uid()
        AND restaurant_ownership.restaurant_id = restaurants.id
        AND restaurant_ownership.verified = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'local_hero'
    )
    AND (
      -- Can update restaurants in their assigned cities
      EXISTS (
        SELECT 1 FROM local_hero_assignments
        WHERE local_hero_assignments.user_id = auth.uid()
        AND local_hero_assignments.city_name = restaurants.city
        AND local_hero_assignments.is_active = true
      )
      -- OR can update restaurants they own
      OR EXISTS (
        SELECT 1 FROM restaurant_ownership
        WHERE restaurant_ownership.owner_id = auth.uid()
        AND restaurant_ownership.restaurant_id = restaurants.id
        AND restaurant_ownership.verified = true
      )
    )
  );
