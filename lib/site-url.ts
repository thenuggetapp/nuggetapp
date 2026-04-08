/**
 * Public origin for metadataBase, sitemap, and server-only structured data.
 * Uses Vercel's deployment URL when present; otherwise localhost (and PORT if set).
 */
export function getSiteUrl(): string {
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel && vercel !== "undefined") {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${host}`.replace(/\/$/, "");
  }
  const port = process.env.PORT?.trim();
  if (port && port !== "undefined") {
    return `http://localhost:${port}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
