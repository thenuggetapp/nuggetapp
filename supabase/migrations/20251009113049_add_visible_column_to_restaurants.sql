/*
  # Add visible column to restaurants table

  1. Changes
    - Add `visible` boolean column to `restaurants` table
    - Default value is `true` (restaurants are visible by default)
    - Update existing restaurants to be visible
  
  2. Purpose
    - Allow admins to hide/show restaurants without deleting them
    - Enables draft functionality and content management
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'visible'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN visible boolean DEFAULT true;
  END IF;
END $$;

UPDATE restaurants SET visible = true WHERE visible IS NULL;