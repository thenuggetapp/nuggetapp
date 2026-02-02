INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2447df98-c938-4ad6-9db7-1ec90f62beab', 'Bocconcino Soho', 'bocconcino-soho', 'Italian', 4.5, 0, 2, 51.5147129, -0.1372864, '59 Great Marlborough Street, London, W1F 7JY', 'https://bocconcinorestaurant.co.uk/soho', NULL, 'London', 'UK', false, true, true, true, false, false, false, true, false, false, false, true, true, false, false, true, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('245353cf-f2ad-4228-87f1-b7e0b83e7e9b', 'Brags and Brams', 'brags-and-brams', 'Vegan', 4, 0, 1, -0.0685801, 51.5311982, '265 Hackney Road', 'http://www.bragsandbrams.com/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bc62047f2460f93c27e_2%2BA07I8846%2Bweb.jpeg', 'London', 'UK', true, true, true, false, true, false, false, true, false, true, true, true, true, false, false, false, true, true, false, true, true, true, false, false, true, true, false, false, true, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('26a891ae-3eb7-4e11-a2b7-8f53ecb60be2', 'Mare Street Market', 'mare-street-market', 'Market', 4.4, 0, 1, 51.5378374, -0.0572332, '117 Mare St, London E8 4RU, UK', 'http://marestreetmarket.com/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bd85b1e61411ba5ec6d_326346646_188636983814007_8552416435337232144_n.jpeg', 'London', 'UK', false, false, true, false, true, true, false, true, true, true, true, true, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('26c16252-423c-4a91-b782-721f9fdad532', 'The Hung Drawn & Quartered, EC3', 'the-hung-drawn-quartered-ec3', 'British', 4.4, 0, 2, 51.5096011, -0.0807812, '26-27 Great Tower St, London EC3R 5AQ, UK', 'https://www.hung-drawn-and-quartered.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f50024a12f1cbc31f2c_Hung%2520drawn%2520Fullers_HDQ_AnnabelStaff_240627_121706_5008.jpeg', 'London', 'UK', false, false, true, false, false, true, false, true, false, false, true, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, true, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('26dbf0ac-ca59-4f48-9cbf-dc4f48d99182', 'Riding House Fitzrovia', 'riding-house-fitzrovia', 'European', 4.5, 0, 2, 51.5183145, -0.1406117, '43-51 Great Titchfield St., London W1W 7PQ, UK', 'https://www.riding.house/restaurant/fitzrovia', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bc8094c2560127ae1b0_Riding%2520house%2520fitzrovia.jpeg', 'London', 'UK', false, true, true, false, false, true, false, true, true, false, true, true, true, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2700a0de-5fd6-4633-bccd-9be2cc6c4567', 'Borough Market', 'borough-market', 'Market', 4.5, 0, 1, 51.5055826, -0.0904808, 'Borough Market, London, SE1 9AL', 'https://boroughmarket.org.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f4cb127b9b6e35c92e1_Color%2520logo%2520with%2520background%25201%2520(2).png', 'London', 'UK', false, false, false, true, false, false, false, true, false, false, false, true, true, false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('284a8bbe-093a-408a-9206-0cb457c4c796', 'Toconoco', 'toconoco', 'Japanese', 4.7, 0, 2, 51.5383498, -0.0783027, 'unit a, 28 Hertford Rd, London N1 5QT, UK', 'https://www.toconoco.com/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f9741bb758261a4454d_img_8320-fotor-202406141547.jpeg', 'London', 'UK', false, false, true, false, true, false, false, true, true, true, true, true, true, true, false, false, false, true, false, false, false, true, true, true, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2add088b-aa9f-413f-b9d0-185a92b88dca', 'Frankie & Benny''s', 'frankie-bennys', 'American', 4.2, 0, 2, 51.5111981, -0.1200557, '355-357 Strand, London WC2R 0HR, UK', 'https://www.frankieandbennys.com/restaurants/London/burleigh-house', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f4cb127b9b6e35c92e1_Color%2520logo%2520with%2520background%25201%2520(2).png', 'London', 'UK', false, true, true, false, true, false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2bf1395f-d77f-4eb8-aed2-d26cc417b326', 'The Avalon', 'the-avalon', 'British', 4.5, 0, 2, 51.4506759, -0.1480247, '16 Balham Hill, London, SW12 9EB', 'http://www.theavalonlondon.com/', NULL, 'London', 'UK', false, false, true, true, false, false, false, true, true, false, true, true, true, false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2d0160bc-9953-4db0-86d3-9e520434dc82', 'Grumpy''s Bar + Wood Fired Pizza', 'grumpys-bar-wood-fired-pizza', 'Italian', 4.6, 0, 2, 53.8137792, -1.6710782, '2 Old Combing, Sunnybank Mills, Farsley, Pudsey LS28 5UJ, UK', 'https://www.grumpysleeds.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40c16cad9594ee3e55f82_Screenshot%25202024-06-05%2520181959.png', 'Pudsey', 'UK', false, true, true, false, false, true, false, true, true, false, true, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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