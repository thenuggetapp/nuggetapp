# Debug Guide: Local Hero Edit Restaurant

## Console Logs Added

I've added detailed console logging to help diagnose the restaurant update issue. Here's what each log means:

### 1. Authentication Status (On Page Load)

```
🔐 [LOCAL HERO EDIT] Auth Status: {
  isAuthorized: true/false,
  isChecking: true/false,
  userId: "...",
  userEmail: "...",
  userRole: "local_hero",
  restaurantId: "..."
}
```

**What to check:**

- ✅ `isAuthorized` should be `true`
- ✅ `userRole` should be `"local_hero"`
- ❌ If `isAuthorized` is false, the user doesn't have permission to access this page

---

### 2. Restaurant Loading

```
📖 [LOCAL HERO EDIT] Loading restaurant: <id>
📖 [LOCAL HERO EDIT] Restaurant loaded: {
  found: true,
  error: null,
  restaurantData: {
    id: "...",
    name: "...",
    city: "Chicago",
    visible: true
  }
}
```

**What to check:**

- ✅ `found` should be `true`
- ✅ `error` should be `null`
- ✅ Note the `city` - this is important for RLS policy checks

---

### 3. Save Started

```
================================================================================
💾 [LOCAL HERO EDIT] SAVE STARTED
================================================================================
📋 Form Data: { ... }
👤 User Info: {
  userId: "...",
  userEmail: "...",
  userRole: "local_hero"
}
```

**What to check:**

- ✅ Verify the form data looks correct
- ✅ User info is populated

---

### 4. Data Being Sent

```
📤 [LOCAL HERO EDIT] Data to save: {
  restaurantId: "...",
  publish: true/false,
  city: "Chicago",
  country: "United Kingdom",
  name: "...",
  amenities: { ... }
}
```

**What to check:**

- ✅ All fields look correct
- ✅ Amenities changes are included

---

### 5. Supabase Response - **THE CRITICAL ONE**

```
🚀 [LOCAL HERO EDIT] Sending update to Supabase...
📥 [LOCAL HERO EDIT] Supabase response: {
  result: [...] or null,
  error: null or {...},
  count: undefined,
  rowsAffected: 0 or 1
}
```

**What to check:**

- ✅ `result` should be an array with 1 item
- ✅ `error` should be `null`
- ✅ **`rowsAffected` should be `1`**
- ❌ **If `rowsAffected` is `0` → RLS POLICY IS BLOCKING THE UPDATE**

---

### 6. RLS Blocking Detected (Only if rowsAffected = 0)

```
❌ [LOCAL HERO EDIT] NO ROWS UPDATED - RLS POLICY BLOCKED THE UPDATE!
🔍 [LOCAL HERO EDIT] Checking permissions...
🏙️ [LOCAL HERO EDIT] City assignments: {
  assignments: [...],
  error: null,
  hasAssignmentForCity: true/false
}
👤 [LOCAL HERO EDIT] User profile: {
  profile: { role: "local_hero" },
  error: null
}
🎫 [LOCAL HERO EDIT] JWT app_metadata: {
  role: "local_hero" or undefined,
  fullMetadata: { ... }
}
```

**What to check:**

- ❌ **If `hasAssignmentForCity` is `false`** → User doesn't have city assignment
- ❌ **If JWT `role` is `undefined`** → Role is not in JWT (THIS IS THE MAIN ISSUE)
- ❌ **If profile `role` is not `"local_hero"`** → Role in database is wrong

---

### 7. Success

```
✅ [LOCAL HERO EDIT] Update successful!
📊 [LOCAL HERO EDIT] Updated data: { ... }
```

---

## Common Issues and Solutions

### Issue 1: `rowsAffected: 0` + JWT role is `undefined`

**Problem:** User's role is not set in JWT `app_metadata`

**Solution:**

1. Apply the migration: `20251120000000_fix_local_hero_update_permissions.sql`
2. Have the user **sign out and back in** to get a fresh JWT
3. Try updating again

---

### Issue 2: `rowsAffected: 0` + `hasAssignmentForCity: false`

**Problem:** User is not assigned to this restaurant's city

**Solution:**

1. Admin needs to assign the local hero to this city in `/admin/local-heroes`
2. Or verify the restaurant's city matches the assignment

---

### Issue 3: `rowsAffected: 0` + JWT role is `"local_hero"` + has city assignment

**Problem:** RLS policy still blocking despite correct setup

**Solution:**

1. Check if the migration was applied correctly
2. Verify the RLS policy includes the fallback to `user_profiles`
3. Run in Supabase SQL editor:
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'restaurants'
   AND policyname = 'Local heroes can update restaurants in their cities';
   ```

---

## Testing Steps

1. **Open browser DevTools** (F12 or Cmd+Option+I)
2. **Go to Console tab**
3. **Clear the console** (trash icon)
4. **Navigate to the restaurant edit page** as local hero
5. **Make a change** to amenities
6. **Click "Save Changes"** or "Publish Restaurant"
7. **Review the console logs** using this guide

---

## Quick SQL Checks

Run these in Supabase SQL Editor to verify setup:

### Check user's role in JWT

```sql
SELECT
  u.id,
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  up.role as profile_role
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'localhero@example.com'; -- Replace with actual email
```

Expected: Both `jwt_role` and `profile_role` should be `'local_hero'`

---

### Check city assignments

```sql
SELECT *
FROM local_hero_assignments
WHERE user_id = '<user_id>' -- Replace with actual ID
  AND is_active = true;
```

Expected: Should show the cities assigned to this local hero

---

### Check RLS policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'restaurants'
  AND policyname LIKE '%Local hero%';
```

Expected: Should show the "Local heroes can update restaurants in their cities" policy

---

## Expected Console Output (Successful Update)

```
🔐 [LOCAL HERO EDIT] Auth Status: { isAuthorized: true, ... }
📖 [LOCAL HERO EDIT] Loading restaurant: 123...
📖 [LOCAL HERO EDIT] Restaurant loaded: { found: true, ... }
================================================================================
💾 [LOCAL HERO EDIT] SAVE STARTED
================================================================================
📋 Form Data: { ... }
👤 User Info: { userId: "...", userRole: "local_hero" }
📤 [LOCAL HERO EDIT] Data to save: { ... }
🚀 [LOCAL HERO EDIT] Sending update to Supabase...
📥 [LOCAL HERO EDIT] Supabase response: { rowsAffected: 1, error: null }
✅ [LOCAL HERO EDIT] Update successful!
📊 [LOCAL HERO EDIT] Updated data: { ... }
================================================================================
💾 [LOCAL HERO EDIT] SAVE COMPLETED
================================================================================
```

---

## Expected Console Output (RLS Blocking)

```
🔐 [LOCAL HERO EDIT] Auth Status: { isAuthorized: true, ... }
📖 [LOCAL HERO EDIT] Loading restaurant: 123...
📖 [LOCAL HERO EDIT] Restaurant loaded: { found: true, city: "Chicago" }
================================================================================
💾 [LOCAL HERO EDIT] SAVE STARTED
================================================================================
📋 Form Data: { ... }
👤 User Info: { userId: "...", userRole: "local_hero" }
📤 [LOCAL HERO EDIT] Data to save: { city: "Chicago", ... }
🚀 [LOCAL HERO EDIT] Sending update to Supabase...
📥 [LOCAL HERO EDIT] Supabase response: { rowsAffected: 0, error: null }
❌ [LOCAL HERO EDIT] NO ROWS UPDATED - RLS POLICY BLOCKED THE UPDATE!
🔍 [LOCAL HERO EDIT] Checking permissions...
🏙️ [LOCAL HERO EDIT] City assignments: { hasAssignmentForCity: true }
👤 [LOCAL HERO EDIT] User profile: { role: "local_hero" }
🎫 [LOCAL HERO EDIT] JWT app_metadata: { role: undefined }  ⬅️ THIS IS THE PROBLEM!
❌ [LOCAL HERO EDIT] Error: Update blocked by database permissions...
================================================================================
💾 [LOCAL HERO EDIT] SAVE COMPLETED
================================================================================
```

The missing JWT role is the smoking gun! 🎯


