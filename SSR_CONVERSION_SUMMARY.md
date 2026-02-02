# Homepage Server-Side Rendering (SSR) Conversion

## Overview
Successfully converted the homepage from Client-Side Rendering (CSR) to Server-Side Rendering (SSR) for improved SEO and initial page load performance.

## Changes Made

### 1. **Created Client Component: SearchSection** (`components/home/SearchSection.tsx`)
- Extracted all search-related interactive functionality
- Handles search input, suggestions, and placeholder animation
- Uses client-side hooks: `useSearchSuggestions`, `useState`, `useEffect`
- Maintains the same UX with typewriter effect and search suggestions

### 2. **Created Client Component: RestaurantGrid** (`components/home/RestaurantGrid.tsx`)
- Extracted restaurant card grid with like/bookmark functionality
- Handles user interactions (like, bookmark) on cards
- Uses client-side hooks: `useAuth`, `useUserBookmarks`, `useUserLikes`, `useToggleBookmark`, `useToggleLike`
- Receives restaurant data as props from server component

### 3. **Converted Main Page** (`app/page.tsx`)
- **Removed** `'use client'` directive
- **Changed** from default function to async function
- **Added** server-side data fetching functions:
  - `getFeaturedRestaurants()` - Fetches restaurants with high chairs
  - `getLondonRestaurants()` - Fetches London-based restaurants
- **Uses** Supabase server client (`createClient` from `@/lib/supabase/server`)
- **Passes** fetched data to client components as props

## Architecture

```
┌─────────────────────────────────────┐
│   app/page.tsx (Server Component)   │
│                                     │
│  - Fetches data from Supabase       │
│  - Generates structured data        │
│  - Renders static HTML              │
└─────────────┬───────────────────────┘
              │
              ├─► SearchSection (Client)
              │   - Interactive search
              │   - Suggestions
              │   - Animation
              │
              └─► RestaurantGrid (Client)
                  - Interactive cards
                  - Like/Bookmark buttons
                  - User-specific data
```

## Benefits

### ✅ SEO Improvements
- Search engines can now see restaurant data in the initial HTML
- Structured data is included in the initial response
- Better indexing for featured restaurants

### ✅ Performance Improvements
- Faster First Contentful Paint (FCP)
- Restaurant data loads before JavaScript executes
- Reduced client-side JavaScript execution
- No loading states for initial restaurant data

### ✅ User Experience
- Users see content immediately
- Progressive enhancement: interactive features load after
- Same UX as before but faster initial load

## Technical Details

### Data Fetching
Server-side queries directly fetch from Supabase:

**Featured Restaurants:**
```typescript
await supabase
  .from('restaurants')
  .select('id, name, cuisine, likes_count, address, image_url')
  .eq('visible', true)
  .eq('high_chairs', true)
  .order('likes_count', { ascending: false })
  .limit(5)
```

**London Restaurants:**
```typescript
await supabase
  .from('restaurants')
  .select('id, name, cuisine, likes_count, address, image_url')
  .eq('visible', true)
  .ilike('address', '%London%')
  .order('likes_count', { ascending: false })
  .limit(5)
```

### Build Output
```
Route (app)                              Size     First Load JS
┌ λ /                                    3.91 kB  191 kB
```

The `λ` symbol indicates **dynamic server-side rendering**.

## Testing
- ✅ Build completed successfully
- ✅ No linter errors
- ✅ TypeScript validation passed
- ✅ Route marked as server-side rendered

## Next Steps (Optional Enhancements)

1. **Add Caching**: Implement ISR (Incremental Static Regeneration) with `revalidate`
2. **Add Loading States**: Use React Suspense for streaming
3. **Optimize Images**: Use Next.js Image component
4. **Add Error Boundaries**: Handle server-side errors gracefully

## Build-Time Fix

### Issue Encountered
After initial conversion, encountered build errors:
1. Server components were using client-side Supabase client
2. `generateStaticParams` couldn't access cookies during build time

### Solution
Created three types of Supabase clients for different contexts:

**1. Client-Side Client** (`lib/supabase/client.ts`)
- For client components
- Uses browser cookies
- Handles user authentication in the browser

**2. Server-Side Client** (`lib/supabase/server.ts`)
- For server components with request context
- Uses server-side cookies
- For API routes and dynamic server rendering

**3. Admin Client** (`lib/supabase/admin.ts`) ⭐ NEW
- For build-time operations (no request context)
- No cookie dependency
- Used in `generateStaticParams`, `generateMetadata`, `sitemap`

### Files Fixed

Updated to use appropriate Supabase client:
- ✅ `app/restaurant/[slug]/page.tsx` - Uses admin client for static generation
- ✅ `app/sitemap.ts` - Uses admin client for sitemap generation
- ✅ `app/api/filters/route.ts` - Uses server client
- ✅ `app/api/restaurants/[id]/route.ts` - Uses server client

## Related Files

- `app/page.tsx` - Main homepage (now SSR)
- `components/home/SearchSection.tsx` - Client component for search
- `components/home/RestaurantGrid.tsx` - Client component for restaurant cards
- `lib/supabase/server.ts` - Supabase server client (for API routes)
- `lib/supabase/admin.ts` - Supabase admin client (for build time) ⭐ NEW
- `lib/supabase/client.ts` - Supabase client client (for browser)

