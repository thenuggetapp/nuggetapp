import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { checkIsInIframe, checkLocalStorageAvailable, safeLocalStorage } from "@/lib/storage-utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `
=== SUPABASE CONNECTION ERROR ===
Missing Supabase environment variables.

The hardcoded Supabase URL in your .env file does not exist or has been deleted.

To fix this issue:
1. Go to https://supabase.com and log in
2. Select your project (or create a new one)
3. Go to Project Settings > API
4. Copy your Project URL and anon/public key
5. Update the .env file with:
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
6. Restart your development server

Current values:
  URL: ${supabaseUrl || "(not set)"}
  Key: ${supabaseAnonKey ? "(set)" : "(not set)"}
=================================
  `;

  console.error(errorMessage);
  throw new Error(
    "Missing Supabase environment variables. Please update your .env file with valid credentials."
  );
}

// Detect if we're in an iframe (like StackBlitz, Bolt.new, or other preview environments)
// Also check for third-party cookie restrictions
let isInIframe = false;
let hasThirdPartyCookieRestriction = false;
let shouldUseLocalStorage = false;

if (typeof window !== "undefined") {
  isInIframe = checkIsInIframe();
  
  // Check if localStorage is available
  const localStorageAvailable = checkLocalStorageAvailable();

  // Test if we can access cookies (third-party cookies might be blocked)
  try {
    // Test both setting and reading a cookie
    const testCookieName = "cookietest_" + Date.now();
    document.cookie = `${testCookieName}=1; SameSite=None; Secure; path=/`;
    hasThirdPartyCookieRestriction = !document.cookie.includes(`${testCookieName}=1`);
    // Cleanup
    document.cookie = `${testCookieName}=1; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  } catch (e) {
    console.warn("[Supabase Client] Cookie test failed:", e);
    hasThirdPartyCookieRestriction = true;
  }
  
  // Use localStorage if in iframe OR if cookies are blocked OR if explicitly needed
  shouldUseLocalStorage = isInIframe || hasThirdPartyCookieRestriction || !navigator.cookieEnabled;

  console.log("[Supabase Client] 🔍 Environment detection:", {
    isInIframe,
    hasThirdPartyCookieRestriction,
    cookiesEnabled: navigator.cookieEnabled,
    localStorageAvailable,
    shouldUseLocalStorage,
    storageStrategy: shouldUseLocalStorage
      ? "localStorage with safe fallback"
      : "cookies (SSR-compatible)",
    origin: window.location.origin,
    parentOrigin: isInIframe ? "different (running in iframe)" : "same",
    userAgent: navigator.userAgent.substring(0, 50) + "...",
  });
  
  if (shouldUseLocalStorage) {
    console.log("[Supabase Client] ⚠️ Using localStorage-based auth (iframe or cookie restrictions detected)");
  }
  
  if (isInIframe) {
    console.log("[Supabase Client] 🖼️ Running in iframe - third-party cookies may be blocked");
  }
}

/**
 * Custom storage adapter that uses our safe storage utilities
 * This provides graceful fallback to in-memory storage when localStorage is blocked
 */
const customStorageAdapter = typeof window !== "undefined" ? {
  getItem: (key: string) => {
    try {
      return safeLocalStorage.getItem(key);
    } catch (e) {
      console.error("[Supabase Storage] Error getting item:", e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      safeLocalStorage.setItem(key, value);
    } catch (e) {
      console.error("[Supabase Storage] Error setting item:", e);
    }
  },
  removeItem: (key: string) => {
    try {
      safeLocalStorage.removeItem(key);
    } catch (e) {
      console.error("[Supabase Storage] Error removing item:", e);
    }
  },
} : undefined;

// In iframe environments or when third-party cookies are blocked,
// we must use the standard Supabase client with localStorage
// In normal environments, use SSR-compatible client with cookies
export const supabase =
  shouldUseLocalStorage
    ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: customStorageAdapter,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: "pkce",
          storageKey: "sb-auth-token",
          // Increase debug logging in iframe environments
          debug: isInIframe,
        },
        global: {
          headers: {
            "x-client-info": "supabase-js-web-iframe",
            "x-iframe-mode": isInIframe ? "true" : "false",
          },
          fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
            // Longer timeout for iframe environments (network can be slower)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

            // IMPORTANT: Do NOT use credentials: 'include' in iframe mode
            // This causes CORS errors because Supabase returns Access-Control-Allow-Origin: *
            // which is incompatible with credentials mode
            // Since we're using localStorage for auth in iframe mode, we don't need cookies anyway
            return fetch(url, {
              ...options,
              signal: controller.signal,
              // Explicitly use 'same-origin' to avoid CORS issues with wildcard origins
              credentials: 'same-origin',
            }).finally(() => clearTimeout(timeoutId));
          },
        },
      })
    : createBrowserClient(supabaseUrl, supabaseAnonKey, {
        db: {
          schema: "public",
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
        global: {
          headers: {
            "x-client-info": "supabase-js-web",
          },
          fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));
          },
        },
      });
