/*
  # "Verified by <restaurant>" + wider photo support

  1. restaurants.owner_verified: the owner confirmed their listing details are accurate.
     Shown publicly as "Verified by <restaurant name>". Separate from nugget_verified,
     which only the Nugget team sets.
  2. restaurant-photos bucket: also accept HEIF and GIF uploads.
*/

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS owner_verified boolean NOT NULL DEFAULT false;

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif']
WHERE id = 'restaurant-photos';

-- Drop every old discount_type check (whatever it was named) so 'kids_meal' is allowed,
-- then add back the single intended rule.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.coupons'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%discount_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.coupons DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE coupons
  ADD CONSTRAINT coupons_discount_type_check
  CHECK (discount_type IN ('percentage', 'fixed_amount', 'kids_meal'));
