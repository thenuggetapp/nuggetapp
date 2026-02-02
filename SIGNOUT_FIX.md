# Sign-Out Fix for SWR Integration 🔐

## Problem
After implementing SWR for data caching, the sign-out button stopped working properly:
- User clicks "Sign Out"
- Page refreshes
- User is still logged in (showing cached data from SWR)

## Root Cause
SWR caches all API responses in memory. When a user signs out:
1. Supabase session is cleared ✅
2. Local state is cleared ✅
3. Page redirects ✅
4. **BUT** SWR cache remains intact ❌

When the page reloads after sign-out, SWR immediately returns cached data before checking authentication, making it appear as if the user is still logged in.

## Solution
Clear the SWR cache **before** signing out from Supabase.

### Changes Made

**File**: `/contexts/AuthContext.tsx`

#### 1. Import SWR's `mutate` function:
```typescript
import { mutate } from "swr";
```

#### 2. Clear cache in `signOut()` function:
```typescript
const signOut = async () => {
  try {
    console.log("[AuthContext] 🚪 Signing out...");

    // 🗑️ CRITICAL: Clear SWR cache FIRST to prevent stale data on reload
    console.log("[AuthContext] 🗑️ Clearing SWR cache...");
    mutate(
      () => true, // Clear all cache keys
      undefined, // No data
      { revalidate: false } // Don't revalidate
    );

    // Then proceed with normal sign-out...
    const { error } = await supabase.auth.signOut({ scope: "global" });
    // ... rest of sign-out logic
  }
};
```

#### 3. Clear cache in `SIGNED_OUT` event handler:
```typescript
if (event === "SIGNED_OUT") {
  console.log("[AuthContext] Clearing all state and SWR cache");
  
  // Clear SWR cache
  mutate(
    () => true, // Clear all cache keys
    undefined, // No data
    { revalidate: false } // Don't revalidate
  );
  
  setUser(null);
  setUserProfile(null);
  setPermissions(getRolePermissions(null, []));
  setLoading(false);
  return;
}
```

## How It Works

### SWR's Global `mutate()` Function
```typescript
mutate(
  () => true,              // Match ALL cache keys
  undefined,               // Set data to undefined (clear)
  { revalidate: false }    // Don't refetch data
)
```

**Parameters:**
1. **Key matcher**: `() => true` - matches ALL SWR cache keys
2. **Data**: `undefined` - clears the data
3. **Options**: `{ revalidate: false }` - prevents automatic refetching

### Sign-Out Flow (Fixed)
```
1. User clicks "Sign Out"
   ↓
2. 🗑️ Clear ALL SWR cache
   ├─ /api/admin/restaurants → cleared
   ├─ /api/restaurants?type=featured → cleared
   ├─ /api/user/bookmarks → cleared
   ├─ /api/user/likes → cleared
   └─ All other cached endpoints → cleared
   ↓
3. ✅ Sign out from Supabase (global scope)
   ↓
4. ✅ Clear local state (user, profile, permissions)
   ↓
5. ✅ Clear localStorage/sessionStorage
   ↓
6. ✅ Hard redirect to homepage (window.location.href = "/")
   ↓
7. ✅ Page loads fresh - no cached data!
```

## Testing Checklist

- [x] User clicks "Sign Out"
- [x] SWR cache is cleared (check console logs)
- [x] Supabase session is cleared
- [x] Local state is cleared
- [x] Page redirects to homepage
- [x] Homepage shows logged-out state (no user data)
- [x] Navigation bar shows "Sign In" button
- [x] No cached data is displayed
- [x] Attempting to visit protected routes redirects to login

## Additional Notes

### Why Clear Cache First?
The cache must be cleared **before** sign-out because:
1. Sign-out triggers a redirect
2. Redirect interrupts any async operations
3. If cache isn't cleared before redirect, it persists across the reload

### Alternative Approaches (Not Used)
We could have:
1. **Cleared specific keys** - But too many keys to track (error-prone)
2. **Added cache invalidation to SWR config** - But would affect all mutations
3. **Used a custom fetcher** - Over-engineered for this simple fix

The global clear is the simplest and most reliable solution.

## Related Documentation
- [SWR Mutation Docs](https://swr.vercel.app/docs/mutation)
- [SWR Global Mutate](https://swr.vercel.app/docs/mutation#mutate-multiple-items)

---

**Status**: ✅ FIXED  
**Date**: November 14, 2025  
**Impact**: Sign-out now works correctly with SWR caching

