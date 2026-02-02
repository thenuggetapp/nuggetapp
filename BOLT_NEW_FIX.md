# ⚡ QUICK FIX for Bolt.new CORS Error

## The Error You're Seeing

```
Access to fetch at 'https://bothvdppmqybygdfoqag.supabase.co/auth/v1/token' 
has been blocked by CORS policy
```

## ✅ 2-Minute Fix

### Step 1: Open Supabase Dashboard (30 seconds)

1. Go to: https://app.supabase.com
2. Click on your project: `bothvdppmqybygdfoqag`
3. Click **Settings** (⚙️ icon in sidebar)
4. Click **API**

### Step 2: Add WebContainer Domain (30 seconds)

Scroll down to find **"Additional Allowed Origins"** or **"CORS Configuration"**

Add this domain pattern:
```
https://*.webcontainer-api.io
```

**Also add** (for full compatibility):
```
https://*.webcontainer.io
https://*.bolt.new
```

### Step 3: Save & Restart (60 seconds)

1. Click **"Save"** button in Supabase
2. Go back to your Bolt.new tab
3. Restart the preview (close and reopen, or refresh)
4. Try login again - **it should work!**

## What This Does

- ✅ Tells Supabase to accept requests from Bolt.new/WebContainer domains
- ✅ Fixes the CORS policy error
- ✅ Allows authentication to work in iframe preview
- ✅ Enables all Supabase API calls (auth, database, storage)

## Screenshot Guide

If you're not sure where to find it in Supabase:

```
Supabase Dashboard
└── [Your Project]
    └── Settings (gear icon)
        └── API
            └── Scroll down to:
                ├── "URL Configuration"
                └── "Additional Allowed Origins" ← ADD DOMAINS HERE
```

## What If It Still Doesn't Work?

### Option A: Add the Specific Domain

If wildcards don't work, add the exact domain from your error:
```
https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--3000--cf284e50.local-credentialless.webcontainer-api.io
```

⚠️ **Note**: This domain changes each time you restart Bolt.new

### Option B: Test Locally Instead

```bash
# In your terminal (not Bolt.new)
cd nuggetrecovery
npm install
npm run dev
```

Then open: http://localhost:3000

Add to Supabase allowed origins:
```
http://localhost:3000
```

### Option C: Deploy to Production

Deploy to Vercel/Netlify and test there:
```
https://your-app.vercel.app
```

Add your production URL to Supabase allowed origins.

## Verification

After adding domains and restarting:

✅ **Console logs should show**:
```
[Storage] ✅ localStorage is available
[Supabase Client] 🔍 Environment detection: {isInIframe: true, ...}
[AuthContext] 🚀 INITIALIZING AUTHENTICATION
```

❌ **Should NOT see**:
```
Access to fetch ... has been blocked by CORS policy
```

## Why This Error Happened

1. Your app runs in a Bolt.new iframe
2. Bolt.new uses domain: `*.webcontainer-api.io`
3. Supabase by default only allows your main domain
4. Bolt.new domain wasn't in the allowed list
5. Browser blocked the request (CORS policy)

**Fix**: Add Bolt.new domains to Supabase's allowed list ✅

## Code Changes Already Applied

The following code changes were already made to your project:

✅ Fixed `credentials` mode to `'same-origin'` in iframe  
✅ Updated CSP headers to allow WebContainer domains  
✅ Configured localStorage fallback for iframe environments  

**You just need to configure Supabase!**

## Still Having Issues?

1. **Check console**: Look for different error messages
2. **Visit diagnostic page**: `/diagnostic/iframe-test`
3. **Verify project**: Make sure you're updating the correct Supabase project
4. **Wait a moment**: Sometimes changes take 10-30 seconds to propagate
5. **Clear cache**: Try incognito/private window

## Summary

**Do this NOW**:
1. ⚙️ Supabase Dashboard → Settings → API
2. ➕ Add: `https://*.webcontainer-api.io` to allowed origins
3. 💾 Save
4. 🔄 Restart Bolt.new preview
5. ✅ Login should work!

**Time**: 2 minutes  
**Difficulty**: Easy  
**Cost**: Free

---

Need more help? See `SUPABASE_CORS_FIX.md` for detailed instructions with screenshots and alternatives.

