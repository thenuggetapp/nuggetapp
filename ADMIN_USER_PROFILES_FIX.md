# Admin User Profiles Access - Fixed

## Problem

You wanted to add an RLS policy to allow admins to view all user profiles in `/admin/users`, but the policy caused errors:

```sql
-- ❌ This policy creates a circular dependency!
CREATE POLICY "admins_can_view_all_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles AS me  -- ❌ Queries the SAME table!
    WHERE me.id = auth.uid() AND me.role = 'admin'
  )
);
```

### Why It Failed: Circular Dependency

1. **AuthContext** tries to query `user_profiles` to get user's role
2. **RLS policy activates** and checks `user_profiles` to see if user is admin
3. **This triggers another RLS check** on `user_profiles`
4. **Infinite loop!** 💥

The error occurred because the policy queries the **same table** it's protecting, creating infinite recursion.

## Solution: Use JWT Token Instead

Instead of querying the database, we check the user's role from their **JWT token** (stored in `auth.users.raw_app_meta_data`):

```sql
-- ✅ This policy uses JWT - NO database query!
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Check JWT token for admin role (no circular dependency!)
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

### Why This Works

- **JWT tokens** contain user metadata that can be checked instantly
- **No database query** needed, so no circular dependency
- **Fast and secure** - JWT is already validated by Supabase

## What Was Done

### 1. Created Migration: `fix_admin_user_profiles_rls.sql`

This migration includes:

#### A. Added Admin View Policy (No Circular Dependency)
```sql
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

#### B. Added Admin Update Policy
```sql
CREATE POLICY "Admins can update any user profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

#### C. Updated Trigger to Sync Role to JWT
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (...);

  -- CRITICAL: Set role in app_metadata for JWT
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', user_role)
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### D. Created Admin Function to Update User Roles
```sql
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS void AS $$
BEGIN
  -- Validate caller is admin
  IF (auth.jwt() -> 'app_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;

  -- Update user_profiles table
  UPDATE user_profiles SET role = new_role WHERE id = target_user_id;

  -- Update auth.users app_metadata (for JWT)
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', new_role)
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### E. Synced Existing User Roles to JWT
```sql
-- One-time sync of existing users
DO $$
BEGIN
  FOR user_record IN SELECT id, role FROM user_profiles LOOP
    UPDATE auth.users
    SET raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb) ||
      jsonb_build_object('role', user_record.role)
    WHERE id = user_record.id;
  END LOOP;
END $$;
```

### 2. Updated Admin Users Page

Changed `/app/admin/users/page.tsx` to use the new function:

```typescript
// ❌ Old code - only updates user_profiles table
const { error } = await supabase
  .from('user_profiles')
  .update({ role: newRole })
  .eq('id', selectedUser.id);

// ✅ New code - updates both user_profiles AND JWT
const { error } = await supabase.rpc('admin_update_user_role', {
  target_user_id: selectedUser.id,
  new_role: newRole,
});
```

## How It Works Now

### For Admin Users

1. **Admin signs in** → JWT contains `app_metadata.role = 'admin'`
2. **Admin visits `/admin/users`** → Queries `user_profiles` table
3. **RLS policy checks JWT** → `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'` ✅
4. **All user profiles returned** → No circular dependency!

### For Regular Users

1. **User signs in** → JWT contains `app_metadata.role = 'customer'`
2. **User tries to query all profiles** → RLS policy checks JWT
3. **Policy check fails** → `'customer' != 'admin'` ❌
4. **Only their own profile returned** → Via "Users can view own profile" policy

### When Changing User Roles

1. **Admin changes user role** → Calls `admin_update_user_role()` function
2. **Function updates `user_profiles.role`** → Database updated
3. **Function updates `auth.users.raw_app_meta_data`** → JWT metadata updated
4. **User must sign out and back in** → To get new JWT with updated role

## Testing

### Verify Your Admin User Has Role in JWT

```sql
SELECT
  id,
  email,
  raw_app_meta_data->>'role' as jwt_role
FROM auth.users
WHERE email = 'your-email@example.com';
```

Expected result:
```
jwt_role: 'admin'
```

### Test Admin Can View All Users

```sql
SELECT COUNT(*) FROM user_profiles;
```

Should return the total number of users (not just 1).

### Test Regular User Can Only See Their Own Profile

Sign in as a non-admin user and query `user_profiles`. You should only see your own profile.

## Important Notes

### ⚠️ Users Must Re-Login After Role Changes

When you change a user's role via the admin panel:
- The `user_profiles` table is updated immediately
- The `auth.users.raw_app_meta_data` is updated immediately
- BUT the user's current JWT token still has the OLD role

**The user must sign out and sign back in** to get a new JWT with the updated role.

### ✅ No More Circular Dependencies

The new policy:
- ✅ Uses `auth.jwt()` to check role (instant, no database query)
- ✅ No circular dependency on `user_profiles` table
- ✅ Fast and efficient
- ✅ Secure (JWT is cryptographically signed)

### 📝 RLS Policies Now Active

Current policies on `user_profiles`:

1. **Users can view own profile** - Regular users see only their profile
2. **Users can update own profile** - Regular users can edit their own data
3. **Users can insert own profile** - New users can create their profile
4. **Admins can view all user profiles** - Admins see everyone (NEW!)
5. **Admins can update any user profile** - Admins can edit anyone's role (NEW!)

## Summary

✅ **Problem fixed**: No more circular dependency errors
✅ **Admin can view all users**: `/admin/users` page now works
✅ **Role updates work**: Admin can change user roles via UI
✅ **Secure**: Only admins can access other users' profiles
✅ **Fast**: JWT checks are instant (no database queries)

The admin users page at `https://nuggetappv2.vercel.app/admin/users` should now work perfectly!
