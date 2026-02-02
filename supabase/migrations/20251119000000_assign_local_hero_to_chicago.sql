-- Drop ALL existing local hero update policies (in case there are variations)
DROP POLICY IF EXISTS "Local heroes can update restaurants in their cities" ON restaurants CASCADE;
DROP POLICY IF EXISTS "Local heroes can update restaurants" ON restaurants CASCADE;
DROP POLICY IF EXISTS "Local heroes update policy" ON restaurants CASCADE;

-- Now create the fixed policy
CREATE POLICY "Local heroes can update restaurants in their cities"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_hero' AND
    (
      EXISTS (
        SELECT 1 FROM local_hero_assignments
        WHERE user_id = auth.uid()
          AND city_name = restaurants.city
          AND is_active = true
      )
      OR
      EXISTS (
        SELECT 1 FROM restaurant_ownership
        WHERE owner_id = auth.uid()
          AND restaurant_id = restaurants.id
          AND verified = true
      )
    )
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_hero'
  );