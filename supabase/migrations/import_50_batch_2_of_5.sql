INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('0c1f0af5-1fbf-4bed-aa0f-d6d6598ca08c', 'La Porchetta Pollo Bar', 'la-porchetta-pollo-bar', 'Italian', 4.5, 0, 2, 51.5136561, -0.1303269, '20 Old Compton St, London W1D 4TW, UK', 'https://www.laporchetta.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f4a0c2cea7c01653bae_Porchetta-8.jpeg', 'London', 'UK', false, false, true, false, false, true, false, true, true, false, true, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('0d5e3394-8ebe-41f2-8ebf-c74ddfcf2ec0', 'La Gamba - Spanish Tapas Bar & Restaurant', 'la-gamba---spanish-tapas-bar-restaurant', 'Spanish', 4.5, 0, 2, 51.5062053, -0.1172521, 'Unit 3, Royal Festival Hall, Southbank Centre, London, SE1 8XX', 'http://www.lagambalondon.com/?utm_source=gmb&utm_medium=organic&utm_campaign=google-my-business', NULL, 'London', 'UK', false, false, true, true, false, false, false, true, true, false, true, true, true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('0dd69f78-44c4-41c7-954b-faf47684ea54', 'Abeno', 'abeno', 'Japanese', 4.5, 0, 2, 51.5175278, -0.1252333, '47 Museum Street, London, WC1A 1LY', 'http://www.abeno.co.uk/', NULL, 'London', 'UK', false, false, true, true, false, false, false, true, false, false, false, true, true, false, false, true, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('0ec1eff0-723c-4730-bdd7-cf329bcfa6f6', 'Comptoir Libanais', 'comptoir-libanais', 'Lebanese', 4.4, 0, 2, 51.4947102, -0.1736234, '1-5 Exhibition Rd, South Kensington, London SW7 2HE, UK', 'https://www.comptoirlibanais.com/restaurants/south-kensington', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40beb4bbe52ae3ba36a76_WhatsApp%2520Image%25202024-05-10%2520at%252016.41.26-fotor-20240510164214.jpeg', 'London', 'UK', false, true, true, false, false, true, false, true, true, false, true, true, true, true, false, false, false, true, false, false, false, true, false, false, false, false, false, true, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('11a83bf6-fb74-4af2-a6b4-683430426ece', 'The Duke of Richmond - Hackney', 'the-duke-of-richmond---hackney', 'British', 4.5, 0, 2, 51.542968, -0.0696627, '316 Queensbridge Rd, London E8 3NH, UK', 'https://www.thedukeofrichmond.com/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40be824587e0d1b3ae629_Duke%2520of%2520richmond.webp', 'London', 'UK', false, true, true, false, false, true, false, true, true, true, true, true, true, true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('16bb4291-7097-4dd1-9149-fc72325364ac', 'Gourmet Pizza Co', 'gourmet-pizza-co', 'Italian', 4.5, 0, 2, 51.508111, -0.11008, '56 Upper Ground, London, SE1 9PP', 'http://www.gourmetpizzacompany.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8fb355a7b4a334d003c2_gourmet%2520pizza%2520co.jpeg', 'London', 'UK', false, true, true, true, false, false, false, true, true, false, true, true, true, false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('16f5ded2-9005-47be-9cea-b150e91c023a', 'Thai Square Islington', 'thai-square-islington', 'Thai', 4.5, 0, 2, 51.5349221, -0.1042182, '347-349 Upper St, London N1 0PD, UK', 'http://www.thaisq.com/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f5ffd4d5b193e65e0b1_Thai%2520sq%2520islington.jpeg', 'London', 'UK', false, false, true, false, true, false, false, true, false, false, false, true, true, false, true, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('1728b58a-24a0-4546-b507-92392425bc66', 'Pizzeria Pappagone', 'pizzeria-pappagone', 'Italian', 4.6, 0, 2, 51.5694606, -0.1128574, '131 Stroud Green Rd, Finsbury Park, London N4 3PX, UK', 'https://www.instagram.com/pizzeriapappagone/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40c0d216f861a3f63e31e_pizzeria%2520pappagone%2520terrace.jpeg', 'London', 'UK', false, true, true, false, false, true, false, true, true, false, false, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('17341017-359e-492d-8a66-6533c8361e4e', 'Din Tai Fung Covent Garden', 'din-tai-fung-covent-garden', 'Chinese', 4.7, 0, 2, 51.511249, -0.1231764, '5 Henrietta St, London WC2E 8PS, UK', 'https://dintaifung-uk.com/discover/covent-garden/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f59091321a63edde0c8_din%2520tai%2520fung%2520cg.jpeg', 'London', 'UK', false, false, true, false, true, false, false, true, false, false, false, true, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('17bb7d8d-243f-4daf-8069-6a6411d2b159', 'Drake & Morgan at King''s Cross', 'drake-morgan-at-kings-cross', 'British', 4.4, 0, 2, 51.5335008, -0.1260193, '6 Pancras Sq, London N1C 4AG, UK', 'https://www.drakeandmorgan.co.uk/kings-cross/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bdf3f0c3f4e61641c65_WhatsApp%2520Image%25202024-05-10%2520at%252016.58.56.jpeg', 'London', 'UK', false, true, true, false, false, true, false, true, true, false, true, true, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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