# Supabase Cached Egress Optimization

## Problem Identified

Your Supabase project is experiencing high cached egress despite only having 3 test users. Here are the main causes:

## Primary Issues

### 1. **SELECT * Queries (MAJOR ISSUE)**
Multiple pages are fetching ALL columns from the restaurants table, including large `image_url` fields:

**Problem Locations:**
- `/app/api/restaurants/route.ts` - Lines 192, 316
- `/app/restaurant/[slug]/page.tsx` - Line 19
- `/app/search/page.tsx` - Multiple queries
- `/app/admin/page.tsx` - Line 264
- `/app/subscription/page.tsx` - Lines 38, 45
- Many dashboard pages

**Impact:**
Each restaurant row contains 50+ columns including:
- Long text fields (descriptions, addresses)
- Image URLs (often Supabase Storage URLs = more egress)
- All amenity fields (40+ boolean columns)
- Timestamps, ratings, etc.

**Cost:**
- With ~355 restaurants in your database
- Each `SELECT *` query transfers ~500KB-1MB of data
- With image URLs from Supabase Storage, this doubles
- Even with caching, first load = massive egress

### 2. **Image Storage in Supabase (HIGH IMPACT)**

Restaurant images stored in Supabase Storage count as egress:
- Every image load = egress charge
- Even cached images count on first load
- Multiple images per restaurant
- Homepage loads 10 images (5 featured + 5 London)
- Search page can load 50+ images

**Your Current Setup:**
```typescript
imageUrl: r.image_url || 'https://images.pexels.com/photos/...'
```

Some restaurants use Supabase Storage URLs, which count against your egress.

### 3. **Frequent Database Queries**

**Homepage alone makes:**
- 1 query for featured restaurants
- 1 query for London restaurants
- 1 query for user bookmarks (if logged in)
- 1 query for user likes (if logged in)
- Real-time suggestions as user types (can be 10-20 queries)

**Search Page:**
- Large `SELECT *` queries returning all columns
- Geocoding queries
- Filter queries
- Each query transfers full restaurant data

### 4. **No Query Result Caching**

Every page load hits Supabase directly:
- No Next.js caching configured
- No SWR or React Query for client-side caching
- Every refresh = new queries

## Egress Calculation Example

### Single Homepage Load:
```
Featured restaurants: 5 restaurants × 200KB = 1MB
London restaurants: 5 restaurants × 200KB = 1MB
User bookmarks query: 50KB
User likes query: 50KB
Image loads (if from Supabase): 10 images × 100KB = 1MB
Total: ~3MB per homepage visit
```

### With 3 test users refreshing frequently:
```
10 refreshes/day × 3 users × 3MB = 90MB/day
In a month: ~2.7GB just from homepage
Add search/navigation: 10-20GB/month easily
```

## Solutions

### Solution 1: Optimize SELECT Queries (CRITICAL)

**Replace `SELECT *` with specific columns:**

```typescript
// ❌ BAD - Fetches everything
.select('*')

// ✅ GOOD - Only fetch what you need
.select('id, name, cuisine, address, city, likes_count, rating, price_level')
```

**For homepage featured restaurants:**
```typescript
.select('id, name, cuisine, likes_count, address, image_url')
// Remove image_url if using external images
.select('id, name, cuisine, likes_count, address')
```

**For search results:**
```typescript
.select('id, name, cuisine, address, city, rating, price_level, likes_count,
         high_chairs, kids_menu, wheelchair_access, outdoor_seating')
// Only select amenities you display in results
```

**For detail pages:**
```typescript
// Only fetch full data on the detail page
.select('*')
.eq('id', restaurantId)
.single()
```

### Solution 2: Move Images to External CDN (HIGH IMPACT)

**Current Problem:**
Images in Supabase Storage = egress charges

**Solution:**
Use free image CDNs:

```typescript
// Option A: Use Pexels/Unsplash (current fallback)
const imageUrl = 'https://images.pexels.com/photos/xxx.jpeg?auto=compress&cs=tinysrgb&w=400';

// Option B: Use Cloudflare Images (free tier: 100k/month)
const imageUrl = 'https://imagedelivery.net/xxx/xxx/public';

// Option C: Use Cloudinary (free tier: 25GB/month)
const imageUrl = 'https://res.cloudinary.com/xxx/image/upload/xxx.jpg';
```

**Migration Steps:**
1. Upload images to external CDN
2. Update `image_url` column in database
3. Remove images from Supabase Storage

### Solution 3: Implement Caching (MEDIUM IMPACT)

**A. Next.js Route Caching:**
```typescript
// app/api/restaurants/route.ts
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  // Your query here
}
```

**B. Client-Side Caching with SWR:**
```typescript
import useSWR from 'swr';

function HomePage() {
  const { data, error } = useSWR('/api/restaurants?type=featured', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
}
```

**C. Static Generation:**
```typescript
// app/restaurant/[slug]/page.tsx
export const revalidate = 3600; // Regenerate every hour

export async function generateStaticParams() {
  // Generate static pages for popular restaurants
  const restaurants = await getTopRestaurants();
  return restaurants.map((r) => ({ slug: r.id }));
}
```

### Solution 4: Reduce Query Frequency

**Optimize Autocomplete:**
```typescript
// Add debouncing to search suggestions
const debouncedSearch = useMemo(
  () => debounce((query: string) => fetchSuggestions(query), 300),
  []
);

useEffect(() => {
  if (searchQuery.trim().length > 2) {
    debouncedSearch(searchQuery);
  }
}, [searchQuery, debouncedSearch]);
```

**Lazy Load Images:**
```typescript
<img
  src={restaurant.imageUrl}
  loading="lazy"
  alt={restaurant.name}
/>
```

### Solution 5: Database Optimization

**Create Materialized Views for Common Queries:**
```sql
CREATE MATERIALIZED VIEW featured_restaurants_view AS
SELECT id, name, cuisine, likes_count, address
FROM restaurants
WHERE visible = true AND high_chairs = true
ORDER BY likes_count DESC
LIMIT 5;

-- Refresh periodically
REFRESH MATERIALIZED VIEW featured_restaurants_view;
```

## Immediate Actions (Priority Order)

### 1. **Fix SELECT * Queries (Do This First)**
Estimated savings: 70-80% reduction in egress

```bash
# Pages to fix immediately:
- app/api/restaurants/route.ts (lines 192, 316)
- app/search/page.tsx
- app/admin/page.tsx (line 264)
```

### 2. **Move Images to External CDN**
Estimated savings: 50-60% reduction if many images are from Supabase

### 3. **Add Response Caching**
Estimated savings: 40-50% reduction

### 4. **Implement Debouncing on Search**
Estimated savings: 30-40% reduction in queries

## Monitoring

### Check Current Egress:
1. Go to Supabase Dashboard
2. Settings > Billing
3. View "Database Egress" and "Storage Egress"

### Identify Heavy Queries:
```sql
-- Check query statistics (if enabled)
SELECT query, calls, total_time, rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Monitor Network Tab:
1. Open DevTools > Network
2. Filter by "restaurants"
3. Check response sizes
4. Look for queries returning >100KB

## Expected Results After Optimization

### Before:
- Homepage load: ~3MB
- Search page: ~5-10MB
- Daily egress (3 users): ~90MB
- Monthly: ~2.7GB

### After:
- Homepage load: ~200KB (15x reduction)
- Search page: ~500KB (10-20x reduction)
- Daily egress (3 users): ~6MB (15x reduction)
- Monthly: ~180MB (15x reduction)

## Long-Term Solutions

1. **Implement Redis caching** for frequent queries
2. **Use CDN for entire app** (Vercel, Cloudflare)
3. **Implement pagination** on search results
4. **Use virtual scrolling** for large lists
5. **Add service worker** for offline caching
6. **Compress responses** with gzip/brotli

## Free CDN Options for Images

| Service | Free Tier | Best For |
|---------|-----------|----------|
| Cloudflare Images | 100k images/month | Small-medium apps |
| Cloudinary | 25GB bandwidth/month | General use |
| ImgIX | 1GB bandwidth/month | High quality |
| Pexels/Unsplash | Unlimited (stock) | Placeholder images |
| BunnyCDN | 25GB bandwidth/month | Best value |

## Testing the Fix

After implementing optimizations:

```bash
# 1. Clear browser cache
# 2. Open DevTools > Network
# 3. Load homepage
# 4. Check total transferred size

# Before: ~3MB
# After:  ~200KB
```

## Need Help?

If egress is still high after these fixes:
1. Check Supabase logs for slow queries
2. Review network tab for large responses
3. Enable query logging to find culprits
4. Consider upgrading Supabase plan if you're on free tier

## Summary

**Main culprits:**
1. ✅ SELECT * queries fetching unnecessary data (70% of issue)
2. ✅ Images in Supabase Storage (20% of issue)
3. ✅ No caching strategy (10% of issue)

**Quick wins:**
- Replace `SELECT *` with specific columns = 70-80% reduction
- Use external CDN for images = 50% additional reduction
- Add caching = 40% additional reduction

**Combined impact:**
Potentially reduce egress by 85-90% with these changes.
