/*
  # Allow Anonymous Local Hero Applications

  1. Schema Changes
    - Make `user_id` nullable to allow anonymous applications
    - Add `email` field for anonymous applicants
    - Add `full_name` field for anonymous applicants
    - Add `city_preference` field (matches the form field name)
    - Add `bank_details` jsonb field for payment information

  2. Security Changes
    - Add policy to allow anonymous users to insert applications
    - Keep existing policies for authenticated users and admins
*/

-- Add new columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_hero_applications' AND column_name = 'email') THEN
    ALTER TABLE local_hero_applications ADD COLUMN email text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_hero_applications' AND column_name = 'full_name') THEN
    ALTER TABLE local_hero_applications ADD COLUMN full_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_hero_applications' AND column_name = 'city_preference') THEN
    ALTER TABLE local_hero_applications ADD COLUMN city_preference text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_hero_applications' AND column_name = 'bank_details') THEN
    ALTER TABLE local_hero_applications ADD COLUMN bank_details jsonb;
  END IF;
END $$;

-- Make user_id nullable (only if it's currently NOT NULL)
DO $$ BEGIN
  ALTER TABLE local_hero_applications ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create new insert policy for anonymous users (only if it doesn't exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'local_hero_applications' 
    AND policyname = 'Anonymous users can insert applications'
  ) THEN
    CREATE POLICY "Anonymous users can insert applications"
      ON local_hero_applications
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_local_hero_applications_email ON local_hero_applications(email);
