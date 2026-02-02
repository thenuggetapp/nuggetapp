/*
  # Add phone and description columns to restaurants table

  1. Changes
    - Add `phone` column (text) to store restaurant phone numbers
    - Add `description` column (text) to store restaurant descriptions
  
  2. Notes
    - Both columns are nullable to allow gradual data population
    - Existing records will have NULL values until updated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'phone'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'description'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN description text;
  END IF;
END $$;