INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('193285cb-b0be-45de-b08a-ddae34803290', 'The Goring Dining Room', 'the-goring-dining-room', 'British', 4.5, 0, 4, 51.4975261, -0.145622, '15 Beeston Place, London, SW1W 0JW', 'https://www.thegoring.com/food-drink/the-dining-room/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8fb75ddbb5a45cf988aa_goring%2520dining.jpeg', 'London', 'UK', false, true, true, true, false, false, false, true, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('1a86e010-638e-429a-a6ff-acbcdb0e7514', 'The Restaurant at Sanderson London', 'the-restaurant-at-sanderson-london', 'Malaysian', 4.5, 0, 2, 51.517401, -0.137113, '50 Berners Street, London, W1T 3NG', 'https://book.ennismore.com/hotels/originals/sanderson/dining/the-restaurant?utm_source=google-gmb&utm_medium=organic&utm_campaign=gmb', NULL, 'London', 'UK', false, true, true, true, false, false, false, true, false, false, false, true, true, false, false, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('1d2cc7dd-d285-4b49-ace9-bc361072fa7b', 'Homeslice Neal''s Yard', 'homeslice-neals-yard', 'Italian', 4.6, 0, 2, 51.5146643, -0.1264717, '13 Neal''s Yard, London WC2H 9DP, UK', 'https://www.homeslicepizza.co.uk/menu', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f5b25c7cd820d7e6628_homeslice.%2520neals%2520yeard.jpeg', 'London', 'UK', false, false, true, false, true, false, false, false, true, false, true, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('1eacccf9-ac95-4468-bc3e-c0fc627ea5d2', 'Beans & Barley', 'beans-barley', 'Cafe', 4.7, 0, 1, 51.5844189, -0.1003957, '595, 597 Green Lanes, Harringay Ladder, London N8 0RE, UK', 'https://www.beansandbarley.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40be024587e0d1b3ad768_beans%2520and%2520barley.png', 'London', 'UK', false, true, true, false, false, true, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, true, true, true, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('1ebef058-6bba-45ec-b3ae-7e12aee4dcb6', 'YORI (Covent Garden)', 'yori-covent-garden', 'Korean', 4.6, 0, 2, 51.5122682, -0.1198011, '15 Catherine St, London WC2B 5LA, UK', 'https://yoriuk.com/covent-garden/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f63f5a20e567497c637_yori%2520cg.png', 'London', 'UK', false, false, true, false, true, false, false, true, false, false, false, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('1ed1cf38-6090-4a4b-b4a0-36c287ec1fbd', 'Wahaca Paddington', 'wahaca-paddington', 'Mexican', 4.5, 0, 2, 51.516533, -0.1755727, '1 Paddington Square, London, W2 1DL', 'https://www.wahaca.co.uk/location/paddington', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f90150921740dd7438ea9_wahaca%2520Paddington.jpeg', 'London', 'UK', false, true, true, true, false, false, false, true, false, false, false, true, true, false, false, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('20408f8d-92b6-480c-906a-8328d7101bd5', 'Crust Bros Pizza Restaurant Waterloo', 'crust-bros-pizza-restaurant-waterloo', 'Italian', 4.6, 0, 2, 51.5027616, -0.1103191, '113 Waterloo Rd, London SE1 8UL, UK', 'https://www.crustbros.co.uk/waterloo/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40c754384be6228248e1f_Crust%2520Bros%2520waterloo.webp', 'London', 'UK', false, true, true, false, false, true, false, true, true, false, true, true, true, true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('20c10f5e-5f3b-468a-8c66-ef8ec70907a3', 'Putt in the Park', 'putt-in-the-park', 'Cafe', 4.5, 0, 2, 51.4758814, -0.1618102, 'Albert Bridge Road, London, SW11 4NJ', 'http://www.puttinthepark.com/', NULL, 'London', 'UK', false, false, true, true, false, false, false, true, true, true, true, true, true, false, false, false, false, true, false, false, false, false, true, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('22f9dc24-3597-41b5-afc8-a6d4069d96e7', 'Pizza Express', 'pizza-express', 'Italian', 4.3, 0, 2, 51.5151236, -0.1333171, '10 Dean St, London W1D 3RW, UK', 'https://www.pizzaexpress.com/london-dean-street', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/683039ff16293d30fe5e62c1_66eb1c1fab7251b944e0284c_66e40bcc79566cf668095516_Color%25252520logo%25252520with%25252520background%252525201%25252520(2).png', 'London', 'UK', false, true, true, false, false, true, false, true, false, false, false, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, true, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('237f7678-92a7-451f-b8ff-29ea0456871d', 'Maynard Arms', 'maynard-arms', 'British', 4.5, 0, 2, 51.5817562, -0.1263013, '70 Park Road, London, N8 8SX', 'https://www.maynardarmsn8.co.uk/', NULL, 'London', 'UK', false, false, true, true, false, false, false, true, true, false, true, true, true, false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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