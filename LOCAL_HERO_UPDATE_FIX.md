# Local Hero Restaurant Update Fix

## Problem Summary

When a local hero logs into the dashboard and tries to edit restaurants (particularly the amenities section), clicking "Save Changes" or "Publish Restaurant" shows a success message, but **the database is not actually updated**.

## Root Cause Analysis

### The Issue

This is an **RLS (Row Level Security) policy problem** with a silent failure mode:

1. **RLS Policy Requirement**: The current RLS policy checks for the user's role in the JWT token:

   ```sql
   (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_hero'
   ```

2. **Missing JWT Metadata**: Many local hero users have their role stored in the `user_profiles` table, but **NOT in the JWT's `app_metadata`**. This causes the RLS policy to evaluate to `false`.

3. **Silent Failure**: When the RLS policy blocks the update:
   - Supabase doesn't throw an error
   - It just returns 0 rows affected
   - The application sees "no error" and shows "success"
   - But the database was never updated

### Why This Happened

The system migrated to using JWT-based role checks (to avoid circular dependencies in RLS policies), but:

- The migration to sync existing users' roles to JWT may not have run
- Some local hero accounts were created before this migration
- The fallback to check `user_profiles` table was removed to improve performance

### Additional Issues Found

1. **Incomplete WITH CHECK Clause**: The policy's `WITH CHECK` only verified the user is a local_hero, but didn't verify they're assigned to the city. This could allow a local hero to change a restaurant's city to one they don't have access to.

2. **No Fallback**: The policy only checked JWT, with no fallback to `user_profiles`, making it fail for any user whose JWT wasn't synced.

## The Solution

The migration file `20251120000000_fix_local_hero_update_permissions.sql` fixes all these issues:

### 1. Ensures Table Exists

Creates the `local_hero_assignments` table if it doesn't exist (with proper indexes).

### 2. Syncs Roles to JWT

Runs a one-time sync to update all existing local hero users' JWT app_metadata:

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', 'local_hero')
WHERE id IN (SELECT id FROM user_profiles WHERE role = 'local_hero');
```

### 3. Fixes RLS Policy

Creates a new policy that checks **BOTH** JWT and `user_profiles`:

```sql
-- Check if user is local_hero (check BOTH JWT and user_profiles)
(
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_hero' OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'local_hero'
  )
)
AND
-- Verify city assignment OR ownership
(...)
```

This provides:

- **Immediate fix**: Works for users without JWT role (fallback to user_profiles)
- **Performance**: Prefers JWT check (fast) when available
- **Compatibility**: Works for all users regardless of JWT sync status

### 4. Fixes WITH CHECK Clause

Now properly validates that the user has access to the city:

```sql
WITH CHECK (
  -- Must be local_hero
  (...role check...)
  AND
  -- Must have city assignment or ownership
  (
    EXISTS (SELECT 1 FROM local_hero_assignments WHERE ...)
    OR
    EXISTS (SELECT 1 FROM restaurant_ownership WHERE ...)
  )
)
```

### 5. Adds Ongoing Sync

Creates a trigger that automatically syncs role changes to JWT:

```sql
CREATE TRIGGER sync_role_to_jwt_trigger
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_role_to_jwt();
```

### 6. Adds Debug Function

Provides a `debug_local_hero_permissions()` function to diagnose permission issues:

```sql
SELECT debug_local_hero_permissions('<user_id>', '<restaurant_id>');
```

Returns:

```json
{
  "user_id": "...",
  "restaurant_id": "...",
  "restaurant_city": "Chicago",
  "user_role_in_profiles": "local_hero",
  "user_role_in_jwt": "local_hero",
  "has_city_assignment": true,
  "has_ownership": false,
  "can_update": true
}
```

## How to Apply the Fix

### Step 1: Run the Migration

```bash
# Apply the migration to your Supabase database
supabase migration up
```

Or run the SQL file directly in the Supabase SQL editor.

### Step 2: Verify the Fix

Run these verification queries in Supabase SQL editor:

```sql
-- 1. Check if local heroes have role in JWT
SELECT
  u.id,
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  up.role as profile_role
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE up.role = 'local_hero';

-- Expected: jwt_role should now show 'local_hero' for all users

-- 2. Check city assignments
SELECT * FROM local_hero_assignments WHERE is_active = true;

-- 3. Test specific user permissions (replace with actual IDs)
SELECT debug_local_hero_permissions(
  '<local_hero_user_id>',
  '<restaurant_id>'
);
```

### Step 3: Have Local Heroes Re-login

**Important**: Users need to sign out and back in to get a fresh JWT with the updated role:

1. Ask local heroes to sign out
2. Have them sign back in
3. Their JWT will now include the role in app_metadata

### Step 4: Test the Update

1. Login as a local hero
2. Navigate to a restaurant in their assigned city
3. Edit the amenities section
4. Click "Save Changes"
5. Verify the changes appear in the database

## Prevention

The trigger added in this migration will automatically keep JWT roles in sync going forward. Whenever a user's role is changed in `user_profiles`, it will automatically update their JWT metadata.

However, **users still need to sign out and back in** for the JWT change to take effect.

## Performance Impact

- **Minimal**: The policy first checks JWT (instant), then falls back to user_profiles query only if needed
- **Indexed**: All relevant columns have indexes for fast lookups
- **No Circular Dependencies**: Still avoids the circular dependency issues that plagued earlier implementations

## Security Impact

- **Enhanced**: The fixed WITH CHECK clause now properly validates city assignments
- **No Regression**: All existing security checks are maintained
- **Backwards Compatible**: Works for both old and new users

## Monitoring

To monitor if there are still users without JWT roles:

```sql
SELECT COUNT(*)
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE up.role = 'local_hero'
  AND (u.raw_app_meta_data->>'role') IS NULL;
```

If this returns > 0, those users haven't had their JWT synced yet.

## Rollback

If needed, you can rollback by dropping the new policy and restoring the old one:

```sql
DROP POLICY IF EXISTS "Local heroes can update restaurants in their cities" ON restaurants;

-- Restore previous policy (without fallback)
CREATE POLICY "Local heroes can update restaurants in their cities"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'local_hero' AND
    EXISTS (
      SELECT 1 FROM local_hero_assignments
      WHERE user_id = auth.uid()
        AND city_name = restaurants.city
        AND is_active = true
    )
  )
  WITH CHECK (...);
```

## Questions?

If issues persist after applying this fix:

1. Check the verification queries above
2. Use the debug function to inspect specific permission issues
3. Verify the local hero has an active city assignment
4. Ensure they've signed out and back in to get fresh JWT


