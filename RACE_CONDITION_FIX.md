# Race Condition Fix - Admin Role Loss on Refresh

## Critical Issue Identified

A race condition in the `AuthContext` was causing admin users to appear as customers after page refresh in production.

## The Race Condition

### What Was Happening

1. User refreshes admin page
2. `initializeAuth()` starts loading
3. Supabase triggers `TOKEN_REFRESHED` event during initialization
4. Original `TOKEN_REFRESHED` handler set `loading = false` immediately
5. Admin page checks `!authLoading && user` → both true
6. Admin page proceeds WITHOUT checking `userProfile` or `role`
7. `loadUserProfile()` hasn't finished yet
8. Admin page loads with `user` but no `userProfile`
9. User appears as "customer" (default) instead of "admin"

### Timeline Diagram

```
Time →
├─ 0ms:  Page refresh, initializeAuth() starts
├─ 50ms: getSession() returns user
├─ 60ms: TOKEN_REFRESHED event fires
├─ 61ms: TOKEN_REFRESHED handler sets loading=false ❌
├─ 62ms: Admin page useEffect runs: authLoading=false, user=exists ✓
├─ 63ms: Admin page starts loading restaurants
├─ 100ms: loadUserProfile() finally completes (TOO LATE)
└─ Result: User shown as customer, not admin
```

## Root Causes

### 1. TOKEN_REFRESHED Handler Set Loading Too Early
**File**: `contexts/AuthContext.tsx` (lines 157-162)

**Problem Code**:
```typescript
if (event === 'TOKEN_REFRESHED') {
  console.log('[AuthContext] Token refreshed - updating user object only');
  setUser(session?.user ?? null);
  if (mounted) setLoading(false);  // ❌ TOO EARLY!
  return;
}
```

**Issue**: Set `loading=false` without verifying profile was loaded

### 2. Admin Page Didn't Check Role
**File**: `app/admin/page.tsx` (lines 235-243)

**Problem Code**:
```typescript
useEffect(() => {
  if (!authLoading && !user) {
    router.push('/login');
    return;
  }
  if (user) {  // ❌ No role check!
    loadRestaurants();
  }
}, [user, authLoading, router]);
```

**Issues**:
- Only checked `authLoading` and `user`
- Never checked `userProfile` or `role`
- Proceeded even when profile wasn't loaded yet

## Solutions Implemented

### 1. Fixed TOKEN_REFRESHED Handler
**File**: `contexts/AuthContext.tsx`

**New Code**:
```typescript
if (event === 'TOKEN_REFRESHED') {
  console.log('[AuthContext] Token refreshed');
  setUser(session?.user ?? null);

  // Only set loading to false if we already have a profile loaded
  // Otherwise, let the normal flow load the profile
  if (userProfile && mounted) {
    console.log('[AuthContext] Profile already loaded, skipping reload');
    setLoading(false);
  } else if (session?.user && mounted) {
    console.log('[AuthContext] No profile loaded yet, loading now');
    try {
      await loadUserProfile(session.user.id);
    } catch (err) {
      console.error('[AuthContext] Error loading profile on token refresh:', err);
      if (mounted) {
        setUserProfile(null);
        setPermissions(getRolePermissions(null, []));
      }
    } finally {
      if (mounted) setLoading(false);
    }
  } else {
    if (mounted) setLoading(false);
  }
  return;
}
```

**How it fixes the issue**:
- Checks if `userProfile` already exists before setting loading=false
- If no profile, loads it before setting loading=false
- Ensures profile is ALWAYS loaded before admin page can proceed

### 2. Added Proper Role Checking to Admin Page
**File**: `app/admin/page.tsx`

**New Code**:
```typescript
useEffect(() => {
  // Wait for auth to finish loading
  if (authLoading) {
    console.log('[Admin] Auth still loading...');
    return;
  }

  // If no user, redirect to login
  if (!user) {
    console.log('[Admin] No user found, redirecting to login');
    router.push('/login');
    return;
  }

  // If user exists but no profile yet, wait for profile to load
  if (!userProfile) {
    console.log('[Admin] User exists but profile not loaded yet, waiting...');
    return;
  }

  // Check if user has admin role
  if (userProfile.role !== 'admin') {
    console.error('[Admin] User is not an admin:', userProfile.role);
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to access this page.',
      variant: 'destructive',
    });
    router.push('/');
    return;
  }

  // All checks passed, load restaurants
  console.log('[Admin] Admin verified, loading restaurants');
  loadRestaurants();
}, [user, userProfile, authLoading, router]);
```

**How it fixes the issue**:
- Added `userProfile` to dependencies
- Waits for profile to load before proceeding
- Explicitly checks `userProfile.role === 'admin'`
- Returns early if role is not admin
- Only loads restaurants after all checks pass

### 3. Added Loading Guards
**File**: `app/admin/page.tsx`

**New Code**:
```typescript
// Show loading state while auth is initializing
if (authLoading) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8dbf65] mx-auto mb-4"></div>
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

// Show loading state while waiting for profile
if (user && !userProfile) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8dbf65] mx-auto mb-4"></div>
        <p className="text-slate-600">Loading profile...</p>
      </div>
    </div>
  );
}
```

**How it prevents the issue**:
- Shows loading spinner while auth is initializing
- Shows loading spinner while profile is being fetched
- Prevents rendering admin UI until profile is confirmed loaded
- User sees intentional loading state instead of broken UI

## Fixed Timeline

```
Time →
├─ 0ms:  Page refresh, initializeAuth() starts
├─ 50ms: getSession() returns user
├─ 60ms: TOKEN_REFRESHED event fires
├─ 61ms: TOKEN_REFRESHED handler checks: userProfile exists? NO
├─ 62ms: TOKEN_REFRESHED handler calls loadUserProfile()
├─ 100ms: loadUserProfile() completes, sets userProfile ✓
├─ 101ms: TOKEN_REFRESHED handler sets loading=false ✓
├─ 102ms: Admin page useEffect runs: authLoading=false, user=exists, userProfile=exists ✓
├─ 103ms: Admin page checks: userProfile.role === 'admin'? YES ✓
└─ Result: User correctly shown as admin ✓
```

## Why This Only Affected Production

1. **Network Latency**: Production has real network delays, making race conditions more likely
2. **Token Refresh Timing**: Production tokens expire and refresh more frequently
3. **Edge Runtime**: Vercel's edge network has different timing characteristics
4. **Cookie Operations**: Production cookie operations are slower due to encryption/security

## Testing the Fix

### Manual Tests

1. **Basic Refresh Test**:
   - Log in as admin
   - Refresh the page multiple times
   - Verify role remains "admin" in profile icon
   - Verify dashboard loads correctly

2. **Rapid Refresh Test**:
   - Log in as admin
   - Rapidly refresh the page 5-10 times
   - Verify no role changes occur
   - Verify no "Access Denied" messages

3. **Token Refresh Test**:
   - Log in as admin
   - Leave tab open for 60+ minutes (wait for token to expire)
   - Interact with the page to trigger token refresh
   - Verify role remains "admin"

4. **Multiple Tab Test**:
   - Open admin page in 2+ tabs
   - Refresh one tab
   - Verify all tabs maintain admin role

### Debugging in Production

Check browser console for these log messages:

**Successful Flow**:
```
[AuthContext] Initializing authentication...
[AuthContext] Session retrieved: User logged in
[AuthContext] Loading user profile for: admin@example.com
[AuthContext] Profile loaded: admin admin@example.com
[AuthContext] Token refreshed
[AuthContext] Profile already loaded, skipping reload
[Admin] Auth still loading...
[Admin] User exists but profile not loaded yet, waiting...
[Admin] Admin verified, loading restaurants
```

**Failed Flow (should not happen after fix)**:
```
[AuthContext] Token refreshed
[AuthContext] Token refreshed - updating user object only  ❌ OLD CODE
[Admin] User is not an admin: customer  ❌ RACE CONDITION
```

## Related Issues Fixed

This fix also resolves:
- Users appearing as wrong role after token refresh
- "Access Denied" messages when refreshing admin pages
- Profile data not being available when it should be
- Inconsistent role state across page refreshes

## Best Practices Learned

1. **Always check profile, not just user**: User object exists before profile loads
2. **Wait for all auth state**: Check `authLoading`, `user`, AND `userProfile`
3. **Don't set loading=false prematurely**: Ensure all required data is loaded first
4. **Add explicit role checks**: Never assume role based on page URL
5. **Show loading states**: Better UX than showing incorrect data briefly
6. **Log extensively**: Helps debug race conditions in production
7. **Test with network delays**: Use Chrome DevTools throttling to simulate production

## Prevention

To prevent similar issues in the future:

1. Always include `userProfile` in auth-checking useEffect dependencies
2. Always check role explicitly, not just user existence
3. Add loading guards when rendering role-specific UI
4. Test with simulated network delays
5. Review all `onAuthStateChange` handlers for race conditions
6. Consider using a state machine for complex auth flows
