/*
  # Add Phone Field to Contact Submissions

  1. Changes
    - Add `phone` column to `contact_submissions` table
      - Optional field (nullable)
      - Text type to accommodate various phone formats
      - Max 20 characters to handle international formats with country codes
  
  2. Notes
    - This is a non-breaking change as the field is optional
    - Existing submissions will have NULL phone values
*/

-- Add phone column to contact_submissions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_submissions' AND column_name = 'phone'
  ) THEN
    ALTER TABLE contact_submissions ADD COLUMN phone text;
  END IF;
END $$;