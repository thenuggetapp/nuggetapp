# Iframe Environment Support

This document explains the iframe support implementation in the application, enabling it to run in preview environments like Bolt.new, StackBlitz, CodeSandbox, and other iframe-based environments where third-party cookies and storage may be restricted.

## Overview

Modern browsers block third-party cookies in iframes by default for privacy and security reasons. This presents challenges for applications that rely on cookie-based authentication (like Supabase). This implementation provides a comprehensive solution that:

1. **Detects iframe environments** automatically
2. **Falls back to localStorage-based authentication** when cookies are blocked
3. **Provides in-memory storage fallback** when localStorage is also blocked
4. **Maintains full functionality** even in restricted environments

## Key Changes

### 1. Storage Utilities (`lib/storage-utils.ts`)

**Purpose**: Provides safe storage access with automatic fallback mechanisms.

**Features**:
- Detects iframe environment
- Tests localStorage/sessionStorage availability
- Provides in-memory fallback storage when needed
- Safe wrappers: `safeLocalStorage` and `safeSessionStorage`

**Usage**:
```typescript
import { safeLocalStorage, checkIsInIframe } from '@/lib/storage-utils';

// Use instead of direct localStorage access
safeLocalStorage.setItem('key', 'value');
const value = safeLocalStorage.getItem('key');
```

**Key Functions**:
- `checkIsInIframe()`: Detects if running in iframe
- `checkLocalStorageAvailable()`: Tests localStorage availability
- `checkSessionStorageAvailable()`: Tests sessionStorage availability
- `safeLocalStorage`: Safe localStorage wrapper with fallback
- `safeSessionStorage`: Safe sessionStorage wrapper with fallback
- `getStorageEnvironmentInfo()`: Gets detailed environment info
- `logStorageEnvironment()`: Logs environment info for debugging

### 2. Supabase Client Updates (`lib/supabase/client.ts`)

**Changes**:
- Enhanced iframe detection
- Cookie availability testing
- Custom storage adapter using safe storage utilities
- Automatic fallback to localStorage in iframes
- Extended timeout for iframe environments (30s vs 15s)
- CORS credentials handling

**Detection Strategy**:
```typescript
// Detects iframe automatically
const isInIframe = checkIsInIframe();

// Tests cookie availability
const hasThirdPartyCookieRestriction = /* cookie test */;

// Uses localStorage if needed
const shouldUseLocalStorage = isInIframe || hasThirdPartyCookieRestriction || !navigator.cookieEnabled;
```

### 3. AuthContext Updates (`contexts/AuthContext.tsx`)

**Changes**:
- All `localStorage` calls replaced with `safeLocalStorage`
- Storage environment logging on initialization
- Graceful handling of storage errors
- Profile caching with safe storage
- Session cleanup with safe storage

**Key Improvements**:
- Profile caching works even when localStorage is blocked (uses memory)
- Auth state persists in memory when storage is unavailable
- Better error handling and logging for storage issues

### 4. Middleware Enhancements (`middleware.ts`)

**Changes**:
- Enhanced iframe detection using multiple headers
- Skips server-side auth checks in iframe mode
- Adds `X-Iframe-Mode` header for client-side detection
- Extended detection for preview environments

**Detected Environments**:
- Bolt.new
- StackBlitz
- WebContainer
- CodeSandbox
- Replit
- Generic iframe detection

### 5. Next.js Configuration (`next.config.js`)

**Changes**:
- Content-Security-Policy headers for iframe embedding
- Allows embedding from preview environments
- CORS headers for cross-origin requests
- Removed X-Frame-Options (conflicts with CSP)

**CSP Policy**:
```
frame-ancestors 'self' https://*.bolt.new https://*.stackblitz.com https://*.stackblitz.io https://*.webcontainer.io https://preview.*.webcontainer.io *
```

### 6. Diagnostic Page (`app/diagnostic/iframe-test/page.tsx`)

**Purpose**: Debug and diagnose iframe environment issues.

**Features**:
- Real-time environment detection
- Storage availability tests
- Cookie access tests
- Supabase connection status
- Auth context status
- Recommendations based on detected issues
- Copy diagnostic data to clipboard

**Access**: Navigate to `/diagnostic/iframe-test` to view diagnostics.

## How It Works

### Normal Environment (Non-Iframe)

```
1. User visits site
2. Middleware: Normal auth checks
3. Supabase Client: Uses cookies via SSR client
4. AuthContext: Caches in localStorage
5. Authentication: Cookie-based (standard)
```

### Iframe Environment (e.g., Bolt.new)

```
1. User visits site in iframe
2. Middleware: Detects iframe → skips server auth checks
3. Supabase Client: 
   - Detects iframe/blocked cookies
   - Uses localStorage-based client
   - Falls back to memory if localStorage blocked
4. AuthContext: 
   - Uses safeLocalStorage (with memory fallback)
   - Handles storage errors gracefully
5. Authentication: 
   - Client-side only
   - localStorage or memory-based
   - RLS still enforced by Supabase
```

## Testing

### Test Scenarios

1. **Normal Browser**
   - Should use cookies
   - Full localStorage access
   - Standard authentication flow

2. **Iframe with Cookies Enabled**
   - Should detect iframe
   - Fall back to localStorage
   - Authentication works

3. **Iframe with All Storage Blocked**
   - Should detect restrictions
   - Use in-memory storage
   - Authentication works but session lost on reload

4. **Private Browsing**
   - localStorage may be limited
   - Should fall back gracefully
   - Session persistence limited

### Testing Checklist

- [ ] Login works in normal browser
- [ ] Login works in iframe environment
- [ ] Profile loads correctly
- [ ] Session persists (when storage available)
- [ ] Session works in-memory (when storage blocked)
- [ ] Logout clears all data
- [ ] No console errors in any environment
- [ ] Diagnostic page shows correct status

### Manual Testing

1. **Test in Normal Environment**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Test login/logout
   ```

2. **Test in Iframe**:
   - Deploy to preview environment (Vercel, Netlify, etc.)
   - Open in Bolt.new or StackBlitz
   - Test login/logout
   - Check diagnostic page

3. **Test Storage Restrictions**:
   - Open DevTools
   - Go to Application → Storage
   - Right-click localStorage → "Clear"
   - Try to block in browser settings
   - Test authentication

## Troubleshooting

### Issue: Login not working in iframe

**Diagnosis**:
1. Visit `/diagnostic/iframe-test`
2. Check storage availability
3. Check Supabase connection

**Solutions**:
- Ensure iframe is detected (should show "Running in Iframe: true")
- Check if localStorage is available
- If both blocked, app will use memory (session won't persist)

### Issue: Session not persisting

**Cause**: Storage is blocked or unavailable

**Solutions**:
1. Check diagnostic page for storage status
2. If localStorage blocked:
   - Session will only persist in memory
   - User must stay on same page/tab
3. Consider implementing:
   - Session token in URL (if acceptable for use case)
   - Prompt user to enable storage

### Issue: "Auth session missing" errors

**Cause**: Cookie-based auth failing in iframe

**Verification**:
1. Check if `shouldUseLocalStorage` is true in console
2. Check if Supabase client is using correct mode

**Solution**: Already handled by automatic detection, but verify:
- Middleware correctly detects iframe
- Supabase client switches to localStorage mode

### Issue: CORS errors

**Cause**: Cross-origin requests blocked

**Solution**:
- Verify CORS headers in `next.config.js`
- Check if Supabase project allows your domain
- Ensure credentials are included in fetch requests

## Security Considerations

### Authentication Security

1. **RLS Policies**: Security is enforced at database level via Row Level Security
2. **Token-based**: Even in iframe, JWT tokens are validated by Supabase
3. **HTTPS Only**: Production should always use HTTPS
4. **Session Expiry**: Sessions expire normally based on Supabase config

### Storage Security

1. **In-Memory Storage**: 
   - Most secure (cleared on reload)
   - No persistence risk
   - Limited by browser memory

2. **localStorage**:
   - Accessible to scripts on same origin
   - Persists until cleared
   - Can be inspected in DevTools

3. **Cookies**:
   - Can be httpOnly (more secure)
   - SameSite protections
   - Automatic expiry

### Production Recommendations

1. **Restrict CSP**: In production, limit frame-ancestors to specific domains:
   ```javascript
   frame-ancestors 'self' https://trusted-domain.com
   ```

2. **Monitor Usage**: Log iframe mode usage to detect abuse

3. **Rate Limiting**: Implement rate limiting on auth endpoints

4. **Token Rotation**: Enable automatic token rotation in Supabase

## Performance Implications

### Memory Storage
- **Pros**: No disk I/O, very fast
- **Cons**: Lost on page reload, limited by RAM

### localStorage Storage
- **Pros**: Persists, reasonable speed
- **Cons**: ~5-10MB limit, slower than memory

### Cookie Storage
- **Pros**: Automatic, secure, SSR-compatible
- **Cons**: Size limit (4KB), sent with every request

## Browser Compatibility

| Browser | Iframe Support | localStorage | Cookies |
|---------|---------------|--------------|---------|
| Chrome 90+ | ✅ Full | ✅ | ⚠️ Blocked in 3rd-party iframe |
| Firefox 85+ | ✅ Full | ✅ | ⚠️ Blocked in 3rd-party iframe |
| Safari 14+ | ✅ Full | ✅ | ⚠️ Blocked in 3rd-party iframe |
| Edge 90+ | ✅ Full | ✅ | ⚠️ Blocked in 3rd-party iframe |

## Future Improvements

### Potential Enhancements

1. **IndexedDB Support**: 
   - Larger storage capacity
   - Better for offline support
   - More complex API

2. **Broadcast Channel**:
   - Sync auth state across tabs
   - Better for multi-tab usage
   - Limited browser support

3. **Service Worker**:
   - Offline authentication
   - Background sync
   - PWA support

4. **Storage Quota Management**:
   - Monitor storage usage
   - Automatic cleanup of old data
   - User notifications

## Migration Guide

### Updating Existing Code

If you have custom code using localStorage:

**Before**:
```typescript
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
```

**After**:
```typescript
import { safeLocalStorage } from '@/lib/storage-utils';

safeLocalStorage.setItem('key', 'value');
const value = safeLocalStorage.getItem('key');
```

### Breaking Changes

None! This is a backwards-compatible enhancement. Existing functionality works as before, with added iframe support.

## Support

For issues or questions:
1. Check the diagnostic page first: `/diagnostic/iframe-test`
2. Review console logs for detailed debugging info
3. Check this documentation for common issues
4. Consult browser DevTools for storage/network info

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Third-Party Cookies Explained](https://developer.mozilla.org/en-US/docs/Web/Privacy/Third-party_cookies)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

