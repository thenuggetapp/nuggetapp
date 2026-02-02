-- Fix longitude precision to support full range (-180 to 180)
-- Current: decimal(10,8) only supports -99.99999999 to 99.99999999
-- Required: decimal(11,8) to support -180.00000000 to 180.00000000

-- Check current column type
DO $$ 
BEGIN
  -- Alter the longitude column to have correct precision
  ALTER TABLE restaurants 
    ALTER COLUMN longitude TYPE decimal(11,8);
  
  RAISE NOTICE 'Longitude column precision updated to decimal(11,8)';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating longitude precision: %', SQLERRM;
END $$;

-- Verify the change
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type || '(' || numeric_precision || ',' || numeric_scale || ')' 
  INTO col_type
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'restaurants' 
    AND column_name = 'longitude';
  
  RAISE NOTICE 'Current longitude type: %', col_type;
END $$;


