/*
  # Free owner onboarding: simple offers + restaurant photos

  1. coupons
    - Allow a new offer type `kids_meal` (free kids meal with each adult meal)
    - `offer_days`: days of week the offer runs (0 = Sunday … 6 = Saturday); NULL = every day
    - `offer_start_time` / `offer_end_time`: time window the offer runs; NULL = all day

  2. restaurant_gallery
    - `social_media_consent`: owner agreed Nugget may use the photo on social media
      and the restaurant's Nugget page

  3. Storage
    - Public `restaurant-photos` bucket. Files live under `<restaurant_id>/...` and can
      only be written by that restaurant's owners.
*/

ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;
ALTER TABLE coupons
  ADD CONSTRAINT coupons_discount_type_check
  CHECK (discount_type IN ('percentage', 'fixed_amount', 'kids_meal'));

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS offer_days smallint[];
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS offer_start_time time;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS offer_end_time time;

ALTER TABLE restaurant_gallery ADD COLUMN IF NOT EXISTS social_media_consent boolean NOT NULL DEFAULT false;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-photos',
  'restaurant-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view restaurant photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'restaurant-photos');

CREATE POLICY "Owners can upload their restaurant photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'restaurant-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT restaurant_id::text FROM restaurant_ownership WHERE owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Owners can delete their restaurant photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'restaurant-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT restaurant_id::text FROM restaurant_ownership WHERE owner_id = (select auth.uid())
    )
  );
