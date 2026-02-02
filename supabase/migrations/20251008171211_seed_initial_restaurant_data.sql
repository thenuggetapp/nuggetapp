/*
  # Seed initial restaurant data

  1. Data Migration
    - Insert 8 family-friendly restaurants from dummy data
    - All restaurants have proper slugs, coordinates, and amenities
    - Images are hosted on Pexels CDN

  2. Notes
    - This is seed data for demonstration purposes
    - Slugs are URL-friendly versions of restaurant names
    - All coordinates are for London/UK area
*/

INSERT INTO restaurants (id, name, slug, cuisine, rating, review_count, price_level, address, latitude, longitude, image_url, family_friendly, kids_menu, high_chairs, changing_table) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Grumpy''s Bar + Wood Fired Pizza',
  'grumpys-bar-wood-fired-pizza',
  'Italian, Pizza',
  4.6,
  44,
  2,
  '2 Old Combing, London',
  51.5074,
  -0.1278,
  'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  true,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000002',
  'Harvester Grange Park Northampton',
  'harvester-grange-park-northampton',
  'British, Grill',
  4.2,
  58,
  2,
  'Loake Cl, Northampton',
  51.5144,
  -0.1318,
  'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  true,
  true,
  false
),
(
  '00000000-0000-0000-0000-000000000003',
  'Simply Italian',
  'simply-italian',
  'Italian',
  4.5,
  63,
  2,
  '12 Strand, London',
  51.5085,
  -0.1195,
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  true,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000004',
  'Busaba St Christopher''s Place',
  'busaba-st-christophers-place',
  'Thai, Asian',
  4.5,
  24,
  2,
  'Busaba St Christopher''s Place, London',
  51.5155,
  -0.1490,
  'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  false,
  true,
  false
),
(
  '00000000-0000-0000-0000-000000000005',
  'Brags and Brams',
  'brags-and-brams',
  'British, Contemporary',
  4.4,
  27,
  3,
  '265 Hackney Road, London',
  51.5310,
  -0.0700,
  'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  true,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000006',
  'Coppa Club, Putney',
  'coppa-club-putney',
  'Mediterranean',
  4.4,
  119,
  3,
  '29 Brewhouse Lane, London',
  51.4650,
  -0.2150,
  'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  true,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000007',
  'The Garden Café',
  'the-garden-cafe',
  'Café, Brunch',
  4.3,
  89,
  2,
  'Russell Square, London',
  51.5220,
  -0.1257,
  'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  true,
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000008',
  'The Waterside Inn',
  'the-waterside-inn',
  'French, Fine Dining',
  4.8,
  156,
  4,
  'Bray, Maidenhead',
  51.5000,
  -0.7000,
  'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400',
  false,
  false,
  false,
  false
)
ON CONFLICT (id) DO NOTHING;