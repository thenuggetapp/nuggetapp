/*
  # Migrate Existing Restaurant Images

  1. Purpose
    - Copy existing images from restaurants.image_url to restaurant_images table
    - Set these as featured images
    - Preserve existing image data

  2. Changes
    - Insert existing restaurant images into restaurant_images table
    - Mark them as featured (is_featured = true)
    - Set display_order to 0 (first image)
*/

-- Insert existing restaurant images into restaurant_images table
INSERT INTO restaurant_images (restaurant_id, image_url, is_featured, display_order)
SELECT 
  id as restaurant_id,
  image_url,
  true as is_featured,
  0 as display_order
FROM restaurants
WHERE image_url IS NOT NULL 
  AND image_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM restaurant_images 
    WHERE restaurant_images.restaurant_id = restaurants.id
  );