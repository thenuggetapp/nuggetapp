import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Detect if request is coming from an iframe environment (like Bolt.new preview)
  // In iframes, third-party cookies are blocked, so auth is localStorage-based client-side only
  const referer = request.headers.get("referer") || "";
  const origin = request.headers.get("origin") || "";
  const secFetchDest = request.headers.get("sec-fetch-dest") || "";
  const secFetchSite = request.headers.get("sec-fetch-site") || "";
  const secFetchMode = request.headers.get("sec-fetch-mode") || "";
  
  // Enhanced iframe detection
  const isLikelyIframe =
    referer.includes("bolt.new") ||
    referer.includes("stackblitz") ||
    referer.includes("webcontainer") ||
    referer.includes("codesandbox") ||
    referer.includes("replit") ||
    secFetchDest === "iframe" ||
    (secFetchSite === "cross-site" && secFetchMode === "navigate");

  if (isLikelyIframe) {
    console.log(
      "[Middleware] 🖼️ Iframe environment detected - skipping server-side auth checks"
    );
    console.log("[Middleware] 📝 Auth will be handled client-side with localStorage");
    console.log("[Middleware] 🔍 Detection details:", {
      referer: referer.substring(0, 50),
      origin: origin.substring(0, 50),
      secFetchDest,
      secFetchSite,
      secFetchMode,
    });

    // In iframe environments, skip server-side auth checks entirely
    // Authentication is handled client-side with localStorage
    // Security is still enforced via RLS policies in Supabase
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    // Mark response as being from iframe mode for client-side detection
    response.headers.set("X-Iframe-Mode", "true");
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Ensure proper cookie options for production
          const cookieOptions: CookieOptions = {
            ...options,
            // Set secure flag for HTTPS in production
            secure: process.env.NODE_ENV === "production",
            // Set SameSite to Lax for better compatibility
            sameSite:
              (options.sameSite as "lax" | "strict" | "none" | undefined) ||
              "lax",
            // Ensure path is set
            path: options.path || "/",
          };
          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === "production",
            sameSite:
              (options.sameSite as "lax" | "strict" | "none" | undefined) ||
              "lax",
            path: options.path || "/",
          };
          request.cookies.set({
            name,
            value: "",
            ...cookieOptions,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...cookieOptions,
          });
        },
      },
    }
  );

  // Check authentication for protected routes
  const path = request.nextUrl.pathname;

  // Protected admin and owner paths require authentication
  // BUT: Skip server-side auth checks if in iframe mode (handled client-side)
  if ((path.startsWith("/admin") || path.startsWith("/owner")) && !isLikelyIframe) {
    try {
      console.log("[Middleware] 🔒 Checking auth for protected route:", path);
      // CRITICAL FIX: Use getSession() instead of getUser() - much faster, no API call
      // getUser() makes a network request to validate the token
      // getSession() reads from the cookie which is instant
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[Middleware] ❌ Session error:", sessionError);
      }

      // If no session, redirect to login with redirect parameter
      if (!session?.user) {
        console.log("[Middleware] ⛔ No session found, redirecting to login");
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(redirectUrl);
      }

      console.log("[Middleware] ✅ User authenticated:", session.user.email);
      // User is authenticated, proceed
      // Role checks are handled client-side and DB-enforced via RLS
    } catch (error) {
      console.error(
        "[Middleware] ❌ Error checking auth for protected route:",
        error
      );
      // On error, redirect to login to be safe
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(redirectUrl);
    }
  } else if (isLikelyIframe) {
    // In iframe mode, skip ALL server-side auth checks
    // Auth is handled purely client-side via AuthContext
    console.log("[Middleware] 🖼️ Iframe mode - allowing access, auth handled client-side");
  } else {
    // For non-protected routes, just refresh session
    try {
      await supabase.auth.getSession();
    } catch (error) {
      // Log error but don't break the request
      console.error("[Middleware] Error getting session:", error);
    }
  }

  // Add security headers
  // IMPORTANT: Allow iframe embedding for preview environments (like StackBlitz)
  // In production, you might want to restrict this to specific domains
  // using Content-Security-Policy frame-ancestors directive instead
  // response.headers.set('X-Frame-Options', 'DENY'); // DISABLED for iframe support

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  
  // Indicate that this is NOT iframe mode (normal request)
  response.headers.set("X-Iframe-Mode", "false");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
