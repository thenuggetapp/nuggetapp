/*
  # Optimize Performance for Other Tables

  Optimize frequently queried tables to reduce JOIN times and permission checks.

  ## Tables Optimized
  - user_profiles (role lookups, email searches)
  - reviews (restaurant reviews, user reviews)
  - favorites (user favorites, restaurant favorite count)
  - restaurant_ownership (owner dashboards, permission checks)
  - local_hero_assignments (permission checks)
  - notifications (unread feeds)
  - subscriptions (active subscriptions)
  - restaurant_suggestions (admin review queue)

  ## Expected Impact
  - JOIN operations: 50-80% faster
  - Permission checks: 70-90% faster
  - Dashboard queries: 60-80% faster
*/

-- ============================================================
-- USER_PROFILES OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
  ON user_profiles(role) 
  WHERE role IN ('admin', 'local_hero', 'restaurant_owner');

CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lower 
  ON user_profiles(lower(email));

ANALYZE user_profiles;
ALTER TABLE user_profiles ALTER COLUMN role SET STATISTICS 500;
ALTER TABLE user_profiles ALTER COLUMN email SET STATISTICS 500;

-- ============================================================
-- REVIEWS OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_date 
  ON reviews(restaurant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_user_date 
  ON reviews(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_liked 
  ON reviews(restaurant_id, liked, created_at DESC)
  WHERE liked = true;

CREATE INDEX IF NOT EXISTS idx_reviews_covering 
  ON reviews(restaurant_id, created_at DESC)
  INCLUDE (id, user_id, liked, rating, comment);

ANALYZE reviews;
ALTER TABLE reviews ALTER COLUMN restaurant_id SET STATISTICS 1000;
ALTER TABLE reviews ALTER COLUMN user_id SET STATISTICS 500;
ALTER TABLE reviews SET (parallel_workers = 2);

-- ============================================================
-- FAVORITES OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_favorites_user_restaurant 
  ON favorites(user_id, restaurant_id);

CREATE INDEX IF NOT EXISTS idx_favorites_restaurant_count 
  ON favorites(restaurant_id);

ANALYZE favorites;
ALTER TABLE favorites SET (parallel_workers = 2);

-- ============================================================
-- RESTAURANT_OWNERSHIP OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_restaurant_ownership_owner 
  ON restaurant_ownership(owner_id, verified);

CREATE INDEX IF NOT EXISTS idx_restaurant_ownership_verified_lookup 
  ON restaurant_ownership(owner_id, restaurant_id, verified)
  WHERE verified = true;

CREATE INDEX IF NOT EXISTS idx_restaurant_ownership_restaurant 
  ON restaurant_ownership(restaurant_id, verified);

ANALYZE restaurant_ownership;

-- ============================================================
-- LOCAL_HERO_ASSIGNMENTS OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_local_hero_active_user 
  ON local_hero_assignments(user_id, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_local_hero_active_city 
  ON local_hero_assignments(city_name, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_local_hero_user_city_active 
  ON local_hero_assignments(user_id, city_name, is_active)
  WHERE is_active = true;

ANALYZE local_hero_assignments;
ALTER TABLE local_hero_assignments ALTER COLUMN city_name SET STATISTICS 1000;

-- ============================================================
-- NOTIFICATIONS OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC)
  WHERE read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_all 
  ON notifications(user_id, read, created_at DESC);

ANALYZE notifications;

-- ============================================================
-- SUBSCRIPTIONS OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active 
  ON subscriptions(user_id, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring 
  ON subscriptions(current_period_end, status)
  WHERE status = 'active' AND current_period_end IS NOT NULL;

ANALYZE subscriptions;

-- ============================================================
-- RESTAURANT_SUGGESTIONS OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_suggestions_pending 
  ON restaurant_suggestions(status, created_at DESC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_suggestions_user 
  ON restaurant_suggestions(user_id, status, created_at DESC);

ANALYZE restaurant_suggestions;
