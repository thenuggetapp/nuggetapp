/**
 * Public origin for metadataBase, sitemap, and server-only structured data.
 *
 * Preference order:
 * 1) NEXT_PUBLIC_SITE_URL
 * 2) Request headers (x-forwarded-host/host + x-forwarded-proto)
 * 3) localhost (PORT if set)
 */
import { headers } from "next/headers";

export function getSiteUrl(): string {


  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (siteUrl && siteUrl !== "undefined") {
    return siteUrl;
  }
  try {
    const requestHeaders = headers();
    const forwardedHost = requestHeaders
      .get("x-forwarded-host")
      ?.split(",")[0]
      ?.trim();
    const host = forwardedHost || requestHeaders.get("host")?.trim();

    if (host) {
      const forwardedProto = requestHeaders
        .get("x-forwarded-proto")
        ?.split(",")[0]
        ?.trim();
      const protocol = forwardedProto || (host.includes("localhost") ? "http" : "https");
      return `${protocol}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // No request context (e.g. static build) - fall through to env/local defaults.
  }
  const port = process.env.PORT?.trim();
  if (port && port !== "undefined") {
    return `http://localhost:${port}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
