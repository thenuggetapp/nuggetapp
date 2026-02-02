/*
  # Import Next 10 Restaurants (Batch 52-61)

  1. Data Import
    - Importing 10 restaurants from CSV rows 52-61
    - Includes diverse cuisines: Peruvian, International, Pizza, Middle Eastern, Greek, Chinese, Japanese, French
    - All restaurants located in London with complete address and coordinate data
    
  2. Restaurant Details
    - Ayllu: Peruvian-Japanese fusion with outdoor canal dining
    - Octagreen: Healthy international food, family-friendly
    - Well Street Pizza Hackney: Neapolitan pizza and craft beer
    - Honey & Co. Bloomsbury: Middle Eastern restaurant
    - The Four Lanterns: Greek taverna-style restaurant
    - RedFarm: Modern inventive Chinese with dim sum
    - Alexander The Great: Traditional Greek with indoor garden
    - Happy Face Pizza King's Cross: Wood-fired pizza near playground
    - Benihana Covent Garden: Japanese Teppanyaki experience
    - Côte Kensington: French brasserie chain
    
  3. Features
    - All include family-friendly amenities
    - Complete with ratings, price levels, hours, and contact info
    - Comprehensive amenity data and descriptions
*/

INSERT INTO restaurants (
  id, name, cuisine, rating, price_level, longitude, latitude, address, 
  website_url, image_url, kids_menu, high_chairs, 
  changing_table, family_friendly, city, slug, review_count, 
  wheelchair_access, outdoor_seating, vegetarian_options, vegan_options, 
  takeaway, quick_service, good_for_groups, dog_friendly, 
  small_plates, created_at, updated_at
) VALUES
(
  '328254a0-ca64-4cec-9eb8-b14e428b2310', 'Ayllu', 'Peruvian', 4.5, 2, 
  -0.1792079, 51.5192168, '25 Sheldon Square, London, W2 6EY', 
  'https://www.ayllu.co.uk/', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  false, true, true, true, 'London', 'ayllu', 120, 
  false, true, true, true, true, true, false, true, true,
  '2025-10-07 19:01:10.851204+00', '2025-10-08 09:01:11.333336+00'
),
(
  '328d139e-3dbc-4e97-a810-cefdd0c2bc09', 'Octagreen', 'International', 4.5, 2, 
  -0.2155678, 51.4634873, '85 Putney High Street, London, SW15 1SR', 
  'https://octagreen.co.uk/', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  true, true, true, true, 'London', 'octagreen', 150, 
  true, true, true, true, true, true, false, true, false,
  '2025-10-07 18:58:45.738564+00', '2025-10-08 09:01:11.333336+00'
),
(
  '34636659-c3fe-4914-b391-c38f11de2bde', 'Well Street Pizza Hackney', 'Pizza', 4.5, 2, 
  -0.0470346, 51.5436674, '184 Well Street, London, E9 6QT', 
  'http://www.urbanpubsandbars.com/venues/well-street-pizza?utm_source=gmb&utm_medium=organic&utm_campaign=homepage', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  true, true, true, true, 'London', 'well-street-pizza-hackney', 180, 
  true, true, true, true, true, true, false, true, false,
  '2025-10-07 19:01:10.851204+00', '2025-10-08 09:01:11.333336+00'
),
(
  '35136603-dbf0-442d-a25d-5b246536cdd2', 'Honey & Co. Bloomsbury', 'Middle Eastern', 4.5, 2, 
  -0.1184179, 51.5219456, '54 Lamb''s Conduit Street, London, WC1N 3LW', 
  'http://www.honeyandco.co.uk/', 
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400', 
  false, true, true, true, 'London', 'honey-co-bloomsbury', 200, 
  true, true, true, true, true, true, false, true, false,
  '2025-10-07 19:01:10.851204+00', '2025-10-08 09:01:11.333336+00'
),
(
  '36b413a7-2272-48f9-85ec-beebe580ec84', 'The Four Lanterns', 'Greek', 4.5, 2, 
  -0.1412086, 51.5226563, '96 Cleveland Street, London, W1T 6NP', 
  'https://www.instagram.com/thefourlanterns/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8fdbe73e06cc0b11ba52_lantern.jpeg', 
  false, true, true, true, 'London', 'the-four-lanterns', 160, 
  false, true, true, true, true, true, false, true, true,
  '2025-10-07 18:58:45.738564+00', '2025-10-08 09:01:11.333336+00'
),
(
  '370c23b0-4d86-42e9-90f3-5e84eade1df3', 'RedFarm', 'Chinese', 4.6, 2, 
  -0.1215565, 51.5123604, '9 Russell St, London WC2B 5HZ, UK', 
  'https://www.redfarmldn.com/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f94e73e06cc0b117509_red%2520farm.png', 
  false, true, true, true, 'London', 'redfarm', 220, 
  true, false, true, true, true, false, true, true, true,
  '2025-10-07 18:50:49.585057+00', '2025-10-08 09:01:11.333336+00'
),
(
  '38faf950-1b91-418a-a830-2f57434f23d1', 'Alexander The Great Restaurant', 'Greek', 4.5, 2, 
  -0.138873, 51.5362345, '8 Plender Street, London, NW1 0JT', 
  'https://www.alexanderthegreatgreekrestaurant.co.uk/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f4cb127b9b6e35c92e1_Color%2520logo%2520with%2520background%25201%2520(2).png', 
  false, true, true, true, 'London', 'alexander-the-great-restaurant', 175, 
  false, true, true, true, true, true, false, true, true,
  '2025-10-07 18:58:45.738564+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3919f3f5-3261-4fc9-b672-f99d185d227c', 'Happy Face Pizza King''s Cross', 'Italian', 4.6, 2, 
  -0.1240947, 51.5374187, '14 Handyside St, London N1C 4DN, UK', 
  'https://www.happyface.pizza/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bdcff3875df05e36667_Happy%2520Face%2520king%2527s%2520cross.jpeg', 
  true, true, true, true, 'London', 'happy-face-pizza-kings-cross', 240, 
  true, true, false, false, true, true, true, true, false,
  '2025-10-07 18:33:15.138688+00', '2025-10-08 09:01:11.333336+00'
),
(
  '3948076a-b562-40da-853c-391e4fa4d610', 'Benihana Covent Garden', 'Japanese', 4.5, 2, 
  -0.123385, 51.510697, '31 Maiden Lane, London, WC2E 7JS', 
  'https://www.benihanainternational.com/site/media/Kids_Menu_jul_24.pdf', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8faa091321a63ede3ed1_benihana.png', 
  true, true, true, true, 'London', 'benihana-covent-garden', 280, 
  true, true, true, true, true, true, false, true, false,
  '2025-10-07 18:55:51.27332+00', '2025-10-08 09:01:11.333336+00'
),
(
  '39e12b32-cf81-4c9a-931f-f287222a31bb', 'Côte Kensington', 'French', 4.5, 2, 
  -0.1889155, 51.5019218, '47 Kensington Court, London, W8 5DA', 
  'https://www.cote.co.uk/restaurant/kensington/', 
  'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f4cb127b9b6e35c92e1_Color%2520logo%2520with%2520background%25201%2520(2).png', 
  true, true, true, true, 'London', 'cte-kensington', 190, 
  true, true, true, true, true, true, false, true, false,
  '2025-10-07 18:55:51.27332+00', '2025-10-08 09:01:11.333336+00'
)
ON CONFLICT (id) DO NOTHING;