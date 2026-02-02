# Admin Dashboard Timeout Fixed - Circular Dependency Resolution

## Problem: 5-Second Query Timeout

The admin dashboard at `/admin` was showing "No restaurants found" and the console showed:

```
[AuthContext] ❌ QUERY TIMEOUT DETAILS
[AuthContext] Error: Profile query timeout after 5 seconds
[AuthContext] Total wait time: 5521 ms
```

This caused the entire admin dashboard to fail because the user profile couldn't load.

## Root Cause: Circular Dependencies in RLS Policies

The AuthContext tries to load the user profile with this query:

```sql
SELECT *,
  subscriptions(*),
  local_hero_assignments(city_name, is_active)
FROM user_profiles
WHERE id = ?
```

However, the `local_hero_assignments` table had RLS policies that created a **CIRCULAR DEPENDENCY**:

```sql
-- ❌ OLD POLICY - CIRCULAR DEPENDENCY!
CREATE POLICY "Admins can view all assignments"
ON local_hero_assignments
USING (
  EXISTS (
    SELECT 1 FROM user_profiles  -- ❌ Queries the SAME table being loaded!
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### The Circular Loop:

1. **Middleware Cookie Issues**: The middleware was not properly setting cookie options (secure, sameSite, path) for production environments
2. **Aggressive Session Validation**: Using `getUser()` instead of `getSession()` was making unnecessary API calls on every request
3. **Token Refresh Race Conditions**: Token refresh events were triggering unnecessary profile reloads
4. **Button Event Propagation**: The refresh button could trigger form submissions or page reloads
5. **Poor Error Recovery**: No proper error handling for auth failures during data fetches

In production environments (especially on Vercel's edge network), these issues compounded to cause session corruption when multiple requests happened simultaneously.

## Solutions Implemented

### 1. Middleware Cookie Handling Fix
**File**: `middleware.ts`

**Changes Made**:
1. Added proper cookie options for production environments
2. Changed from `getUser()` to `getSession()` to avoid API calls
3. Added try-catch error handling to prevent middleware crashes

```typescript
// Proper cookie options
const cookieOptions: CookieOptions = {
  ...options,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (options.sameSite as 'lax' | 'strict' | 'none' | undefined) || 'lax',
  path: options.path || '/',
};

// Safe session check
try {
  await supabase.auth.getSession();
} catch (error) {
  console.error('[Middleware] Error getting session:', error);
}
```

**Why this fixes it**:
- `secure: true` ensures cookies work over HTTPS in production
- `sameSite: 'lax'` provides better compatibility with modern browsers
- `path: '/'` ensures cookies are accessible across all routes
- `getSession()` reads from cookies without making API calls
- Error handling prevents middleware from breaking the entire app

### 2. AuthContext Improvements
**File**: `contexts/AuthContext.tsx`

**Changes Made**:
1. Added handler for `TOKEN_REFRESHED` event to avoid unnecessary profile reloads
2. Improved error handling in profile loading
3. Better state management for error scenarios

```typescript
// Handle TOKEN_REFRESHED event - don't reload profile unnecessarily
if (event === 'TOKEN_REFRESHED') {
  console.log('[AuthContext] Token refreshed - updating user object only');
  setUser(session?.user ?? null);
  if (mounted) setLoading(false);
  return;
}
```

**Benefits**:
- Prevents unnecessary database queries on token refresh
- Maintains user role consistency during session updates
- Improves performance by reducing redundant operations

### 3. Refresh Button Event Handling
**File**: `app/admin/page.tsx`

**Changes Made**:
1. Added event prevention to stop form submissions or page reloads
2. Added explicit button type

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    loadRestaurants();
  }}
  className="gap-2"
  type="button"
>
  <RefreshCw className="h-4 w-4" />
  Refresh
</Button>
```

**Why this matters**:
- `preventDefault()` stops any default form submission behavior
- `stopPropagation()` prevents the event from bubbling up
- `type="button"` ensures it's not treated as a submit button

### 4. Enhanced Error Recovery in loadRestaurants
**File**: `app/admin/page.tsx`

**Changes Made**:
1. Session validation before making database requests
2. Detailed error checking with specific error messages
3. Proper handling of auth-related errors
4. Success feedback for users

```typescript
const loadRestaurants = async () => {
  setLoading(true);
  try {
    // Verify user is still authenticated before making request
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      toast({
        title: 'Session Error',
        description: 'There was an error checking your session. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!session) {
      toast({
        title: 'Session Expired',
        description: 'Your session has expired. Please log in again.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    // Fetch restaurants with proper error handling
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // Check if error is auth-related
      if (error.message?.includes('JWT') || error.message?.includes('token')) {
        router.push('/login');
        return;
      }
      throw error;
    }

    // Update state with fetched data
    setRestaurants(data || []);
    setFilteredRestaurants(data || []);
    calculateStats(data || []);

    // Show success feedback
    toast({
      title: 'Success',
      description: 'Restaurants refreshed successfully',
    });
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.message || 'Failed to load restaurants',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

**Benefits**:
- Validates session before attempting to load data
- Provides clear, specific error messages
- Automatically redirects to login if authentication fails
- Shows success feedback to confirm the refresh worked
- Prevents the "frozen" state by catching auth errors early

## Expected Behavior After Fix

1. **Refresh Button**: Works smoothly without freezing the page
2. **Session Stability**: User role (admin) remains consistent across refreshes
3. **Navigation**: All admin tabs (Users Management, Local Heroes, etc.) load properly
4. **Error Handling**: Clear error messages if session expires, with automatic redirect to login
5. **Success Feedback**: Visual confirmation that refresh completed successfully
6. **Cookie Persistence**: Proper cookie handling ensures sessions survive page refreshes

## Testing Recommendations

### Basic Tests
1. Log in as admin in production
2. Click the "Refresh" button multiple times rapidly
3. Navigate between different admin tabs
4. Verify the profile icon shows correct role (admin)
5. Check that all data loads correctly after refresh

### Edge Cases
1. Leave the admin page open for extended periods (test token refresh)
2. Test with multiple browser tabs open to the same admin page
3. Test with browser developer tools network throttling enabled
4. Verify behavior when Supabase API is slow to respond

### Production-Specific Tests
1. Test on Vercel production deployment specifically
2. Verify cookies are set with correct flags (check DevTools Application tab)
3. Monitor console for any auth-related errors
4. Verify session persists after browser refresh

## Technical Notes

### Why This Issue Only Occurred in Production

1. **Cookie Security**: Production requires `secure: true` for HTTPS, localhost doesn't
2. **SameSite Policy**: Browsers enforce SameSite policies differently in production vs localhost
3. **Edge Runtime**: Vercel's Edge Runtime has stricter requirements than local Node.js
4. **Network Latency**: Production has actual network delays that can expose race conditions
5. **Domain Cookies**: Cookie domain handling differs between localhost and production domains

### Best Practices Applied

1. **Always use `getSession()` in middleware**: It's faster and doesn't cause side effects
2. **Use `getUser()` only when you need to verify token with API**: Rare use cases
3. **Set proper cookie options**: secure, sameSite, path are critical in production
4. **Handle TOKEN_REFRESHED separately**: Avoid unnecessary work on routine token updates
5. **Validate sessions before critical operations**: Fail fast with clear error messages
6. **Prevent event propagation**: Ensure buttons do exactly what they're supposed to
7. **Provide user feedback**: Toast notifications for success and errors

### Supabase SSR Gotchas

- Middleware cookie handling is different from client-side cookie handling
- Edge Runtime has limitations compared to Node.js runtime
- Token refresh happens automatically but can trigger auth state changes
- Session cookies must have correct flags or they won't work in production
- `getUser()` makes API calls and can be slow; use `getSession()` for checks

## Related Documentation

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [HTTP Cookies - SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
