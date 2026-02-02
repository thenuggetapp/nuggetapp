/*
  # Update Various Cuisines - Final Round
  
  Final cleanup of remaining restaurants with "Various" cuisine.
  
  1. Updates all remaining identifiable restaurant chains
  2. Keeps food halls/markets as "Various" (intentional)
*/

-- Update Japanese restaurants
UPDATE restaurants
SET cuisine = 'Japanese'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%wagamama%'
  OR name ILIKE '%tonkotsu%'
  OR name ILIKE '%uzumaki%'
  OR name ILIKE '%wagyu house%'
  OR name ILIKE '%yank sing%'
);

-- Update Mexican restaurants
UPDATE restaurants
SET cuisine = 'Mexican'
WHERE cuisine = 'Various'
AND name ILIKE '%wahaca%';

-- Update Italian restaurants
UPDATE restaurants
SET cuisine = 'Italian'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%zizzi%'
  OR name ILIKE '%wildwood%'
);

-- Update Korean restaurants
UPDATE restaurants
SET cuisine = 'Korean'
WHERE cuisine = 'Various'
AND name ILIKE '%yori%';

-- Update Turkish restaurants
UPDATE restaurants
SET cuisine = 'Turkish'
WHERE cuisine = 'Various'
AND name ILIKE '%tower mangal%';

-- Update Indian restaurants
UPDATE restaurants
SET cuisine = 'Indian'
WHERE cuisine = 'Various'
AND name ILIKE '%the spice%';

-- Update French restaurants
UPDATE restaurants
SET cuisine = 'French'
WHERE cuisine = 'Various'
AND name ILIKE '%zazie%';

-- Update American restaurants
UPDATE restaurants
SET cuisine = 'American'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%tyler''s tender%'
  OR name ILIKE '%tupelo honey%'
  OR name ILIKE '%uncommonground%'
  OR name ILIKE '%tied house%'
  OR name ILIKE '%vennture brew%'
);

-- Update Latin American restaurants
UPDATE restaurants
SET cuisine = 'Latin American'
WHERE cuisine = 'Various'
AND name ILIKE '%toconoco%';

-- Update British pubs and restaurants
UPDATE restaurants
SET cuisine = 'British'
WHERE cuisine = 'Various'
AND (
  name ILIKE 'the three crowns%'
  OR name ILIKE '%wands & wizard%'
  OR name ILIKE '%urban social%'
  OR name ILIKE '%wild thyme%'
);

-- Keep the following as "Various" (intentional - these are markets/food halls or unclear):
-- 3rd St. Market Hall
-- Borough Market
-- Camden Market
-- Mare Street Market King's Cross
-- Market Halls Oxford Street
-- Anilo's Kitchen (unclear from name)
-- ITJL Colindale Station (unclear from name)
