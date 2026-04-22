/**
 * Public origin for metadataBase, sitemap, and server-only structured data.
 *
 * On Vercel, the SITE_URL is set to a project URL, even for the production site, which 
 * is not accessible to most users, although it is a real working address for those with 
 * access to the Vercel project. Here, check 
 * for production, and use the production URL if available. Otherwise, use the site URL
 * which is necessary to compute the correct URL in non-production environments.
 */
export function getSiteUrl(): string {
  if(process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    return process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "");
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
