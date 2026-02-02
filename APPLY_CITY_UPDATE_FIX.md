# Fix: Local Hero Cannot Update City Field

## Problem
When a local hero tries to update the **city field** of a restaurant, they get a `403 Forbidden` error, even though updating other fields (country, address, etc.) works fine.

## Root Cause
The RLS (Row Level Security) policy checks:
```sql
local_hero_assignments.city_name = restaurants.city
```

When updating the city from "Chicago" to "Chicago abc":
1. The `USING` clause checks assignment to the **OLD** city ("Chicago") ✅
2. The `WITH CHECK` clause checks assignment to the **NEW** city ("Chicago abc") ❌
3. Since the local hero is only assigned to "Chicago", the update fails!

## Solution
The migration `20251119000001_fix_local_hero_city_update.sql` fixes this by:
- Keeping `USING` clause to check assignment to current city
- Relaxing `WITH CHECK` to only verify they're a local hero
- This allows local heroes to update the city field

## Apply the Fix

### Option 1: Using psql (if DATABASE_URL is set)
```bash
cd /Users/applem2/projects/Fiver/nugget/nuggetrecovery
psql $DATABASE_URL -f supabase/migrations/20251119000001_fix_local_hero_city_update.sql
```

### Option 2: In Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of:
   `supabase/migrations/20251119000001_fix_local_hero_city_update.sql`
5. Click **Run**

### Option 3: Using Supabase CLI
```bash
cd /Users/applem2/projects/Fiver/nugget/nuggetrecovery
supabase db push
```

## Test After Applying
1. Go to: https://nuggetappv2.vercel.app/local-hero/dashboard/restaurants/[id]
2. Update the **city** field
3. Click "Publish Restaurant"
4. Should see success message! ✅

## Verify the Fix
The console should show:
```
📤 Sending data to Supabase: {city: 'Chicago abc', ...}
📥 Supabase response: {result: [{...}], error: null}
```

Instead of the previous error:
```
Error: new row violates row-level security policy for table "restaurants"
```



