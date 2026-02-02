/*
  # Add Missing Indexes for Performance

  This migration adds indexes that are critical for query performance.
  
  ## Indexes Added
  1. local_hero_assignments(user_id) - Missing foreign key index
  2. restaurants(city) - Frequently filtered by city
  3. restaurants(cuisine) - Frequently filtered by cuisine
  4. restaurants(visible) - Frequently filtered by visibility
  5. reviews(created_at) - Frequently sorted by date
  6. restaurant_suggestions(status) - Admin dashboard filters by status
  7. notifications(created_at) - Sorted by recency
  8. subscriptions(status) - Filtered by status
  
  ## Performance Impact
  These indexes will significantly speed up:
  - Local hero dashboard queries
  - Restaurant search and filtering
  - Review listings
  - Admin suggestion management
  - Notification feeds
*/

-- Index for local_hero_assignments.user_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_local_hero_assignments_user_id 
  ON local_hero_assignments(user_id);

-- Index for frequently filtered restaurant columns
CREATE INDEX IF NOT EXISTS idx_restaurants_city 
  ON restaurants(city);

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine 
  ON restaurants(cuisine);

CREATE INDEX IF NOT EXISTS idx_restaurants_visible 
  ON restaurants(visible);

-- Composite index for city + visible (common filter combination)
CREATE INDEX IF NOT EXISTS idx_restaurants_city_visible 
  ON restaurants(city, visible) 
  WHERE visible = true;

-- Index for reviews sorted by date
CREATE INDEX IF NOT EXISTS idx_reviews_created_at 
  ON reviews(created_at DESC);

-- Index for restaurant reviews (common query pattern)
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_created 
  ON reviews(restaurant_id, created_at DESC);

-- Index for user reviews (user profile page)
CREATE INDEX IF NOT EXISTS idx_reviews_user_created 
  ON reviews(user_id, created_at DESC);

-- Index for restaurant suggestions status
CREATE INDEX IF NOT EXISTS idx_restaurant_suggestions_status 
  ON restaurant_suggestions(status);

-- Index for pending suggestions (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_restaurant_suggestions_status_created 
  ON restaurant_suggestions(status, created_at DESC) 
  WHERE status = 'pending';

-- Index for notifications sorted by date
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);

-- Index for unread notifications (using 'read' column)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE read = false;

-- Index for subscriptions by status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
  ON subscriptions(user_id, status);

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_active 
  ON subscriptions(user_id, status) 
  WHERE status = 'active';

-- Index for restaurant ownership lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_ownership_verified 
  ON restaurant_ownership(owner_id, restaurant_id) 
  WHERE verified = true;

-- Index for local hero assignments by city
CREATE INDEX IF NOT EXISTS idx_local_hero_assignments_city_active 
  ON local_hero_assignments(city_name, is_active) 
  WHERE is_active = true;

-- Index for favorites (user favorites page)
CREATE INDEX IF NOT EXISTS idx_favorites_user_created 
  ON favorites(user_id, created_at DESC);
