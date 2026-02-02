# Supabase CORS Configuration for Iframe Environments

## Problem

When running in iframe environments like Bolt.new, you may see this CORS error:

```
Access to fetch at 'https://your-project.supabase.co/auth/v1/token' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*'
when the request's credentials mode is 'include'.
```

## Root Cause

The error occurs because:
1. Supabase returns `Access-Control-Allow-Origin: *` (wildcard)
2. Browsers block wildcard CORS when `credentials: 'include'` is used
3. The specific Bolt.new/WebContainer domain needs to be explicitly allowed

## Solution

You need to add the Bolt.new WebContainer domains to your Supabase project's allowed origins.

### Step 1: Go to Supabase Dashboard

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll down to **URL Configuration** section

### Step 2: Add WebContainer Domains

Find the **Additional Allowed Origins** field and add these patterns:

```
https://*.webcontainer-api.io
https://*.webcontainer.io
https://*.bolt.new
https://*.stackblitz.com
https://*.stackblitz.io
```

**Important**: Enter each domain on a new line, or if there's a comma-separated field, separate them with commas.

### Step 3: Save Changes

Click **Save** to apply the changes. Changes take effect immediately.

## Alternative Solution (If Above Doesn't Work)

If your Supabase plan doesn't support wildcards in allowed origins, you have two options:

### Option 1: Add Specific Domain

Add the specific domain from your error message. For example:
```
https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--3000--cf284e50.local-credentialless.webcontainer-api.io
```

**Downside**: This domain changes each time you restart Bolt.new, so you'd need to update it frequently.

### Option 2: Use Supabase Service Role (Backend Only)

For backend operations, use the service role key instead of the anon key. This bypasses CORS but should ONLY be used server-side.

**Do NOT expose service role key in client code!**

### Option 3: Deploy to Production

Deploy your app to a production domain (Vercel, Netlify, etc.) and test there instead of in Bolt.new preview.

Then add your production domain to Supabase allowed origins:
```
https://your-app.vercel.app
https://your-app.netlify.app
```

## Verifying the Fix

After configuring Supabase:

1. **Restart your dev server** in Bolt.new (or close/reopen the preview)
2. **Clear browser cache** (or open in incognito/private window)
3. **Try login again**
4. **Check browser console** - CORS errors should be gone

## Code Changes Already Applied

The following code changes were already made to fix the credentials issue:

✅ Changed `credentials: 'include'` to `credentials: 'same-origin'` in iframe mode  
✅ Updated CSP headers to allow webcontainer domains  
✅ Configured Supabase client to use localStorage in iframe environments  

## Testing Checklist

After Supabase configuration:

- [ ] No CORS errors in browser console
- [ ] Login works in Bolt.new preview
- [ ] Can fetch data from Supabase (restaurants, etc.)
- [ ] Session persists in localStorage
- [ ] All API calls succeed

## Common Issues

### Issue: "Still getting CORS errors"

**Check**:
1. Did you add the domains to the correct Supabase project?
2. Did you save the changes in Supabase dashboard?
3. Did you restart your dev server?
4. Is the error showing a different domain now?

### Issue: "Domain keeps changing"

**Why**: Bolt.new generates a new subdomain each time you start a preview.

**Solutions**:
1. Deploy to stable hosting (Vercel, Netlify)
2. Use `https://*.webcontainer-api.io` wildcard (if supported by your Supabase plan)
3. Test locally instead: `npm run dev` at http://localhost:3000

### Issue: "My Supabase plan doesn't support wildcards"

**Solutions**:
1. Upgrade Supabase plan (Pro or higher typically supports wildcards)
2. Add specific domains as needed
3. Use production deployment for testing
4. Test locally at localhost:3000

## Production Recommendations

For production:

1. **Remove wildcard origins** for security
2. **Add only your production domains**:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
3. **Use specific domains** instead of wildcards
4. **Enable RLS policies** for database security

## Additional Resources

- [Supabase CORS Documentation](https://supabase.com/docs/guides/api#cors)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/server-side-rendering)

## Summary

**Quick Fix**:
1. Go to Supabase Dashboard → Settings → API
2. Add `https://*.webcontainer-api.io` to allowed origins
3. Save changes
4. Restart your preview
5. Test login - should work!

If problems persist after following this guide, check the browser console for the specific error and verify you're using the correct Supabase project.

