# Tab Switch - Prevent Unnecessary API Calls

## Problem

When users switch between browser tabs and return to the `/admin` page, the component was making all API calls again (restaurants, profile, subscriptions, etc.), causing:
- Unnecessary network traffic
- Wasted database queries
- Poor performance
- Increased costs

## Root Cause

React's `useEffect` was re-running when the component re-rendered after returning to the tab, even though the data was already loaded. The dependencies (`user`, `userProfile`, `authLoading`) would sometimes trigger re-evaluation.

## Solution Implemented

### 1. **Data Load Tracking**
Added a state flag `hasLoadedData` to track whether data has already been fetched:

```typescript
const [hasLoadedData, setHasLoadedData] = useState(false);
```

### 2. **Conditional Data Loading**
Modified the main `useEffect` to check if data is already loaded before fetching:

```typescript
useEffect(() => {
  // ... auth checks ...
  
  // Only load if not already loaded
  if (!hasLoadedData) {
    console.log("[Admin] ✅ Loading restaurants data (first time)");
    loadRestaurants();
  } else {
    console.log("[Admin] ✅ Data already loaded - skipping fetch");
    setLoading(false);
  }
}, [user, userProfile, authLoading, hasLoadedData]);
```

### 3. **Mark Data as Loaded**
Set the flag after successful data fetch:

```typescript
const loadRestaurants = async () => {
  // ... fetch restaurants ...
  setRestaurants(data || []);
  setFilteredRestaurants(data || []);
  calculateStats(data || []);
  setHasLoadedData(true); // ✅ Mark as loaded
};
```

### 4. **Manual Refresh Support**
Reset the flag when user explicitly clicks the Refresh button:

```typescript
<Button onClick={() => {
  setHasLoadedData(false); // Reset flag
  loadRestaurants();
}}>
  Refresh
</Button>
```

### 5. **Tab Visibility Tracking**
Added visibility change listener for debugging and future optimizations:

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      console.log("[Admin] 👁️ Tab visible - data loaded:", hasLoadedData);
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [hasLoadedData]);
```

## How It Works

### First Visit to /admin:
1. User navigates to `/admin`
2. `hasLoadedData` is `false`
3. Auth completes → `loadRestaurants()` is called
4. Data loads → `hasLoadedData` set to `true`
5. ✅ User sees dashboard with data

### Switch Tab and Return:
1. User switches to another tab
2. User returns to `/admin` tab
3. Component re-renders (normal React behavior)
4. `useEffect` runs again
5. `hasLoadedData` is `true` → **Skip API call** ✅
6. Data remains displayed (no flickering)

### Manual Refresh:
1. User clicks "Refresh" button
2. `hasLoadedData` set to `false`
3. `loadRestaurants()` called
4. Fresh data fetched
5. `hasLoadedData` set back to `true`

## Benefits

✅ **No Unnecessary API Calls** - Data fetched only once per session  
✅ **Better Performance** - Instant display when returning to tab  
✅ **Reduced Costs** - Fewer database queries  
✅ **Better UX** - No loading spinner when switching tabs  
✅ **Data Persistence** - Restaurants list remains visible  
✅ **Manual Control** - Users can still refresh when needed

## Testing

### Test 1: Tab Switching
1. Login as admin
2. Navigate to `/admin` - data loads
3. Switch to another tab
4. Return to `/admin` tab
5. ✅ Data still visible, no loading, no API calls

### Test 2: Manual Refresh
1. On `/admin` page with data loaded
2. Click "Refresh" button
3. ✅ Data reloads, API calls are made
4. Fresh data displayed

### Test 3: Navigation Away and Back
1. On `/admin` page with data loaded
2. Navigate to `/` (home)
3. Navigate back to `/admin`
4. ✅ Data loads fresh (component unmounted/remounted)

## Console Logs to Look For

**First Load:**
```
[Admin] 🔄 useEffect triggered
[Admin] ✅ Admin verified, loading restaurants data (first time)
[Admin] 📊 loadRestaurants called
[Admin] ✅ Fetched 150 restaurants
```

**Tab Switch:**
```
[Admin] 👁️ Tab became visible - data already loaded: true
[Admin] ✅ Admin verified, but data already loaded - skipping fetch
```

**Manual Refresh:**
```
[Admin] 🔄 Manual refresh triggered
[Admin] 📊 loadRestaurants called
[Admin] ✅ Fetched 150 restaurants
```

## Important Notes

1. **Session-based caching**: The flag is component state, so it resets if user navigates away from `/admin` and returns later (which is fine)

2. **Combines with localStorage caching**: This works together with the AuthContext caching from the previous fix - double optimization!

3. **Real-time updates still work**: When creating/editing/deleting restaurants, `loadRestaurants()` is still called normally

4. **Not affected by page visibility**: Data doesn't reload when tab visibility changes, only when component dependencies actually change

## Future Enhancements

If needed, we could add:
- Stale data detection (reload after X minutes)
- Smart refresh (only if data is > 5 minutes old)
- Invalidation on specific actions
- Cache expiry based on time

## Files Modified

- ✏️ `app/admin/page.tsx` - Added `hasLoadedData` flag and conditional loading logic
- 📄 `TAB_SWITCH_FIX.md` - This documentation

---

**Result:** Admin page now intelligently caches data and prevents unnecessary API calls when switching tabs! 🎉

