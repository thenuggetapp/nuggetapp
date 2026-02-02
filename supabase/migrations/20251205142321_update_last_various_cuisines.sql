/*
  # Update Last Remaining Various Cuisines
  
  Final update for the last 2 restaurants that need cuisine classification.
  The remaining 5 are food halls/markets which should correctly stay as "Various".
  
  1. Anilo's Kitchen - Mediterranean
  2. ITJL Colindale Station - Kosher
*/

-- Update Mediterranean restaurant
UPDATE restaurants
SET cuisine = 'Mediterranean'
WHERE cuisine = 'Various'
AND name = 'Anilo''s Kitchen';

-- Update Kosher restaurant
UPDATE restaurants
SET cuisine = 'Kosher'
WHERE cuisine = 'Various'
AND name = 'ITJL Colindale Station';

-- The following 5 restaurants are food halls/markets and should remain as "Various":
-- - 3rd St. Market Hall
-- - Borough Market
-- - Camden Market
-- - Mare Street Market King's Cross
-- - Market Halls Oxford Street
