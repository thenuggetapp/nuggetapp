/*
  # Import Restaurants Batch 72-81 (Second 10 of 20)

  1. Data Import
    - Importing restaurants from CSV rows 72-81
    - Diverse cuisines: Italian, Japanese, British, American, European, Indian, Mediterranean
    - All restaurants in London with complete location data
    
  2. Restaurant Details
    - The Jam: Italian dining since 1972 with multi-level booth seating
    - Cicchetti by San Carlo: Italian small plates in beautiful Piccadilly location
    - Tonkotsu Soho: Homemade noodles for ramen with 15 locations
    - Apricity Restaurant: Michelin Green Star British with kids tasting menu
    - The Blue Boat: Modern riverside pub in Fulham
    - Pizza Union Hoxton: Roman styled pizzas with 6 locations
    - Americana London: Southern American food with live music
    - Bread Street Kitchen - Battersea: European with free kids meals
    - Bayleaf Restaurant: North Eastern Indian with bottomless brunch
    - Beam: Mediterranean classics in Notting Hill
    
  3. Features
    - Multiple Michelin-recognized restaurants
    - Chain restaurants with multiple locations
    - Special kids meal deals and free dining options
*/

INSERT INTO restaurants (
  id, name, cuisine, rating, price_level, longitude, latitude, address, 
  website_url, image_url, kids_menu, high_chairs, 
  changing_table, family_friendly, city, slug, review_count, 
  wheelchair_access, outdoor_seating, vegetarian_options, vegan_options, 
  takeaway, quick_service, good_for_groups, dog_friendly, 
  small_plates, gluten_free_options, baby_change_unisex, baby_change_womens,
  playground_nearby, free_kids_meal, halal, created_at, updated_at
) VALUES
(
  '40e7ef3c-c92e-448f-9fa6-bd0d245ab9de', 'The Jam', 'Italian', 4.5, 2, 
  -0.1738437, 51.4852839, '289A King''s Rd, London SW3 5EW, UK', 
  'https://www.thejamrestaurant.com/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f765ddbb5a45cf94094_the%2520jam.jpeg', 
  false, true, true, true, 'London', 'the-jam', 190, 
  false, false, true, true, true, false, true, false, false, true, false, true, false, false, false,
  '2025-10-07 18:45:48.723948+00', '2025-10-08 09:01:11.333336+00'
),
(
  '411f4d15-4b45-4235-be34-e02e1237c0ad', 'Cicchetti by San Carlo - London Piccadilly', 'Italian', 4.6, 2, 
  -0.1350123, 51.5094687, '215 Piccadilly, St. James''s, London W1J 9HL, UK', 
  'https://sancarlo.co.uk/restaurants/cicchetti-london-piccadilly/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40c2b7f67db5058943288_Cicchetti.webp', 
  true, true, true, true, 'London', 'cicchetti-by-san-carlo---london-piccadilly', 310, 
  true, false, true, true, true, false, true, false, false, false, true, false, false, false, false,
  '2025-10-07 18:41:01.534021+00', '2025-10-08 09:01:11.333336+00'
),
(
  '4157ad93-5ace-4b54-a348-b6751bda6603', 'Tonkotsu Soho', 'Japanese', 4.6, 2, 
  -0.1322617, 51.5130957, '63 Dean St, London W1D 4QG, UK', 
  'https://tonkotsu.co.uk/menu/kids/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66ebf8aaa1e7988c36c3338c_Tonkotsu-PWF-0671-HDRsoho.webp', 
  true, true, true, true, 'London', 'tonkotsu-soho', 340, 
  true, true, true, true, true, false, true, true, false, false, false, true, false, false, false,
  '2025-10-07 18:51:49.258268+00', '2025-10-08 09:01:11.333336+00'
),
(
  '417cebf8-e2c8-4911-96a1-116730ad2d6b', 'Apricity Restaurant', 'British', 4.7, 2, 
  -0.1513096, 51.5135846, '68 Duke St, London W1K 6JU, UK', 
  'https://www.apricityrestaurant.com/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66faa0ebf46badf2c4a30826_Apricity.png', 
  true, true, true, true, 'London', 'apricity-restaurant', 280, 
  true, true, true, true, false, false, true, true, false, true, false, true, false, false, false,
  '2025-10-07 18:45:48.723948+00', '2025-10-08 09:01:11.333336+00'
),
(
  '43e3962b-6247-4a40-8352-29a1b57083f2', 'The Blue Boat, Fulham Reach', 'British', 4.5, 2, 
  -0.2269837, 51.4871978, 'Distillery Wharf, Parr''s Way, London, W6 9GD', 
  'https://www.theblueboat.co.uk/?utm_source=googlemybusiness&utm_medium=organic&utm_campaign=yext&utm_content=P177&y_source=1_MTIyMzcxNTctNzE1LWxvY2F0aW9uLndlYnNpdGU%3D', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  false, true, true, true, 'London', 'the-blue-boat-fulham-reach', 210, 
  true, true, true, true, false, true, false, true, false, false, false, false, false, false, false,
  '2025-10-07 19:01:10.851204+00', '2025-10-08 09:01:11.333336+00'
),
(
  '4593f71b-dfbe-49e6-9bcf-ae572223f95b', 'Pizza Union Hoxton', 'Italian', 4.0, 1, 
  -0.088495, 51.5275386, '145 City Road, London, EC1V 1AY', 
  'https://www.pizzaunion.com/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f4cb127b9b6e35c92e1_Color%2520logo%2520with%2520background%25201%2520(2).png', 
  false, true, true, true, 'London', 'pizza-union-hoxton', 160, 
  true, false, true, true, true, true, false, false, true, false, false, false, false, false, false,
  '2025-10-07 18:58:45.738564+00', '2025-10-08 09:01:11.333336+00'
),
(
  '45e8bddd-da1d-429b-ad66-87cf5b36bef4', 'Americana London', 'American', 4.5, 2, 
  -0.1316993, 51.5088186, '11 Haymarket, London, SW1Y 4BP', 
  'https://americanalondon.com/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66ebf8dd215359e34740da38_Americana-restaurant-in-London-%25C2%25A9-Nacho-Rivera-1-.webp', 
  true, true, true, true, 'London', 'americana-london', 230, 
  true, true, true, true, false, true, false, true, false, false, false, false, false, false, false,
  '2025-10-07 18:55:51.27332+00', '2025-10-08 09:01:11.333336+00'
),
(
  '466a88b8-d5f8-415a-9540-4f97c6bd8d2e', 'Bread Street Kitchen & Bar - Battersea', 'European', 4.4, 2, 
  -0.1444823, 51.4818269, 'Battersea Power Station, 1st Floor, London, England, SW11 8DD, GB', 
  'https://www.gordonramsayrestaurants.com/bread-street-kitchen/battersea/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bf3ed785208ce66372f_WhatsApp%2520Image%25202024-05-17%2520at%252015.50.54.jpeg', 
  true, true, true, true, 'London', 'bread-street-kitchen-bar---battersea', 290, 
  true, false, true, false, false, false, true, false, false, false, true, true, true, true, false,
  '2025-10-07 18:36:13.126532+00', '2025-10-08 09:01:11.333336+00'
),
(
  '46dcdbd2-13d8-4368-9957-f7d0887852f3', 'Bayleaf Restaurant', 'Indian', 4.5, 2, 
  -0.1747054, 51.6305058, '1282-1284 High Road, London, N20 9HH', 
  'https://restaurant.bayleaf.co.uk/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8fd39bf75b70961a45eb_bayleaf%2520restaurant.jpeg', 
  false, true, true, true, 'London', 'bayleaf-restaurant', 200, 
  true, false, true, true, false, true, false, false, true, false, false, false, false, false, true,
  '2025-10-07 18:58:45.738564+00', '2025-10-08 09:01:11.333336+00'
),
(
  '477c1524-8b5f-4204-9137-16bbc8549126', 'Beam', 'Mediterranean', 4.5, 2, 
  -0.1933383, 51.5151426, '103 Westbourne Grove, London W2 4UW, UK', 
  'http://cafebeam.co.uk/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40c06cad9594ee3e546c4_beam%2520notting%2520hill.jpeg', 
  true, true, true, true, 'London', 'beam', 220, 
  true, true, true, true, true, false, true, true, false, true, true, false, false, false, false,
  '2025-10-07 18:39:10.01835+00', '2025-10-08 09:01:11.333336+00'
)
ON CONFLICT (id) DO NOTHING;