# Sign-Out Cache Fix - Keep Public Data Visible

## Problem

After signing out, the homepage featured restaurants disappeared:
- "Featured restaurants with high chairs" - empty
- "Featured restaurants in London" - empty

## Root Cause

The sign-out function was clearing **ALL** SWR cache with:

```typescript
mutate((key) => true, undefined, { revalidate: false });
```

This deleted:
- ❌ User-specific data (bookmarks, likes, profile) ✅ Should be cleared
- ❌ Public restaurant data (featured, london, search) ❌ Should be kept
- The `{ revalidate: false }` meant data wasn't refetched

## The Solution

### Selective Cache Clearing

Only clear **user-specific** cache patterns, keep public data:

```typescript
// Clear only USER-SPECIFIC SWR cache (keep public data like restaurants)
const userSpecificPatterns = [
  '/api/user-data/bookmarks',    // User bookmarks
  '/api/user-data/likes',         // User likes
  '/api/subscriptions',           // User subscriptions
  '/api/local-hero',              // Local hero data
  '/api/admin',                   // Admin data
  '/api/owner',                   // Owner data
  'user_profile_',                // Cached profiles
];

mutate(
  (key) => {
    if (typeof key === 'string') {
      return userSpecificPatterns.some(pattern => key.includes(pattern));
    }
    return false;
  },
  undefined,
  { revalidate: false }
);
```

### What Gets Cleared vs Kept

**Cleared (User-Specific):**
- ✅ User bookmarks
- ✅ User likes
- ✅ User subscriptions
- ✅ Local hero assignments
- ✅ Admin dashboard data
- ✅ Owner dashboard data
- ✅ Cached user profiles

**Kept (Public Data):**
- ✅ Featured restaurants
- ✅ London restaurants
- ✅ Restaurant search results
- ✅ Restaurant details
- ✅ City data
- ✅ Any other public API responses

## Implementation

Updated in 4 locations in `contexts/AuthContext.tsx`:

1. **Line 522-546**: In the forced logout (session error recovery)
2. **Line 721-746**: In SIGNED_OUT event handler
3. **Line 1111-1139**: In main `signOut()` function
4. **Line 1335-1358**: In error recovery block

## User Experience

### Before Fix
```
1. User is logged in
2. Homepage shows: Featured restaurants ✓
3. User clicks Sign Out
4. Homepage shows: No restaurants ✗
5. User must refresh page to see restaurants again
```

### After Fix
```
1. User is logged in
2. Homepage shows: Featured restaurants ✓
3. User clicks Sign Out
4. Homepage shows: Featured restaurants still visible ✓
5. Only user-specific data (bookmarks, likes) cleared
```

## Technical Details

### SWR Cache Key Patterns

SWR uses cache keys to store API responses. Common patterns:

**User-Specific Keys:**
- `/api/user-data/bookmarks` - Current user's bookmarks
- `/api/user-data/likes` - Current user's likes
- `/api/subscriptions?userId=123` - User subscriptions
- `user_profile_123` - Cached profile data

**Public Keys:**
- `/api/restaurants?type=featured` - Featured restaurants
- `/api/restaurants?type=london` - London restaurants
- `/api/restaurants?q=pizza` - Search results

### Why Pattern Matching?

The `mutate((key) => boolean)` function:
1. Iterates through all SWR cache keys
2. Calls the predicate function for each key
3. Clears keys where function returns `true`
4. Keeps keys where function returns `false`

By checking `key.includes(pattern)`, we selectively clear only user-related cache.

## Testing

### Test Sign Out Flow

1. **While Logged In:**
   - Go to homepage
   - Verify "Featured restaurants with high chairs" shows 5 restaurants
   - Verify "Featured restaurants in London" shows 5 restaurants

2. **Sign Out:**
   - Click Sign Out button
   - Redirected to homepage

3. **After Sign Out:**
   - Verify "Featured restaurants with high chairs" STILL shows 5 restaurants ✓
   - Verify "Featured restaurants in London" STILL shows 5 restaurants ✓
   - Bookmarks/likes should be cleared (not visible)

### Expected Console Logs

```
[AuthContext] 🚪 Signing out...
[AuthContext] 🗑️ Clearing user-specific SWR cache...
[AuthContext] ✅ User-specific SWR cache cleared (public data retained)
[AuthContext] ✅ Signed out successfully
```

## Benefits

1. **Better UX**: Homepage doesn't look broken after sign-out
2. **Performance**: No need to refetch public data
3. **Bandwidth**: Saves API calls for data that doesn't change
4. **Professionalism**: Site looks polished and well-designed

## Date Fixed
November 16, 2025

## Related Issues
- OAuth login speed optimization
- SWR cache management
- Sign-out flow improvements



