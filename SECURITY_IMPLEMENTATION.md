# Critical Security Implementation - Phase 1

## Overview

This document outlines the critical security fixes implemented to protect against the 5 most severe vulnerabilities in the application.

## Fixed Vulnerabilities

### 1. Unauthorized Restaurant Deletion
**Before:** Any authenticated user could delete ANY restaurant
**After:** Only admins and verified restaurant owners can delete their own restaurants

### 2. Unauthorized Restaurant Modification  
**Before:** Any authenticated user could update ANY restaurant
**After:** Only admins and verified restaurant owners can update their own restaurants

### 3. Unauthorized Analytics Manipulation
**Before:** Any authenticated user could insert/update restaurant analytics
**After:** Only admins can manage analytics data

### 4. User PII Exposure
**Before:** All authenticated users could view complete profiles of all other users
**After:** Users can only see their own full profile and limited public info of others

### 5. No API Authentication
**Before:** API routes had no authentication checks
**After:** Authentication middleware available for protecting API routes

## New Files Created

### Authentication Middleware
- `lib/middleware/auth.ts` - JWT verification and role-based access control
- `lib/middleware/rateLimit.ts` - Rate limiting implementation
- `lib/supabase/server.ts` - Server-side Supabase client

### Database Migration
- `supabase/migrations/[timestamp]_critical_rls_security_fixes.sql`

## Database Changes

### New Tables
1. **audit_logs** - Tracks all modifications to sensitive data
   - user_id, action, table_name, record_id
   - old_data and new_data (JSONB)
   - ip_address and user_agent tracking

2. **rate_limits** - Tracks API request rates
   - identifier (user_id or IP)
   - endpoint, request_count
   - window_start for time-based limiting

### New Functions
1. **verify_restaurant_ownership(restaurant_uuid, user_uuid)**
   - Server-side ownership verification
   - Returns boolean

2. **prevent_auto_verified_ownership()**
   - Trigger function that prevents users from self-verifying ownership
   - Only admins can verify ownership

### New Triggers
1. **enforce_ownership_verification** on restaurant_ownership
   - Prevents auto-verified ownership claims

2. **audit_restaurants** on restaurants
   - Logs all INSERT/UPDATE/DELETE operations

## Row Level Security (RLS) Policies Updated

### Restaurants Table
- ❌ Removed: "Authenticated users can delete restaurants"
- ✅ Added: "Only admins and verified owners can delete restaurants"
- ❌ Removed: "Authenticated users can update restaurants"
- ✅ Added: "Only admins and verified owners can update restaurants"
- ❌ Removed: "Authenticated users can insert restaurants"
- ✅ Added: "Only admins can insert restaurants"

### User Profiles Table
- ❌ Removed: "Authenticated users can view profiles"
- ✅ Added: "Users can view own full profile"
- ✅ Added: "Users can view limited public profiles"

### Restaurant Analytics Table
- ❌ Removed: "System can insert/update analytics"
- ✅ Added: "Only admins can insert/update analytics"

### Audit Logs Table
- ✅ Added: "Only admins can view audit logs"
- ✅ Added: "System can insert audit logs"

### Rate Limits Table
- ✅ Added: "Only system can manage rate limits"

## How to Use

### Protecting API Routes

```typescript
// app/api/protected/route.ts
import { withAuth } from '@/lib/middleware/auth';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (req) => {
  // req.user is now available with { id, email, role }
  return NextResponse.json({ data: 'protected data' });
});

// Require admin access
export const DELETE = withAuth(async (req) => {
  return NextResponse.json({ success: true });
}, { requireAdmin: true });

// Require owner or admin access
export const PUT = withAuth(async (req) => {
  return NextResponse.json({ success: true });
}, { requireOwner: true });
```

### Implementing Rate Limiting

```typescript
// app/api/search/route.ts
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from '@/lib/middleware/rateLimit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const identifier = getClientIdentifier(req);
  const { limited, remaining } = await checkRateLimit(
    identifier,
    '/api/search',
    rateLimitConfigs.search
  );

  if (limited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60'
        }
      }
    );
  }

  // Process request
  return NextResponse.json({ 
    data: 'search results',
    headers: {
      'X-RateLimit-Remaining': remaining.toString()
    }
  });
}
```

### Verifying Restaurant Ownership

```typescript
// In your API route
import { createServerClient } from '@/lib/supabase/server';

const supabase = createServerClient();

// Check if user can modify restaurant
const { data: canModify } = await supabase
  .rpc('verify_restaurant_ownership', {
    restaurant_uuid: restaurantId,
    user_uuid: userId
  });

if (!canModify) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

## Required Actions

### 1. Run Database Migration
```bash
# The migration file is automatically created in supabase/migrations/
# It will be applied on next Supabase deployment or local dev start
```

### 2. Verify Existing Restaurant Owners
All existing restaurant owners need to be verified by an admin:

```sql
-- Run this in Supabase SQL Editor to verify all existing owners
UPDATE restaurant_ownership
SET verified = true
WHERE owner_id IN (
  SELECT id FROM user_profiles WHERE role = 'owner'
);
```

### 3. Update Client Code
Ensure all API calls include the authentication token:

```typescript
// Example in your client code
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${session?.access_token}`
  }
});
```

### 4. Test Authentication
1. Try to modify a restaurant without being the owner - should fail
2. Try to delete a restaurant as a regular user - should fail
3. Try to view another user's full profile - should fail
4. Make multiple rapid requests - should be rate limited

## Breaking Changes

⚠️ **Important:** These changes will break existing functionality that relied on the old permissive policies.

1. **Restaurant Owners** without verified status cannot modify restaurants
   - Solution: Admin must verify ownership in the database

2. **Regular Users** can no longer create new restaurants
   - Solution: Only admins can create restaurants; owners claim existing ones

3. **Analytics Updates** from client-side code will fail
   - Solution: Analytics must be updated via admin dashboard or service_role key

4. **API Routes** without authentication headers will fail
   - Solution: All API calls must include Bearer token

## Monitoring

### View Audit Logs (Admin Only)
```sql
SELECT 
  al.*,
  up.email as user_email
FROM audit_logs al
LEFT JOIN user_profiles up ON up.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 100;
```

### Check Rate Limiting
```sql
SELECT 
  identifier,
  endpoint,
  request_count,
  window_start
FROM rate_limits
WHERE window_start > NOW() - INTERVAL '1 hour'
ORDER BY request_count DESC;
```

### View Failed Ownership Attempts
```sql
SELECT *
FROM audit_logs
WHERE action IN ('UPDATE', 'DELETE')
AND table_name = 'restaurants'
ORDER BY created_at DESC;
```

## Next Steps

1. **Phase 2:** Implement input validation and sanitization
2. **Phase 3:** Add file upload security
3. **Phase 4:** Implement comprehensive XSS prevention
4. **Phase 5:** Add payment security
5. **Phase 6:** Deploy monitoring and alerting

## Support

For questions or issues with these security implementations:
1. Check the audit_logs table for details on failed operations
2. Review the RLS policies in Supabase Dashboard
3. Test with different user roles to ensure policies work correctly

## Security Checklist

- [x] Restaurant deletion requires ownership verification
- [x] Restaurant updates require ownership verification
- [x] Analytics protected from unauthorized access
- [x] User PII exposure minimized
- [x] API authentication middleware created
- [x] Rate limiting implemented
- [x] Audit logging for all sensitive operations
- [x] Ownership verification cannot be self-granted
- [ ] All API routes protected with auth middleware (TODO)
- [ ] Client code updated to send auth tokens (TODO)
- [ ] All existing owners verified in database (TODO)
- [ ] Rate limiting applied to all public endpoints (TODO)

