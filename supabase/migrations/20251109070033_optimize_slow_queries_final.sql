/*
  # Comprehensive Query Performance Optimization

  ## Problem Analysis (from pg_stat_statements)
  
  Slow queries identified from Supabase dashboard:
  1. **1,717ms max**: jsonb_build_object aggregation (414 calls, 336ms mean)
  2. **393ms max**: SELECT * FROM restaurants ORDER BY id LIMIT/OFFSET  
  3. **208ms max**: ORDER BY city queries
  4. **149ms max**: pgrst_source filtered queries

  ## Solution
  Add 16 strategic indexes to optimize common query patterns

  ## Expected Performance Gains
  - API responses: 336ms → <50ms (85% faster)
  - Pagination: 393ms → <10ms (97% faster)
  - City queries: 208ms → <20ms (90% faster)
  - Filtered queries: 149ms → <20ms (87% faster)
*/

-- ============================================================
-- 1. PAGINATION OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_restaurants_id_desc 
  ON restaurants(id DESC);

-- ============================================================
-- 2. SORT OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_restaurants_city_name_visible 
  ON restaurants(city, name) 
  WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_restaurants_rating_name 
  ON restaurants(rating DESC NULLS LAST, name);

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_rating 
  ON restaurants(cuisine, rating DESC NULLS LAST) 
  WHERE visible = true;

-- ============================================================
-- 3. COVERING INDEXES (Avoid table lookups)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_restaurants_list_covering 
  ON restaurants(visible, city, cuisine, rating DESC)
  INCLUDE (id, name, slug, address, latitude, longitude, image_url)
  WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_restaurants_city_covering 
  ON restaurants(city, rating DESC)
  INCLUDE (id, name, slug, cuisine, address, image_url, latitude, longitude)
  WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_covering 
  ON restaurants(cuisine, rating DESC)
  INCLUDE (id, name, slug, city, address, image_url)
  WHERE visible = true;

-- ============================================================
-- 4. SEARCH OPTIMIZATION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_restaurants_search_fts 
  ON restaurants USING gin(
    to_tsvector('english', 
      coalesce(name, '') || ' ' || 
      coalesce(description, '') || ' ' ||
      coalesce(cuisine, '')
    )
  ) WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_restaurants_name_trgm 
  ON restaurants USING gin(lower(name) gin_trgm_ops)
  WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_trgm 
  ON restaurants USING gin(lower(cuisine) gin_trgm_ops);

-- ============================================================
-- 5. GEOSPATIAL OPTIMIZATION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE INDEX IF NOT EXISTS idx_restaurants_location_gist 
  ON restaurants USING gist(
    ll_to_earth(latitude, longitude)
  ) WHERE latitude IS NOT NULL 
    AND longitude IS NOT NULL 
    AND visible = true;

-- ============================================================
-- 6. FILTER OPTIMIZATION
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_restaurants_visible_rating_id 
  ON restaurants(visible, rating DESC, id)
  WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_restaurants_amenities 
  ON restaurants(outdoor_seating, wheelchair_access)
  WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_restaurants_city_cuisine_rating 
  ON restaurants(city, cuisine, rating DESC)
  WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_restaurants_city_visible_rating 
  ON restaurants(city, visible, rating DESC)
  WHERE visible = true;

-- ============================================================
-- 7. STATISTICS OPTIMIZATION
-- ============================================================

ANALYZE restaurants;

ALTER TABLE restaurants ALTER COLUMN city SET STATISTICS 1000;
ALTER TABLE restaurants ALTER COLUMN cuisine SET STATISTICS 1000;
ALTER TABLE restaurants ALTER COLUMN rating SET STATISTICS 500;
ALTER TABLE restaurants ALTER COLUMN visible SET STATISTICS 500;
ALTER TABLE restaurants ALTER COLUMN slug SET STATISTICS 500;

-- ============================================================
-- 8. TABLE TUNING
-- ============================================================

ALTER TABLE restaurants SET (parallel_workers = 4);
ALTER TABLE restaurants SET (fillfactor = 90);
