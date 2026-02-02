INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2d7b3466-191e-4f37-bd1d-85dccc2dba8f', 'Solar Sisters - Zero Waste - Refill - Café', 'solar-sisters---zero-waste---refill---caf', 'Cafe', 4, 0, 1, -0.5708077, 51.2367316, '86 North St, Guildford GU1 4AU, UK', 'https://www.solarsisters.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f4cb127b9b6e35c92e1_Color%2520logo%2520with%2520background%25201%2520(2).png', 'Guildford', 'UK', true, true, true, false, false, true, false, true, false, false, true, true, true, false, false, true, true, true, true, true, false, true, false, false, true, true, false, false, true, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2dd37cef-3d20-4da2-838c-50c56cd0c7ea', 'Dishoom Kensington', 'dishoom-kensington', 'Indian', 4.5, 0, 2, 51.5012647, -0.191139, '4 Derry Street, London, W8 5SE', 'https://www.dishoom.com/kensington/?utm_source=google&utm_medium=organic&utm_campaign=Yext&utm_content=D6-Kensington&y_source=1_MjMwNDkyMDctNzE1LWxvY2F0aW9uLndlYnNpdGU%3D', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f9012765fd2652b3e23e3_Dishoom%2520Kensington.png', 'London', 'UK', false, true, true, true, false, false, false, true, false, false, false, true, true, false, true, true, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2e6da3bb-3d22-4476-aa9b-4d0582cde73d', 'Steak & Lobster Warren Street', 'steak-lobster-warren-street', 'Steakhouse', 4.5, 0, 3, 51.5241393, -0.1380835, '130 Tottenham Court Road, London, W1T 5AY', 'https://www.steakandlobster.com/location/warren-street', NULL, 'London', 'UK', false, true, true, true, false, false, false, true, true, false, true, true, true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2f2ddfaf-a9bb-4bf5-b04b-9aeef2848e58', 'Harvester Grange Park Northampton', 'harvester-grange-park-northampton', 'British', 4.2, 0, 2, 52.1861434, -0.8916148, 'Loake Cl, Northampton NN4 5EZ, UK', 'https://www.harvester.co.uk/restaurants/eastandwestmidlands/harvestergrangeparknorthampton', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/683039ff16293d30fe5e62c1_66eb1c1fab7251b944e0284c_66e40bcc79566cf668095516_Color%25252520logo%25252520with%25252520background%252525201%25252520(2).png', 'Northampton', 'UK', false, true, true, false, false, true, false, true, true, false, true, true, true, false, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('2f713fef-6866-45df-baf7-de2cb4db3022', 'Del74 Tacos', 'del74-tacos', 'Mexican', 4.5, 0, 2, 51.5504022, -0.0753334, '129 Kingsland High Street, London, E8 2PB', 'https://www.tacosdel74.com/', NULL, 'London', 'UK', false, false, true, true, false, false, false, true, true, false, true, true, true, false, false, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('304dffe9-9a3d-463d-b811-37b404cb1966', 'Rossopomodoro Covent Garden', 'rossopomodoro-covent-garden', 'Italian', 4.5, 0, 2, 51.5130036, -0.1272604, '50-52 Monmouth St, London WC2H 9EP, UK', 'https://www.rossopomodoro.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8f4ed657cea8fc0b0253_Rossopomodoro.jpeg', 'London', 'UK', false, true, true, false, false, true, false, false, true, false, true, true, true, false, true, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('30565309-f28f-480c-a864-52ddfd6aa890', 'Pizzeria Bel-Sit', 'pizzeria-bel-sit', 'Italian', 4.5, 0, 2, 51.6098818, 0.0217276, '439-441, High Rd, Woodford, Woodford Green IG8 0XE, UK', 'https://belsit.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40c103322a38c3519e407_Belsit%2520pizza.webp', 'Woodford Green', 'UK', false, false, true, false, false, true, false, true, false, false, false, true, true, true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('31e8c8d6-6858-44e8-8bf4-d6b25333a284', 'Baluchi - A Pan Indian Destination', 'baluchi---a-pan-indian-destination', 'Indian', 4.5, 0, 2, 51.5033333, -0.0783333, '181 Tooley Street, London, SE1 2JR', 'https://www.thelalit.com/the-lalit-london/eat-and-drink/baluchi/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/670f8fee5a35713007ed5cb2_baluchi.jpeg', 'London', 'UK', false, false, true, true, false, false, false, true, true, false, true, true, true, false, true, false, false, true, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('32191f40-f9ba-42df-b76e-02ef2e7e4f7d', 'Kricket Soho', 'kricket-soho', 'Indian', 4.5, 0, 2, 51.5108075, -0.1351688, '12 Denman Street, London, W1D 7HJ', 'http://www.kricket.co.uk/soho/', NULL, 'London', 'UK', false, false, true, true, false, false, false, false, false, false, false, true, true, false, true, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, latitude, longitude, address, website_url, image_url, city, country, family_friendly, kids_menu, high_chairs, changing_table, baby_change_womens, baby_change_unisex, baby_change_mens, wheelchair_access, outdoor_seating, playground_nearby, dog_friendly, vegetarian_options, vegan_options, gluten_free_options, halal, small_plates, healthy_options, takeaway, fun_quirky, relaxed, buzzy, good_for_groups, games_available, kids_play_space, quick_service, friendly_staff, free_kids_meal, tourist_attraction_nearby, air_conditioning, pram_storage) VALUES ('3223a597-0ec6-4796-a52b-b3ab459ea6e8', 'Casa Pastor', 'casa-pastor', 'Mexican', 4.6, 0, 2, 51.5360314, -0.1269178, 'Coal Drops Yard, London, England, N1C 4DQ, GB', 'https://www.tacoselpastor.co.uk/', 'https://cdn.prod.website-files.com/65c4e3041d72984c18dbb740/66e40bde46da67d20ec2150a_WhatsApp%2520Image%25202024-05-10%2520at%252016.59.14.jpeg', 'London', 'UK', false, true, true, false, false, true, false, true, true, false, true, true, true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false) ON CONFLICT (id) DO UPDATE SET
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