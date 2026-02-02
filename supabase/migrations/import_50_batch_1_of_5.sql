INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('00c02b91-b5b7-4dbb-b5a8-c3daca204b69', 'Pho & Bun', 'pho-bun', 'Vietnamese', 4.5, 0, 2, 51.5119378, -0.1317572, '76 Shaftesbury Ave, London W1D 6ND, UK', 'https://phoandbun.com/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f9227e5e1298d3ba371_pho%2520and%2520bun.png', 'London', 'UK', false, false, false, false, true, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('02419492-d2ef-4a77-98f9-09f3ec955b4a', 'Bread Street Kitchen & Bar - St Paul''s', 'bread-street-kitchen-bar---st-pauls', 'European', 4.4, 0, 2, 51.5133382, -0.0950071, 'First Floor One, 10 New Change, London EC4M 9AJ, UK', 'https://www.gordonramsayrestaurants.com/bread-street-kitchen/st-pauls/book-a-table/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bd3c9b2d535f2f9e0a3_Bread%2520Street%2520St%2520Pauls.png', 'London', 'UK', false, true, true, false, false, true, false, true, false, false, false, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, true, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('02c2a8a1-c931-4460-92e4-cb3a033a6a75', 'Ciao Bella', 'ciao-bella', 'Italian', 4.5, 0, 2, 51.522993, -0.1189555, '86-90 Lamb''s Conduit Street, London, WC1N 3LZ', 'http://www.ciaobellarestaurant.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f901516d5c3aeaca5ffab_Ciao.jpeg', 'London', 'UK', false, true, true, true, false, false, false, true, true, true, true, true, true, false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('030a87d8-efd6-46c9-b0cd-780daa3d7f73', 'Dishoom Shoreditch', 'dishoom-shoreditch', 'Indian', 4.5, 0, 2, 51.524615, -0.077075, '7 Boundary Street, London, E2 7JE', 'https://www.dishoom.com/shoreditch?utm_source=google&utm_medium=organic&utm_campaign=Yext&utm_content=D2-Shoreditch&y_source=1_MjMwNDkyMDQtNzE1LWxvY2F0aW9uLndlYnNpdGU=', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8ffcc5aa4d46dad0999e_Dishoom%2520shoreditch.png', 'London', 'UK', false, true, true, true, false, false, false, true, true, false, true, true, true, false, true, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('04763181-c5b1-45a5-b33d-d3345388f8d2', 'Rail House Victoria', 'rail-house-victoria', 'European', 4.5, 0, 2, 51.4974153, -0.1434145, '8 Sir Simon Milton Sq, London SW1E 5DJ, UK', 'https://www.riding.house/restaurant/victoria', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40c28906a41b0b036b579_Rail%2520House%2520Victoria.webp', 'London', 'UK', false, true, true, false, false, true, false, true, true, false, true, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('0626ab3a-0cff-4139-8563-f7cfac3c00a7', 'Golden Dragon (Chinatown)', 'golden-dragon-chinatown', 'Chinese', 4.5, 0, 2, 51.5114322, -0.131632, '28-29 Gerrard Street, London, W1D 6JW', 'http://www.gdlondon.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8fabf2a2c4bea4ccac0c_golden%2520dragon.jpeg', 'London', 'UK', false, false, true, true, false, false, false, true, false, false, false, true, true, false, false, true, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('06f8039e-71b0-43e0-9e2d-2b4ebfb1996c', 'Rudy''s Pizza Napoletana - Shoreditch', 'rudys-pizza-napoletana---shoreditch', 'Italian', 4.7, 0, 2, 51.524341, -0.0774149, '183 Shoreditch High St, London E1 6HU, UK', 'https://www.rudyspizza.co.uk/book', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40be8dc02f44ce846baf5_WhatsApp%2520Image%25202024-05-13%2520at%252013.54.53.jpeg', 'London', 'UK', false, false, true, false, false, true, false, true, false, false, true, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('0939597b-fc52-4a61-aaa8-358e27ea4ae9', 'Latino Hits', 'latino-hits', 'Latin American', 4.5, 0, 2, 51.5510347, -0.0747835, '14 Stoke Newington Road, London, N16 7XN', NULL, NULL, 'London', 'UK', false, false, false, true, false, false, false, false, true, false, true, true, true, false, false, true, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('0a19af9a-d661-4938-8c6e-a09732d1e7ec', 'The Petersham Wine Bar & Deli', 'the-petersham-wine-bar-deli', 'Deli', 4.4, 0, 2, 51.5115618, -0.1248667, '31 King St, London WC2E 9DS, UK', 'https://thepetershamwinebar.com/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f91678d4dbffc8f8448_petersham%2520wine%2520and%2520deli.png', 'London', 'UK', false, false, true, false, true, false, false, false, true, false, true, true, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('0beb5071-93b6-4522-8a17-582db46422fa', 'Shake Shack Mansion House', 'shake-shack-mansion-house', 'American', 4.5, 0, 2, 51.5126116, -0.0938557, '45 Cannon Street, London, EC4M 9AL', 'http://www.shakeshack.co.uk/locations/london/mansion-house/?utm_source=gmb&utm_medium=organic&utm_campaign=mansion_house', NULL, 'London', 'UK', false, false, true, true, false, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      cuisine = EXCLUDED.cuisine,
      rating = EXCLUDED.rating,
      price_level = EXCLUDED.price_level,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      address = EXCLUDED.address,
      website_url = EXCLUDED.website_url,
      image_url = EXCLUDED.image_url,
      city = EXCLUDED.city;