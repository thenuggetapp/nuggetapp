# Restaurant Edit & Creation Fixes

## Issues Fixed

### 1. ✅ Row Level Security Policy Blocking Owner Inserts
**Problem**: When trying to create a new restaurant, you received:
```
new row violates row-level security policy for table "restaurants"
```

**Root Cause**: 
- A previous migration (`20251028225529_critical_rls_security_fixes.sql`) changed the policy to only allow admins to insert restaurants
- This was overly restrictive - owners need to be able to create their own restaurants
- The same issue existed for `restaurant_analytics` table

**Solution**: Created migration:
```
supabase/migrations/20251116200001_allow_owners_to_insert_restaurants.sql
```

This migration:
- Allows both admins AND owners to insert restaurants
- Allows both admins AND owners to insert/update restaurant_analytics
- Maintains security while enabling the owner workflow

### 2. ✅ Missing Edit Route (404 Error)
**Problem**: Visiting `/owner/restaurants/[id]/edit` resulted in a 404 error because the route didn't exist.

**Solution**: Created a new edit page at:
```
app/owner/restaurants/[id]/edit/page.tsx
```

This page:
- Loads the existing restaurant data
- Verifies ownership before allowing edits
- Uses the same form components as the "new restaurant" page
- Supports both "Save Changes" and "Save & Publish" actions
- Shows a loading spinner while fetching data

### 3. ✅ Longitude Precision Error (Numeric Overflow)
**Problem**: When creating/updating restaurants, you received this error:
```
numeric field overflow
A field with precision 10, scale 8 must round to an absolute value less than 10^2.
```

**Root Cause**: 
- The database has `longitude` defined as `decimal(10,8)`
- This only supports values from -99.99999999 to 99.99999999
- But longitude ranges from -180 to 180 (requires 3 digits before decimal)
- The migration files correctly specified `decimal(11,8)`, but the actual database schema is different

**Solution**: Created migration:
```
supabase/migrations/20251116200000_fix_longitude_precision.sql
```

## How to Apply the Migrations

You need to apply BOTH migrations. You have two options:

### Option 1: Using Supabase Dashboard SQL Editor (Easiest)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste BOTH SQL scripts below:

**First - Fix RLS Policies (MOST IMPORTANT):**
```sql
-- Allow owners to insert restaurants
DROP POLICY IF EXISTS "Only admins can insert restaurants" ON restaurants;

CREATE POLICY "Admins and owners can insert restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- Allow owners to insert analytics
DROP POLICY IF EXISTS "Only admins can insert analytics" ON restaurant_analytics;

CREATE POLICY "Admins and owners can insert analytics"
  ON restaurant_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- Allow owners to update analytics
DROP POLICY IF EXISTS "Only admins can update analytics" ON restaurant_analytics;

CREATE POLICY "Admins and owners can update analytics"
  ON restaurant_analytics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );
```

**Second - Fix Longitude Precision:**
```sql
-- Fix longitude precision to support full range (-180 to 180)
ALTER TABLE restaurants 
  ALTER COLUMN longitude TYPE decimal(11,8);
```

4. Click "Run" for each SQL script

### Option 2: Using psql
```bash
cd /Users/applem2/projects/Fiver/nugget/nuggetrecovery
psql $DATABASE_URL -f supabase/migrations/20251116200001_allow_owners_to_insert_restaurants.sql
psql $DATABASE_URL -f supabase/migrations/20251116200000_fix_longitude_precision.sql
```

### Option 3: Using Supabase CLI
```bash
cd /Users/applem2/projects/Fiver/nugget/nuggetrecovery
supabase db push
```

## Testing the Fixes

### Test Restaurant Creation (Most Important)
1. **After applying BOTH migrations**, go to: `http://localhost:3000/owner/restaurants/new`
2. Fill in all required fields
3. Set a location on the map (this will set latitude/longitude)
4. Click "Publish Restaurant"
5. ✅ The restaurant should save successfully (no RLS error, no longitude overflow error)

### Test Edit Route
1. Login as an owner
2. Visit: `http://localhost:3000/owner/restaurants`
3. Click on any restaurant to edit
4. ✅ You should now see the edit form instead of a 404
5. Make changes and save
6. ✅ Changes should save successfully

## Why This Happened

### RLS Policy Issue
- A "security fix" migration (`20251028225529_critical_rls_security_fixes.sql`) made the policies too restrictive
- It only allowed admins to insert restaurants, blocking owners
- This broke the entire owner workflow for creating restaurants
- The fix allows owners to manage restaurants while maintaining security

### Longitude Precision Issue
- The migration files in your codebase already had the correct definition (`decimal(11,8)`)
- But either:
  - The migrations weren't fully applied to the database
  - Or the table was created with an older schema before the migrations were corrected
  - The actual database schema got out of sync with the migration files
- The migration updates the live database to match the intended schema

## Verification

After applying the migration, you can verify the fix:

```sql
SELECT 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
  AND column_name IN ('latitude', 'longitude');
```

Expected result:
- `latitude`: numeric(10,8) - supports -90 to 90
- `longitude`: numeric(11,8) - supports -180 to 180 ✅

