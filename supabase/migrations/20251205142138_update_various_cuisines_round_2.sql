/*
  # Update Various Cuisines - Round 2
  
  Continued intelligent updates for restaurants with "Various" cuisine
  based on restaurant names and characteristics.
  
  1. Updates by restaurant chains and specific names
  2. Updates by cuisine indicators in names
  3. Keeps food halls/markets as "Various" (intentional)
*/

-- Update Italian restaurants
UPDATE restaurants
SET cuisine = 'Italian'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%carluccio%'
  OR name ILIKE '%cinquecento%'
  OR name ILIKE '%corrochio%'
  OR name ILIKE '%fiume%'
  OR name ILIKE '%franco manca%'
  OR name ILIKE '%frankie & benny%'
  OR name ILIKE '%frizzante%'
  OR name ILIKE '%gallio%'
  OR name ILIKE '%gelatorino%'
  OR name ILIKE '%homeslice%'
  OR name ILIKE '%il portico%'
  OR name ILIKE '%eataly%'
  OR name ILIKE '%mamma dough%'
  OR name ILIKE 'la merenda'
);

-- Update Mexican/Latin American restaurants
UPDATE restaurants
SET cuisine = 'Mexican'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%casa pastor%'
  OR name ILIKE '%casa tua%'
  OR name ILIKE '%cavita%'
  OR name ILIKE '%chimichurris%'
  OR name ILIKE '%hacha%'
  OR name ILIKE '%las iguanas%'
  OR name ILIKE '%latino hits%'
);

-- Update French restaurants
UPDATE restaurants
SET cuisine = 'French'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%côte%'
  OR name ILIKE 'chez %'
  OR name ILIKE 'le %'
  OR name ILIKE '%chamisse%'
  OR name ILIKE '%cave du salut%'
  OR name ILIKE '%bistretatais%'
);

-- Update Indian restaurants
UPDATE restaurants
SET cuisine = 'Indian'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%dishoom%'
  OR name ILIKE '%colonel saab%'
  OR name ILIKE '%kricket%'
  OR name ILIKE '%maharaja%'
  OR name ILIKE '%hoppers%'
);

-- Update Lebanese/Middle Eastern restaurants
UPDATE restaurants
SET cuisine = 'Middle Eastern'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%comptoir libanais%'
  OR name ILIKE '%hiba%'
  OR name ILIKE '%honey & co%'
);

-- Update Spanish restaurants
UPDATE restaurants
SET cuisine = 'Spanish'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%la gamba%'
  OR name ILIKE '%el faro%'
  OR name ILIKE '%tapas%'
);

-- Update Coffee shops
UPDATE restaurants
SET cuisine = 'Cafe'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%colectivo%'
  OR name ILIKE '%cuppapug%'
);

-- Update American restaurants (burgers, steakhouses, etc.)
UPDATE restaurants
SET cuisine = 'American'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%five guys%'
  OR name ILIKE '%flat iron%'
  OR name ILIKE '%honest burgers%'
  OR name ILIKE '%house of prime rib%'
  OR name ILIKE '%dairyland%'
  OR name ILIKE '%gott''s roadside%'
  OR name ILIKE '%gemini%'
  OR name ILIKE '%ina mae%'
  OR name ILIKE '%margie''s candies%'
  OR name ILIKE '%jerry''s sandwiches%'
  OR name ILIKE '%happy dough lucky%'
  OR name ILIKE '%lemonade restaurant%'
);

-- Update British restaurants
UPDATE restaurants
SET cuisine = 'British'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%harvester%'
  OR name ILIKE '%hungry horse%'
  OR name ILIKE '%golden chippy%'
  OR name ILIKE '%laughing halibut%'
  OR name ILIKE '%drake & morgan%'
  OR name ILIKE '%duck & waffle%'
  OR name ILIKE '%holborn dining room%'
  OR name ILIKE '%latitude restaurant%'
  OR name ILIKE '%coppa club%'
  OR name ILIKE '%de vine%'
  OR name ILIKE 'fallow'
  OR name ILIKE '%margot%'
);

-- Update Asian restaurants
UPDATE restaurants
SET cuisine = 'Asian'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%inamo%'
  OR name ILIKE '%east street by tampopo%'
  OR name ILIKE '%lers ros%'
);

-- Update Japanese restaurants
UPDATE restaurants
SET cuisine = 'Japanese'
WHERE cuisine = 'Various'
AND name ILIKE '%koya ko%';

-- Update Filipino restaurants
UPDATE restaurants
SET cuisine = 'Filipino'
WHERE cuisine = 'Various'
AND name ILIKE '%jollibee%';

-- Update Breakfast/Cafe
UPDATE restaurants
SET cuisine = 'Cafe'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%farm girl%'
  OR name ILIKE '%draughts%'
);

-- Keep food halls and markets as "Various" (intentional)
-- These include: Market Halls, Mare Street Market, Camden Market, Borough Market, 3rd St. Market Hall
-- No action needed for these
