# IP Geolocation Implementation

## Overview
Added IP-based geolocation as a fallback when browser geolocation is blocked or unavailable.

## Changes Made

### 1. New IP Geolocation Utility
**File:** `lib/ip-geolocation.ts`

Created a utility function that:
- Uses ipapi.co as primary IP geolocation service (1000 free requests/day)
- Falls back to ip-api.com if primary service fails
- Returns city, region, country, and coordinates based on user's IP address

### 2. Updated Mobile Search Modal
**File:** `components/MobileSearchModal.tsx`

Enhanced the "Use current location" feature to:
1. **First attempt:** Browser geolocation (GPS-accurate)
2. **Fallback:** IP-based geolocation if permission is denied
3. **User feedback:** Clear toast messages indicating which method is being used

## How It Works

### Browser Geolocation Flow
1. User clicks "Use current location"
2. Browser asks for permission (if not already granted)
3. If **granted**: Uses GPS for precise location
4. If **denied**: Automatically falls back to IP geolocation

### IP Geolocation Flow
1. Makes request to ipapi.co API
2. If that fails, tries ip-api.com as backup
3. Returns approximate city based on IP address
4. User sees "(via IP location)" in the success message

## Benefits

- **No more blocked users:** Works even when geolocation permission is denied
- **Desktop-friendly:** IP geolocation works great on desktops where GPS isn't available
- **Privacy-conscious:** Users who deny geolocation can still get location-based results
- **Graceful degradation:** Smooth fallback without user intervention

## Accuracy

- **Browser Geolocation:** Very accurate (GPS-level, typically within meters)
- **IP Geolocation:** City-level accuracy (typically within 5-50km)

IP geolocation is less accurate but still useful for finding restaurants in the user's general area.

## Testing

To test the fallback:
1. Block location permissions in your browser
2. Click "Use current location"
3. Should automatically fall back to IP location
4. Toast message will say "Using IP location instead..."

## API Limits

- **ipapi.co:** 1,000 requests/day (free tier)
- **ip-api.com:** 45 requests/minute (free tier)

Both services have higher limits on paid plans if needed.
