/**
 * True when a Place Details `photos[]` entry carries author/attribution metadata that
 * should exclude it from our galleries.
 *
 * - `authorAttributions` / `author_attributions`: newer Places JSON.
 * - `html_attributions`: legacy Place Details (`place/details/json`) photo credits.
 */
export function photoHasNonEmptyAuthorAttributions(photo: unknown): boolean {
  if (!photo || typeof photo !== 'object') return false;
  const p = photo as Record<string, unknown>;
  const buckets = [
    p.authorAttributions,
    p.author_attributions,
    p.html_attributions,
  ];
  return buckets.some((a) => Array.isArray(a) && a.length > 0);
}
