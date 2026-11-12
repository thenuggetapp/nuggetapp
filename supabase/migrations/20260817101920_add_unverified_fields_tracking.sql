/*
  # Add local-hero verification tracking to restaurants

  ## Why
  Research-sourced restaurant data (site/Yelp/Google Maps/Instagram) can only confirm
  a subset of amenity fields. Everything else is currently indistinguishable from an
  explicit "no" once it hits the amenities form, because every boolean defaults to
  false with no way to mark "unknown, needs a local check." Data quality is the
  product's core value, so what we don't know has to be as visible as what we do.

  ## What this does
  1. Adds `unverified_fields text[]` to `restaurants` -- the list of column names
     that are still unconfirmed and need an in-person/local-hero check. Empty array
     (or null) means nothing outstanding.
  2. Adds a GIN index so "restaurants with outstanding fields" is a fast query
     (e.g. for a local-hero triage view or dashboard badge).
  3. Backfills existing rows to an empty array so nothing looks falsely "needs review."

  ## Notes
  - This is additive and non-breaking: existing reads/writes of the boolean amenity
    columns are unaffected. `unverified_fields` is just metadata about them.
  - When a local hero edits a field in the dashboard (Amenities tab), the app should
    remove that field's name from `unverified_fields` on save, since a human just
    made a confirmed decision about it -- see AmenitiesTab.tsx / the restaurant edit
    page for the client-side logic.
*/

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS unverified_fields text[] DEFAULT '{}'::text[];

UPDATE restaurants
  SET unverified_fields = '{}'::text[]
  WHERE unverified_fields IS NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_unverified_fields
  ON restaurants USING GIN (unverified_fields);

COMMENT ON COLUMN restaurants.unverified_fields IS
  'Column names on this row that are not yet confirmed by a source or a local hero -- drives the "needs review" badge/checklist in the local hero dashboard.';
