import { getSiteUrl } from "./site-url";

/** Server-only: uses deployment URL from env (never import from client components). */
export function generateWebsiteStructuredData() {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Nugget",
    url: baseUrl,
    description:
      "Discover family-friendly restaurants with interactive maps, detailed reviews, and filters.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
