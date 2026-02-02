/*
  # Rename family_friendly column to nugget_verified

  1. Changes
    - Rename the `family_friendly` column in the `restaurants` table to `nugget_verified`
    - All existing data is preserved
    - Column type remains boolean with DEFAULT false
  
  2. Notes
    - This is a simple column rename operation
    - No data is lost or modified
    - All existing true/false values remain intact
*/

ALTER TABLE restaurants 
RENAME COLUMN family_friendly TO nugget_verified;