# Critical Security Fixes - Deployment Checklist

## ✅ Completed

- [x] Created database migration with RLS policy fixes
- [x] Created authentication middleware
- [x] Created rate limiting middleware
- [x] Created server-side Supabase client
- [x] Created comprehensive documentation
- [x] Added audit logging system
- [x] Added ownership verification functions
- [x] Added security triggers to prevent auto-verification

## 🔴 CRITICAL - Before Deployment

### 1. Review the Migration File
```bash
# File location:
supabase/migrations/20251028225145_critical_rls_security_fixes.sql

# Review what it does:
# - Restricts restaurant deletion/updates to owners only
# - Protects analytics from manipulation
# - Limits user profile visibility
# - Creates audit_logs table
# - Creates rate_limits table
```

### 2. Backup Your Database
```bash
# In Supabase Dashboard:
# Settings > Database > Create backup
```

### 3. Test in Development First
```bash
# Start your local Supabase instance
supabase start

# The migration will run automatically
# Test all functionality before deploying to production
```

## 🟠 REQUIRED - After Deployment

### 1. Verify Existing Restaurant Owners
**Run this in Supabase SQL Editor:**
```sql
-- Check how many owners exist
SELECT COUNT(*) FROM restaurant_ownership WHERE verified = false;

-- Verify legitimate owners
UPDATE restaurant_ownership
SET verified = true
WHERE owner_id IN (
  SELECT id FROM user_profiles WHERE role = 'owner'
);

-- Confirm all were verified
SELECT COUNT(*) FROM restaurant_ownership WHERE verified = true;
```

### 2. Update Your Client Code
All API calls that modify data now need auth tokens:

```typescript
// Before (INSECURE - will break):
const response = await fetch('/api/restaurants', {
  method: 'PUT',
  body: JSON.stringify(data)
});

// After (SECURE):
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch('/api/restaurants', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### 3. Apply Auth Middleware to API Routes (Gradual)
Start with the most sensitive endpoints:

**Priority 1 - Restaurant Management:**
- `/api/restaurants` (POST, PUT, DELETE)
- `/api/restaurants/[id]/update`

**Priority 2 - Owner Dashboard:**
- `/api/owner/*`
- `/api/analytics/*`
- `/api/coupons/*`

**Priority 3 - Admin Functions:**
- `/api/admin/*`
- `/api/users/*`

Example:
```typescript
// app/api/restaurants/route.ts
import { withAuth } from '@/lib/middleware/auth';

// Protect restaurant creation
export const POST = withAuth(async (req) => {
  // Only admins can create restaurants
  // Implementation here
}, { requireAdmin: true });
```

### 4. Implement Rate Limiting (Gradual)
Start with public endpoints that are most likely to be abused:

**Priority 1:**
- `/api/restaurants` (GET) - search endpoint
- `/api/auth/*` - authentication endpoints

**Priority 2:**
- All other public GET endpoints

Example:
```typescript
// app/api/restaurants/route.ts
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from '@/lib/middleware/rateLimit';

export async function GET(req: NextRequest) {
  // Check rate limit
  const identifier = getClientIdentifier(req);
  const { limited, remaining } = await checkRateLimit(
    identifier,
    '/api/restaurants',
    rateLimitConfigs.search
  );

  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Process request normally
  // ...
}
```

## 🟢 Monitoring - After Deployment

### 1. Set Up Daily Monitoring
Check these queries daily for the first week:

```sql
-- Failed authentication attempts
SELECT 
  COUNT(*) as failed_attempts,
  user_id,
  action
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND action IN ('DELETE', 'UPDATE')
GROUP BY user_id, action
ORDER BY failed_attempts DESC;

-- Rate limit violations
SELECT 
  identifier,
  endpoint,
  COUNT(*) as violations
FROM rate_limits
WHERE window_start > NOW() - INTERVAL '24 hours'
  AND request_count >= 30
GROUP BY identifier, endpoint
ORDER BY violations DESC;

-- Unverified ownership attempts
SELECT *
FROM restaurant_ownership
WHERE verified = false
  AND created_at > NOW() - INTERVAL '24 hours';
```

### 2. Create Alerts (Optional but Recommended)
Set up alerts in Supabase for:
- More than 10 failed deletion attempts in 1 hour
- More than 100 rate limit violations per IP in 1 hour
- Any new unverified ownership claims

## 🔧 Rollback Plan

If something goes wrong:

### 1. Immediate Rollback
```sql
-- Temporarily restore old permissive policies
DROP POLICY IF EXISTS "Only admins and verified owners can delete restaurants" ON restaurants;
DROP POLICY IF EXISTS "Only admins and verified owners can update restaurants" ON restaurants;

CREATE POLICY "Authenticated users can delete restaurants temp"
  ON restaurants FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can update restaurants temp"
  ON restaurants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
```

### 2. Investigate
- Check audit_logs for what failed
- Review error logs in your application
- Test with different user roles

### 3. Fix and Redeploy
- Address the issues
- Re-apply the security policies
- Monitor closely

## 📊 Success Metrics

After 1 week, you should see:
- ✅ Zero unauthorized restaurant modifications
- ✅ All sensitive operations logged in audit_logs
- ✅ Rate limiting preventing API abuse
- ✅ User privacy protected
- ✅ All owners verified and functioning normally

## 🆘 Troubleshooting

### Issue: Owners can't modify their restaurants
**Solution:** Verify their ownership in the database
```sql
UPDATE restaurant_ownership
SET verified = true
WHERE owner_id = '[user_id]'
  AND restaurant_id = '[restaurant_id]';
```

### Issue: API calls failing with 401
**Solution:** Ensure auth token is being sent
```typescript
// Check that token exists
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
```

### Issue: Rate limiting too aggressive
**Solution:** Adjust limits in `lib/middleware/rateLimit.ts`
```typescript
export const rateLimitConfigs = {
  search: {
    maxRequests: 50, // Increased from 30
    windowMs: 60 * 1000,
  },
};
```

## 📞 Support

If you encounter issues:
1. Check `SECURITY_IMPLEMENTATION.md` for detailed documentation
2. Review audit_logs for security events
3. Test with admin account to verify policies work
4. Check RLS policies in Supabase Dashboard

## Timeline

**Recommended Deployment Schedule:**

**Day 1:**
- Deploy migration to staging
- Test all functionality
- Verify existing owners

**Day 2-3:**
- Update client code to send auth tokens
- Test end-to-end

**Day 4:**
- Deploy to production
- Monitor closely for 24 hours

**Week 1:**
- Gradually apply auth middleware to API routes
- Gradually implement rate limiting
- Daily monitoring

**Week 2+:**
- Full security in place
- Automated monitoring
- Move to Phase 2 security improvements

