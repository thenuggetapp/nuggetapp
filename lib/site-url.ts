/**
 * Public origin for metadataBase, sitemap, and server-only structured data.
 * Same preference order as `restaurant-image.ts` (absolute image helpers):
 * NEXT_PUBLIC_SITE_URL, then localhost (PORT if set).
 */
export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (siteUrl && siteUrl !== "undefined") {
    return siteUrl;
  }
  const port = process.env.PORT?.trim();
  if (port && port !== "undefined") {
    return `http://localhost:${port}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
