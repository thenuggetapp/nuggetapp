/**
 * Public origin for metadataBase, sitemap, and server-only structured data.
 *
 * Preference order:
 * 1) SITE_URL
 * 2) NEXT_PUBLIC_SITE_URL
 * 3) localhost (PORT if set)
 */
export function getSiteUrl(): string {
  const serverSiteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  if (serverSiteUrl && serverSiteUrl !== "undefined") {
    return serverSiteUrl;
  }

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
