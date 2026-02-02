# Authentication Debugging Guide

This guide explains the comprehensive debugging features added to the AuthContext to help diagnose slow profile query issues.

## Overview

The AuthContext now includes detailed performance monitoring and logging to identify exactly where time is being spent during authentication and profile loading.

## Debug Output Structure

### 1. Initialization Phase
When the app starts or page loads:

```
🚀🚀🚀🚀🚀... (40 rockets)
[AuthContext] 🚀 INITIALIZING AUTHENTICATION
🚀🚀🚀🚀🚀...
[AuthContext] Timestamp: 2025-11-13T...
[AuthContext] Browser: Client
[AuthContext] Supabase configured: true
================================================================================
```

**Timing Measured:**
- `getSession()` duration
- Total initialization time

### 2. Session Retrieval
Shows how long it takes to get the session from Supabase:

```
[AuthContext] 🔐 Getting session from Supabase...
[AuthContext] ✅ getSession() completed in 123ms

================================================================================
[AuthContext] ✅ SESSION RETRIEVED
================================================================================
[AuthContext] Status: ✅ User logged in
[AuthContext] User email: user@example.com
[AuthContext] User ID: xxx-xxx-xxx
[AuthContext] Created at: 2025-...
[AuthContext] 📦 User metadata: { ... }
[AuthContext] 📦 App metadata: { ... }
================================================================================
```

### 3. Profile Query (MOST DETAILED)
This is where most performance issues occur:

```
================================================================================
[AuthContext] 🔍 STARTING PROFILE QUERY
================================================================================
[AuthContext] User ID: xxx-xxx-xxx
[AuthContext] Timestamp: 2025-11-13T...
[AuthContext] Supabase URL: https://....supabase.co
[AuthContext] Has Anon Key: true
================================================================================

[AuthContext] 📝 Creating Supabase query...
[AuthContext] ✅ Query created (2ms)
[AuthContext] 🚀 Executing query to user_profiles table...
[AuthContext] ✅ Query executed (450ms)  ⬅️ KEY METRIC
[AuthContext] 📊 Query response status: 200
[AuthContext] 📊 Has data: true
[AuthContext] 📊 Has error: false

[AuthContext] ⏳ Waiting for query (with 5s timeout)...
[AuthContext] ✅ Query race completed successfully

================================================================================
[AuthContext] ✅ PROFILE QUERY COMPLETED
================================================================================
[AuthContext] Total duration: 452ms
[AuthContext] Performance breakdown: {
  queryCreation: "2ms",
  queryStart: "3ms",
  queryExecution: "450ms",  ⬅️ THIS IS THE NETWORK TIME
  total: "452ms"
}
[AuthContext] Performance analysis: {
  isHealthy: true,
  isSlow: false,
  isVerySlow: false,
  expectedTime: "<100ms",
  actualTime: "452ms",
  slowdownFactor: "5x"  ⬅️ HOW MANY TIMES SLOWER THAN EXPECTED
}
```

### 4. Timeout Detection
If the query takes longer than 5 seconds:

```
[AuthContext] ⚠️ Query taking longer than 2 seconds...
[AuthContext] Current state: { queryCreated: 2, queryStarted: 3, queryCompleted: 0 }

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[AuthContext] ⏱️ TIMEOUT TRIGGERED after 5 seconds
[AuthContext] Performance marks: { ... }
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[AuthContext] ❌ QUERY TIMEOUT DETAILS
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
[AuthContext] Error: Profile query timeout after 5 seconds
[AuthContext] Total wait time: 5003ms
[AuthContext] Performance breakdown: { ... }
[AuthContext] This is likely a:
  - Network connection issue
  - Supabase API slowness
  - Browser network throttling
  - Firewall/proxy interference
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```

### 5. Auth State Changes
Tracks all authentication events (sign in, sign out, token refresh):

```
🔔🔔🔔🔔🔔... (40 bells)
[AuthContext] 🔔 AUTH STATE CHANGE EVENT
🔔🔔🔔🔔🔔...
[AuthContext] Event type: SIGNED_IN
[AuthContext] Timestamp: 2025-11-13T...
[AuthContext] Has session: true
[AuthContext] Session user: user@example.com
[AuthContext] Current state: {
  hasUser: false,
  hasProfile: false,
  isLoading: true
}
================================================================================
```

## Key Metrics to Watch

### 1. Query Execution Time
**Location:** `[AuthContext] ✅ Query executed (XXXms)`

- **Healthy:** < 100ms
- **Acceptable:** 100ms - 500ms
- **Slow:** 500ms - 1000ms
- **Very Slow:** > 1000ms
- **Critical:** > 5000ms (timeout)

### 2. Performance Breakdown
Shows where time is spent:

```javascript
{
  queryCreation: "2ms",      // Time to build the Supabase query object (should be ~1-5ms)
  queryStart: "3ms",          // Time until query execution begins
  queryExecution: "450ms",    // ⭐ ACTUAL NETWORK + DATABASE TIME
  total: "452ms"             // Total time for entire operation
}
```

**If `queryExecution` is high:**
- Network issue (slow internet, VPN, proxy)
- Supabase API latency
- Geographic distance from Supabase region
- Rate limiting

**If `queryCreation` is high:**
- JavaScript performance issue
- Browser too busy with other tasks

### 3. Slowdown Factor
**Location:** `slowdownFactor: "5x"`

Shows how many times slower than expected (100ms baseline):
- **1x:** Perfect (< 100ms)
- **2-5x:** Acceptable (100-500ms)
- **5-10x:** Slow (500ms-1s)
- **10x+:** Critical investigation needed

## Cache Performance

The system uses localStorage caching to avoid unnecessary queries:

```
[AuthContext] 💾 Using cached profile (age: 30 seconds)
[AuthContext] ⚡ Cache is fresh (<1min), skipping database query
```

**Cache behavior:**
- **< 1 minute old:** Skip database query entirely (instant load)
- **1-10 minutes old:** Use cache immediately, refresh in background
- **> 10 minutes old:** Discard cache, query database

## Common Issues and Solutions

### Issue 1: Query Timeout (> 5s)
**Symptoms:**
- `[AuthContext] ⏱️ TIMEOUT TRIGGERED`
- User sees "Authentication failed" popup

**Likely Causes:**
- Poor network connection
- VPN/proxy interference
- Supabase region too far away
- Browser throttling (DevTools open with throttling enabled)

**Solutions:**
1. Check browser DevTools Network tab for "Slow 3G" or throttling
2. Disable VPN temporarily
3. Check internet connection speed
4. Try different browser
5. Check Supabase dashboard for API issues

### Issue 2: Slow Query (1-5s)
**Symptoms:**
- `slowdownFactor: "10x"` or higher
- Login takes several seconds

**Likely Causes:**
- Geographic latency (user far from Supabase region)
- Network congestion
- High Supabase load

**Solutions:**
1. Profile is cached after first load (helps subsequent loads)
2. Consider CDN or edge functions for profile data
3. Monitor Supabase status page

### Issue 3: Repeated Queries
**Symptoms:**
- Multiple profile queries in quick succession
- Profile keeps reloading

**Check for:**
- Cache not working (localStorage disabled?)
- Component remounting repeatedly
- Auth state change loop

## How to Use This Debug Output

1. **Open Browser Console** (F12)

2. **Perform Authentication Action:**
   - Login
   - Signup
   - Page refresh while logged in
   - Google OAuth

3. **Look for Key Sections:**
   ```
   🚀 INITIALIZING AUTHENTICATION
   ✅ SESSION RETRIEVED
   🔍 STARTING PROFILE QUERY
   ✅ PROFILE QUERY COMPLETED
   ```

4. **Check Timing:**
   - Note the `Total duration` value
   - Check `Performance breakdown`
   - Look at `slowdownFactor`

5. **Identify Bottleneck:**
   - High `queryExecution`? → Network/API issue
   - High `queryCreation`? → Browser/JS issue
   - Timeout? → Critical network problem

6. **Take Action:**
   - If network issue: Check connection, VPN, throttling
   - If repeated: Check cache behavior
   - If consistent slowness: Report with timing data

## Example Healthy Output

```
🚀 INITIALIZING AUTHENTICATION (0ms)
✅ getSession() completed in 45ms
✅ SESSION RETRIEVED (45ms total)

🔍 STARTING PROFILE QUERY
✅ Query created (1ms)
✅ Query executed (78ms)
✅ PROFILE QUERY COMPLETED

Performance: {
  queryExecution: "78ms",
  total: "79ms",
  slowdownFactor: "1x",
  status: "✅ Healthy"
}

✅ PROFILE LOAD COMPLETED (124ms total)
```

## Example Problem Output

```
🚀 INITIALIZING AUTHENTICATION
✅ getSession() completed in 52ms

🔍 STARTING PROFILE QUERY
✅ Query created (2ms)
🚀 Executing query...
⚠️ Query taking longer than 2 seconds...
⏱️ TIMEOUT TRIGGERED after 5 seconds

❌ QUERY TIMEOUT DETAILS
Total wait time: 5003ms
slowdownFactor: "50x"
This is likely a network connection issue

⚠️ Attempting fallback: getting user from auth
✅ Got user from auth, creating minimal profile
```

## Testing Tips

1. **Simulate Slow Network:**
   - Chrome DevTools → Network tab → Throttling dropdown
   - Select "Slow 3G" or "Fast 3G"
   - Watch timing increase in debug output

2. **Test Cache:**
   - Login
   - Check console for cache messages
   - Refresh page within 1 minute
   - Should see: `⚡ Cache is fresh (<1min), skipping database query`

3. **Test Timeout:**
   - Enable network throttling to "Offline"
   - Try to login
   - Should see timeout after 5 seconds with fallback

4. **Compare Regions:**
   - Note typical query times
   - Test from different locations/networks
   - Geographic latency should be visible in `queryExecution`

## Support Information to Provide

When reporting slow query issues, include:

1. **Browser & OS:** Chrome 120 on macOS
2. **Total Duration:** From debug output
3. **Performance Breakdown:** Full object from console
4. **Slowdown Factor:** e.g., "15x"
5. **Network Conditions:** WiFi, mobile, VPN, etc.
6. **Location:** City/Country
7. **Frequency:** Every time, occasionally, first load only
8. **Cache Status:** Working, not working, disabled
9. **Console Screenshots:** Showing the timing sections

This detailed debugging output makes it much easier to identify and fix authentication performance issues!
