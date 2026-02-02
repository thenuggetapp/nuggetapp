/*
  # Update Various Cuisines - Round 3
  
  Final round of intelligent updates for restaurants with "Various" cuisine.
  
  1. Updates remaining identifiable cuisines
  2. Keeps food halls/markets as "Various" (intentional)
  3. Updates pubs, chains, and specialty restaurants
*/

-- Update Japanese restaurants
UPDATE restaurants
SET cuisine = 'Japanese'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%marugame udon%'
  OR name ILIKE '%nobu%'
);

-- Update Vegetarian restaurants
UPDATE restaurants
SET cuisine = 'Vegetarian'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%mildreds%'
  OR name ILIKE '%native foods%'
  OR name ILIKE '%octagreen%'
);

-- Update Italian restaurants
UPDATE restaurants
SET cuisine = 'Italian'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%padella%'
  OR name ILIKE '%rossopomodoro%'
  OR name ILIKE '%spaghetti house%'
  OR name ILIKE '%spagnoletti%'
  OR name ILIKE '%spacca napoli%'
);

-- Update Chinese/Asian restaurants
UPDATE restaurants
SET cuisine = 'Chinese'
WHERE cuisine = 'Various'
AND name ILIKE '%redfarm%';

-- Update Persian restaurants
UPDATE restaurants
SET cuisine = 'Persian'
WHERE cuisine = 'Various'
AND name ILIKE '%rice persian%';

-- Update Mexican restaurants
UPDATE restaurants
SET cuisine = 'Mexican'
WHERE cuisine = 'Various'
AND name ILIKE '%sonora taquería%';

-- Update Seafood restaurants
UPDATE restaurants
SET cuisine = 'Seafood'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%sotto mare%'
  OR name ILIKE '%shadowbrook%'
);

-- Update Portuguese restaurants
UPDATE restaurants
SET cuisine = 'Portuguese'
WHERE cuisine = 'Various'
AND name ILIKE '%nando%';

-- Update Burgers/American restaurants
UPDATE restaurants
SET cuisine = 'American'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%shake shack%'
  OR name ILIKE '%superdawg%'
  OR name ILIKE '%r.j. grunts%'
  OR name ILIKE '%original joe%'
  OR name ILIKE '%bad apple%'
  OR name ILIKE '%daily bird%'
  OR name ILIKE '%saz''s state house%'
  OR name ILIKE '%mothership%'
  OR name ILIKE '%pinstripes%'
  OR name ILIKE '%choo choo%'
);

-- Update Steakhouses
UPDATE restaurants
SET cuisine = 'Steakhouse'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%steak & lobster%'
  OR name ILIKE '%coal shed%'
);

-- Update Breakfast/Brunch
UPDATE restaurants
SET cuisine = 'Breakfast'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%sweet maple%'
  OR name ILIKE '%park chalet%'
  OR name ILIKE '%summer house%'
);

-- Update Dessert/Ice Cream
UPDATE restaurants
SET cuisine = 'Dessert'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%ruby violet%'
  OR name ILIKE '%mount desert island ice cream%'
);

-- Update Lebanese restaurants
UPDATE restaurants
SET cuisine = 'Middle Eastern'
WHERE cuisine = 'Various'
AND name ILIKE '%ô gourmet libanais%';

-- Update British restaurants and pubs
UPDATE restaurants
SET cuisine = 'British'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%riding house%'
  OR name ILIKE '%roast%'
  OR name ILIKE '%rondo%'
  OR name ILIKE '%scoff & banter%'
  OR name ILIKE '%searcys%'
  OR name ILIKE '%sherlock holmes%'
  OR name ILIKE '%maynard arms%'
  OR name ILIKE '%mount st. restaurant%'
  OR name ILIKE '%poppies%'
  OR name ILIKE '%rail house%'
  OR name ILIKE 'the admiralty%'
  OR name ILIKE 'the approach tavern%'
  OR name ILIKE 'the avalon%'
  OR name ILIKE 'the blue boat%'
  OR name ILIKE 'the campaner%'
  OR name ILIKE 'the churchill arms%'
  OR name ILIKE 'the crooked well%'
  OR name ILIKE 'the crown%'
  OR name ILIKE 'the delaunay%'
  OR name ILIKE 'the depot%'
  OR name ILIKE 'the duke of richmond%'
  OR name ILIKE 'the four lanterns%'
  OR name ILIKE 'the hawk''s nest%'
  OR name ILIKE 'the holly tree%'
  OR name ILIKE 'the hung drawn%'
  OR name ILIKE 'the jam%'
  OR name ILIKE 'the lock tavern%'
  OR name ILIKE 'the prince of wales%'
  OR name ILIKE 'the restaurant at sanderson%'
  OR name ILIKE 'the rosendale%'
  OR name ILIKE 'the shell%'
  OR name ILIKE 'the ship & shovell%'
  OR name ILIKE '%putt in the park%'
);

-- Update European restaurants
UPDATE restaurants
SET cuisine = 'European'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%olea social%'
  OR name ILIKE 'the maine%'
);

-- Update Indian restaurants
UPDATE restaurants
SET cuisine = 'Indian'
WHERE cuisine = 'Various'
AND name ILIKE '%taste of nawab%';

-- Update American comfort food
UPDATE restaurants
SET cuisine = 'American'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%martha dear%'
  OR name ILIKE '%purple patch%'
  OR name ILIKE '%spark social%'
  OR name ILIKE '%sugar maple%'
  OR name ILIKE '%mission rock resort%'
);

-- Update Spanish restaurants
UPDATE restaurants
SET cuisine = 'Spanish'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%saona alameda%'
  OR name ILIKE '%orxateria daniel%'
);

-- Update Asian restaurants
UPDATE restaurants
SET cuisine = 'Asian'
WHERE cuisine = 'Various'
AND name ILIKE '%monkey temple%';

-- Keep as "Various" for dog cafes and non-restaurants
UPDATE restaurants
SET cuisine = 'Cafe'
WHERE cuisine = 'Various'
AND (
  name ILIKE '%dog daycare%'
  OR name ILIKE '%love my human%'
  OR name ILIKE '%t. rex restaurant%'
  OR name ILIKE '%playgarten%'
);

-- Keep Markets and Food Halls as "Various" - this is intentional
-- Borough Market, Camden Market, Market Halls, Mare Street Market, 3rd St. Market Hall, etc.
