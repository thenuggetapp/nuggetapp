/*
  # Import Restaurants Batch 62-71 (First 10 of 20)

  1. Data Import
    - Importing restaurants from CSV rows 62-71
    - Diverse cuisines: American, International, Mediterranean, Mexican, Spanish, Food Court, Italian, Vietnamese
    - All restaurants in London with complete location data
    
  2. Restaurant Details
    - Gordon Ramsay Street Burger - Charing Cross: Burgers, ribs, wings with 6 locations
    - Brew & Barrel: International menu with changing tables
    - Chez Melissa: Mediterranean in Uxbridge with free kids meals on Jubilee weekend
    - Santo Remedio: Mexican with bottomless brunch and 3 locations
    - The Campaner: Catalonian Spanish restaurant
    - Market Halls Oxford Street: Food court with multiple bars and restaurants
    - Zizzi - One New Change: Italian chain near St Paul's
    - Pasta Remoli Ealing: Homemade pasta with lunch deals
    - Delicious Pho: Large Vietnamese near Spitalfield Market
    - Gordon Ramsay Street Pizza - St Paul's: Bottomless pizzas
    
  3. Features
    - Family-friendly amenities across all venues
    - Multiple locations for chain restaurants
    - Special meal deals and bottomless options
*/

INSERT INTO restaurants (
  id, name, cuisine, rating, price_level, longitude, latitude, address, 
  website_url, image_url, kids_menu, high_chairs, 
  changing_table, family_friendly, city, slug, review_count, 
  wheelchair_access, outdoor_seating, vegetarian_options, vegan_options, 
  takeaway, quick_service, good_for_groups, dog_friendly, 
  small_plates, gluten_free_options, baby_change_unisex, baby_change_womens,
  playground_nearby, games_available, created_at, updated_at
) VALUES
(
  '3a38b18e-e903-4ac5-b870-0f017cd60eef', 'Gordon Ramsay Street Burger - Charing Cross Road', 'American', 4.4, 2, 
  -0.1281686, 51.5108033, '24-28 Charing Cross Rd, London WC2H 0HX, UK', 
  'https://www.gordonramsayrestaurants.com/en/uk/street-burger/menus/standard', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f776f22f1b524fd2290_Gordon_Ramsay_Street_Burger_Charing_Cross_Road_%2520Interior_5.png', 
  true, true, true, true, 'London', 'gordon-ramsay-street-burger---charing-cross-road', 250, 
  false, true, true, true, true, false, true, true, false, false, true, false, false, false,
  '2025-10-07 18:45:48.723948+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3a4220cd-97da-4cf1-b028-0cb5c7ad7fed', 'Brew & Barrel', 'International', 4.0, 2, 
  -0.1418398, 51.4639736, '36A Old Town, London, SW4 0LB', 
  'https://www.brewandbarrelsw4.com/', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  false, true, true, true, 'London', 'brew-barrel', 140, 
  true, true, true, true, true, true, false, true, false, false, false, false, false, false,
  '2025-10-07 19:01:10.851204+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3afbb798-e029-4e70-af48-550206147e13', 'Chez Melissa', 'Mediterranean', 4.5, 2, 
  -0.4778063, 51.5451936, '7 High Street, Uxbridge, UB8 1JN', 
  'http://www.chezmelissarestaurant.com/', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  false, true, true, true, 'Uxbridge', 'chez-melissa', 180, 
  true, false, true, true, true, true, false, false, true, false, false, false, false, false,
  '2025-10-07 19:01:10.851204+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3b1adf1a-7f53-44a9-9b5b-d8f3efc3ae40', 'Santo Remedio - Cocina Mexicana London Bridge', 'Mexican', 4.5, 2, 
  -0.0809753, 51.5036308, '152 Tooley Street, London, SE1 2TU', 
  'https://www.santoremedio.co.uk/londonbridge', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8fa62caa58ab19548a7b_santo%2520remedio%2520london%2520bridge.png', 
  false, true, true, true, 'London', 'santo-remedio---cocina-mexicana-london-bridge', 260, 
  true, true, true, true, true, false, false, true, true, false, false, false, false, false,
  '2025-10-07 18:55:51.27332+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3befff77-b291-4f8b-b963-26aa2769ca9a', 'The Campaner', 'Spanish', 4.5, 2, 
  -0.1527674, 51.4894969, '1 Garrison Square, London, SW1W 8BG', 
  'https://www.thecampaner.com/', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  true, true, true, true, 'London', 'the-campaner', 170, 
  true, true, true, true, true, true, false, true, false, false, false, false, false, false,
  '2025-10-07 19:07:16.337445+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3db8ae21-6f50-43e0-a325-47f51e91f5cd', 'Market Halls Oxford Street', 'Food Court', 4.5, 2, 
  -0.1444112, 51.5156791, '9 Holles Street, London, W1G 0BD', 
  'https://www.markethalls.co.uk/', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  false, true, true, true, 'London', 'market-halls-oxford-street', 300, 
  true, false, true, true, true, true, false, false, true, false, false, false, false, false,
  '2025-10-07 19:01:10.851204+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3e7c1401-8a0e-401e-aa96-cc1c473173ec', 'Zizzi - One New Change (St Paul''s)', 'Italian', 4.3, 2, 
  -0.0950174, 51.5137, 'Unit SU46, New Change, London EC4M 9AF, UK', 
  'https://www.zizzi.co.uk/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40be18eb91179f8158b9e_IMG_9906.jpeg', 
  true, true, true, true, 'London', 'zizzi---one-new-change-st-pauls', 280, 
  true, false, true, true, false, false, true, false, false, true, true, false, false, false,
  '2025-10-07 18:36:13.126532+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3f907e14-3e3e-4eee-99ce-0512453f8be2', 'Pasta Remoli Ealing Broadway', 'Italian', 4.5, 2, 
  -0.3067815, 51.513808, '6 Longfield Avenue, London, W5 2TD', 
  'http://www.remoli.co.uk/', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  true, true, true, true, 'London', 'pasta-remoli-ealing-broadway', 200, 
  true, true, true, true, true, true, false, true, false, true, false, false, false, false,
  '2025-10-07 19:01:10.851204+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3fa44c41-c7b3-4706-9839-b78c0f8feb75', 'Delicious Pho', 'Vietnamese', 4.6, 2, 
  -0.0774597, 51.5188805, '3-6 Steward St, London E1 6FQ, UK', 
  'https://deliciouspho.co.uk/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bef80ffac5ddc1cb440_WhatsApp%2520Image%25202024-04-19%2520at%252015.08.26.jpeg', 
  true, true, true, true, 'London', 'delicious-pho', 320, 
  true, false, true, true, true, false, true, false, false, true, true, false, false, false,
  '2025-10-07 18:36:13.126532+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3fb91597-a8eb-47b5-bc66-5d514606c348', 'Gordon Ramsay Street Pizza - St Paul''s', 'Italian', 4.5, 2, 
  -0.0949946, 51.5133615, 'Ground Floor, 10 Bread St, London EC4M 9AJ, UK', 
  'https://www.gordonramsayrestaurants.com/en/uk/street-pizza/menus/st-paul-s', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f646a2f8e884847b20f_gordon%2520street%2520pizza%2520st%2520pauls.jpeg', 
  true, true, true, true, 'London', 'gordon-ramsay-street-pizza---st-pauls', 270, 
  true, true, true, true, true, false, true, true, false, false, true, true, false, true,
  '2025-10-07 18:43:58.706203+00', '2025-10-08 09:01:11.333336+00'
)
ON CONFLICT (id) DO NOTHING;