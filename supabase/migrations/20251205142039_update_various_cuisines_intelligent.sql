/*
  # Update Various Cuisines Based on Restaurant Names
  
  This migration intelligently updates restaurants with "Various" cuisine
  by analyzing their names and applying appropriate cuisine types.
  
  1. Pattern Matching
    - Brewery/Brewing → American (Brewpub)
    - Italian names/chains → Italian
    - Greek restaurants → Greek
    - Asian restaurants → appropriate Asian cuisine
    - French restaurants → French
    - Mexican/Latin restaurants → appropriate cuisine
    - Bakery/Cafe → Cafe
    - Market/Food Hall → Various (intentionally kept)
  
  2. Updates ~341 restaurants with accurate cuisine classifications
*/

-- Update Breweries and Brewing Companies
UPDATE restaurants
SET cuisine = 'American'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%brewing%'
  OR name ILIKE '%brewery%'
  OR name ILIKE '%brewdog%'
  OR name ILIKE '%beer%'
  OR name ILIKE 'Best Place at%'
);

-- Update Italian Restaurants
UPDATE restaurants
SET cuisine = 'Italian'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%bella italia%'
  OR name ILIKE '%bella vita%'
  OR name ILIKE 'azzurro%'
  OR name ILIKE '%bocconcino%'
  OR name ILIKE '%italian%'
  OR name ILIKE '%pizza%'
  OR name ILIKE '%bread & oregano%'
  OR name ILIKE '%oregano%'
  OR name ILIKE '%pasta%'
  OR name ILIKE '%trattoria%'
  OR name ILIKE '%osteria%'
  OR name ILIKE '%ristorante%'
);

-- Update Greek Restaurants
UPDATE restaurants
SET cuisine = 'Greek'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%avli%'
  OR name ILIKE '%alexander the great%'
  OR name ILIKE '%barbounia%'
  OR name ILIKE '%greek%'
  OR name ILIKE '%taverna%'
);

-- Update Japanese Restaurants
UPDATE restaurants
SET cuisine = 'Japanese'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%abeno%'
  OR name ILIKE '%sushi%'
  OR name ILIKE '%ramen%'
  OR name ILIKE '%izakaya%'
  OR name ILIKE '%bao%'
);

-- Update Asian/Taiwanese (BAO)
UPDATE restaurants
SET cuisine = 'Asian'
WHERE cuisine = 'Various'
AND name ILIKE '%bao %';

-- Update Thai Restaurants
UPDATE restaurants
SET cuisine = 'Thai'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%busaba%'
  OR name ILIKE '%thai%'
);

-- Update Indian Restaurants
UPDATE restaurants
SET cuisine = 'Indian'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%babur%'
  OR name ILIKE '%indian%'
  OR name ILIKE '%curry%'
  OR name ILIKE '%tandoor%'
);

-- Update French Restaurants
UPDATE restaurants
SET cuisine = 'French'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%brasserie%'
  OR name ILIKE '%french%'
  OR name ILIKE '%bistro%'
  OR name ILIKE '%café de%'
);

-- Update Mexican/Latin Restaurants
UPDATE restaurants
SET cuisine = 'Mexican'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%mexican%'
  OR name ILIKE '%taco%'
  OR name ILIKE '%burrito%'
  OR name ILIKE '%cantina%'
);

-- Update Peruvian Restaurants
UPDATE restaurants
SET cuisine = 'Peruvian'
WHERE cuisine = 'Various'
AND name ILIKE '%ayllu%';

-- Update Mediterranean Restaurants
UPDATE restaurants
SET cuisine = 'Mediterranean'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%brother marcus%'
  OR name ILIKE '%mediterranean%'
  OR name ILIKE '%levant%'
);

-- Update American/BBQ Restaurants
UPDATE restaurants
SET cuisine = 'American'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%big easy%'
  OR name ILIKE '%american%'
  OR name ILIKE '%diner%'
  OR name ILIKE '%grill%'
  OR name ILIKE '%steakhouse%'
  OR name ILIKE '%bbq%'
  OR name ILIKE '%barbecue%'
);

-- Update Breakfast/Brunch spots
UPDATE restaurants
SET cuisine = 'Breakfast'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%blue''s egg%'
  OR name ILIKE '%bagelry%'
  OR name ILIKE '%luncheonette%'
  OR name ILIKE '%breakfast%'
  OR name ILIKE '%brunch%'
  OR name ILIKE 'bill''s %'
);

-- Update Cafes and Bakeries
UPDATE restaurants
SET cuisine = 'Cafe'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%café%'
  OR name ILIKE '%cafe%'
  OR name ILIKE '%coffee%'
  OR name ILIKE '%bakery%'
  OR name ILIKE '%biscuiteers%'
  OR name ILIKE '%amaranth%'
  OR name ILIKE '%bear + wolf%'
);

-- Update afternoon tea
UPDATE restaurants
SET cuisine = 'British'
WHERE cuisine = 'Various'
AND name ILIKE '%afternoon tea%';

-- Update modern European/Contemporary
UPDATE restaurants
SET cuisine = 'European'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%14 hills%'
  OR name ILIKE '%apricity%'
  OR name ILIKE '%arado%'
  OR name ILIKE '%modern european%'
);

-- Update Pubs and Bars
UPDATE restaurants
SET cuisine = 'Pub'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%pub%'
  OR name ILIKE '%bar & grill%'
  OR name ILIKE 'bar 61%'
  OR name ILIKE '%brew & barrel%'
  OR name ILIKE '%brew street%'
);

-- Special cases - American Girl Place
UPDATE restaurants
SET cuisine = 'American'
WHERE cuisine = 'Various'
AND name ILIKE '%american girl place%';

-- Keep "Various" for actual food halls and markets (intentional)
-- Borough Market, 3rd St. Market Hall, etc. should stay as "Various"
