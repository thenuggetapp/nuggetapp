/**
 * Public origin for metadataBase, sitemap, and server-only structured data.
 * Note that SITE_URL is set in the Netlify environment variables and is usable
 * only for server-side code.
 * SITE_URL, then localhost (PORT if set).
 */
export function getSiteUrl(): string {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  if (siteUrl && siteUrl !== "undefined") {
    return siteUrl;
  }
  const port = process.env.PORT?.trim();
  if (port && port !== "undefined") {
    return `http://localhost:${port}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
