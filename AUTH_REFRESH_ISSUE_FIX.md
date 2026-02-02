# Authentication Refresh Issue - Diagnosis & Fix

## Problem Summary

When logging in as paul@wisern.com on the owner dashboard:
1. Initial load shows data correctly
2. After page refresh, all data vanishes
3. Unable to logout
4. Home page data also disappears

## Root Cause

The issue is directly related to the **invalid Supabase credentials** that were set as placeholders during the signup error fix.

### Why This Happens:

1. **On Initial Login**: Authentication works because you just logged in and the auth state is in memory
2. **On Page Refresh**: The app tries to restore the session from Supabase using `supabase.auth.getSession()`
3. **Connection Fails**: Because the Supabase URL/key in `.env` are placeholders, the connection fails
4. **Session Lost**: Without the session, `user` becomes `null`
5. **Data Fails to Load**: All components (dashboard, home page) check `if (user)` before loading data
6. **Logout Fails**: Logout tries to call `supabase.auth.signOut()` which also fails

## What I've Done

### 1. Enhanced AuthContext Logging (`contexts/AuthContext.tsx`)

Added comprehensive console logging to track:
- When authentication initialization starts
- Session retrieval success/failure
- User profile loading
- Auth state changes
- SignOut process

**Look for these in your browser console:**
- `[AuthContext] Initializing authentication...`
- `[AuthContext] Session retrieved:`
- `[AuthContext] Error getting session:` (this will show the Supabase connection error)
- `[AuthContext] Signing out...`

### 2. Improved SignOut Error Handling

The `signOut` function now:
- Logs each step of the process
- Handles Supabase errors gracefully
- **Still clears local state even if Supabase call fails**
- Always redirects to home page

This means logout will work even with invalid Supabase credentials.

### 3. Created AuthDiagnostic Component

A new diagnostic card (`components/AuthDiagnostic.tsx`) shows:
- Loading state
- User session status
- User profile status
- Permissions
- Helpful troubleshooting tips

This is now visible on the owner dashboard for debugging.

### 4. Added Dashboard Alerts

The owner dashboard now shows:
- A red alert if user is not authenticated after loading
- The AuthDiagnostic component showing auth state
- Clear indication of what's wrong

## How to Fix This Issue

### Option 1: Update Supabase Credentials (Recommended)

1. Open the `.env` file in your project root
2. Update these lines with your **actual** Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

3. Get your credentials from:
   - Go to https://supabase.com
   - Select your project
   - Go to Settings > API
   - Copy Project URL and anon key

4. Restart the dev server

### Option 2: Temporary Workaround (Not Recommended)

If you can't get valid credentials right now, you could:
- Clear browser local storage
- This will force logout but won't fix the underlying issue

## Testing After Fix

Once you update the Supabase credentials:

1. **Check Browser Console**:
   - Look for `[AuthContext]` messages
   - Should see "Session retrieved: User logged in"
   - No connection errors

2. **Test Dashboard**:
   - Login as paul@wisern.com
   - Verify data loads
   - Refresh the page (F5 or Cmd+R)
   - Data should remain visible
   - Check the AuthDiagnostic card - all should be green

3. **Test Logout**:
   - Click logout button
   - Should redirect to home page
   - Should see console message "Successfully signed out from Supabase"

4. **Test Home Page**:
   - After login, home page should show restaurant data
   - After refresh, data should persist

## Files Modified

1. `contexts/AuthContext.tsx` - Enhanced logging and error handling
2. `components/AuthDiagnostic.tsx` - New diagnostic component (can be removed after fixing)
3. `app/owner/dashboard/page.tsx` - Added diagnostic display
4. `lib/supabase/client.ts` - Already updated in previous fix

## Diagnostic Commands

Check what errors appear in browser console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors related to:
   - `supabase`
   - `ERR_NAME_NOT_RESOLVED`
   - `Failed to fetch`
   - `[AuthContext]` messages

## Important Notes

- This issue is **100% caused by invalid Supabase credentials**
- The app cannot function properly without valid Supabase connection
- All authentication, data loading, and logout operations require Supabase
- The diagnostic tools I added will help confirm this

## After Fixing

Once you have valid Supabase credentials and everything works:

1. You can remove the AuthDiagnostic component from the dashboard
2. Remove the alert that shows authentication issues
3. The enhanced logging can stay - it's helpful for debugging

## Summary

**The core issue**: Invalid Supabase credentials prevent session restoration on page refresh.

**The solution**: Update `.env` with valid Supabase URL and anon key from your actual Supabase project.

**Verification**: Check browser console for `[AuthContext]` logs and use the AuthDiagnostic component to confirm everything is working.
