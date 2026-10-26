/*
  # Restaurant state / province

  1. restaurants.state: short code for the state, province, or territory (e.g. 'IL', 'ON', 'NSW').
     Used for the United States, Canada, and Australia (see lib/regions.ts). NULL elsewhere.

  2. Backfill US restaurants from their address text, e.g. "123 Main St, Chicago, IL 60601"
     or "123 Main St, IL". Only valid US state codes are used, and only for restaurants whose
     country is the US, or whose country is blank but the address has a US ZIP code.
     Those restaurants also get their country set to 'United States' (the form's value), so
     the State field shows up when they're edited.
*/

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS state text;

WITH us_codes(code) AS (
  VALUES
    ('AL'),('AK'),('AZ'),('AR'),('CA'),('CO'),('CT'),('DE'),('DC'),('FL'),('GA'),('HI'),('ID'),
    ('IL'),('IN'),('IA'),('KS'),('KY'),('LA'),('ME'),('MD'),('MA'),('MI'),('MN'),('MS'),('MO'),
    ('MT'),('NE'),('NV'),('NH'),('NJ'),('NM'),('NY'),('NC'),('ND'),('OH'),('OK'),('OR'),('PA'),
    ('RI'),('SC'),('SD'),('TN'),('TX'),('UT'),('VT'),('VA'),('WA'),('WV'),('WI'),('WY')
),
parsed AS (
  SELECT
    id,
    substring(address from ',\s*([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?\s*(?:,|$)') AS code,
    address ~ ',\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\s*(?:,|$)' AS has_zip,
    coalesce(country, '') IN ('United States', 'USA', 'US', 'United States of America', 'U.S.', 'U.S.A.') AS is_us
  FROM restaurants
  WHERE state IS NULL AND address IS NOT NULL
)
UPDATE restaurants r
SET state = p.code,
    country = 'United States'
FROM parsed p
WHERE r.id = p.id
  AND p.code IN (SELECT code FROM us_codes)
  AND (p.is_us OR (coalesce(r.country, '') = '' AND p.has_zip));
