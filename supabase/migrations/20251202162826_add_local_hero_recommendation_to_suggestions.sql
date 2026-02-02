/*
  # Add local hero recommendation field to restaurant suggestions

  1. Changes
    - Add `local_hero_recommendation` column to `restaurant_suggestions` table
    - This allows local heroes to add their input on suggestions in their assigned cities

  2. Notes
    - Local heroes can review suggestions and add recommendations
    - Admin will see these recommendations when making final decisions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurant_suggestions'
    AND column_name = 'local_hero_recommendation'
  ) THEN
    ALTER TABLE restaurant_suggestions
    ADD COLUMN local_hero_recommendation text;
  END IF;
END $$;

-- Add policy for local heroes to view suggestions in their assigned cities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'restaurant_suggestions'
    AND policyname = 'Local heroes can view suggestions in their cities'
  ) THEN
    EXECUTE 'CREATE POLICY "Local heroes can view suggestions in their cities"
      ON restaurant_suggestions
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM local_hero_assignments
          WHERE local_hero_assignments.user_id = auth.uid()
          AND local_hero_assignments.city_name = restaurant_suggestions.city
          AND local_hero_assignments.is_active = true
        )
      )';
  END IF;
END $$;

-- Add policy for local heroes to update recommendations in their assigned cities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'restaurant_suggestions'
    AND policyname = 'Local heroes can update suggestions in their cities'
  ) THEN
    EXECUTE 'CREATE POLICY "Local heroes can update suggestions in their cities"
      ON restaurant_suggestions
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM local_hero_assignments
          WHERE local_hero_assignments.user_id = auth.uid()
          AND local_hero_assignments.city_name = restaurant_suggestions.city
          AND local_hero_assignments.is_active = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM local_hero_assignments
          WHERE local_hero_assignments.user_id = auth.uid()
          AND local_hero_assignments.city_name = restaurant_suggestions.city
          AND local_hero_assignments.is_active = true
        )
      )';
  END IF;
END $$;
