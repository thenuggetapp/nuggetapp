/**
 * scorer.ts
 *
 * Binary scorer
 * Route.ts handles all hard filtering (city, features, price).
 * This scorer ranks the candidates that survive those filters.
 *
 * Ranking order:
 *   1. Relevance score (slug/name, cuisine, description)
 *   2. Likes tiebreaker
 *   3. Proximity — small locality (<15 mi radius) only
 *   4. Feature keyword mentions tiebreaker
 *   5. Feature count tiebreaker
 *   6. Proximity — large city (≥15 mi radius), last resort
 */

import { ParsedQuery } from "@/lib/search/natural-language-parser";
import { FILTER_KEY_TO_DB_COLUMN } from "@/lib/db-amenities";
import { FEATURE_KEYWORDS } from "@/lib/search/synonym-map";
import { calculateDistance } from "@/lib/search/distance";

const SMALL_RADIUS_THRESHOLD = 25 * 1609.34; // 25 miles in metres
const PROXIMITY_MIN_DIFF = 200; // ignore differences under 200 m

const POINTS = {
  slugExact: 20, // full query phrase in slug
  nameExact: 18, // full query phrase in name
  cuisine: 5, // any query term in cuisine field
  description: 1, // any query term in description (binary, not frequency)
} as const;

// Helpers
function normalizeToSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getNgrams(terms: string[], n: number): string[] {
  if (terms.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= terms.length - n; i++) {
    ngrams.push(terms.slice(i, i + n).join(" "));
  }
  return ngrams;
}

// Tiebreaker
const FEATURE_COLUMNS = Object.values(FILTER_KEY_TO_DB_COLUMN);

function proximityDiff(
  a: any,
  b: any,
  cityCoords: [number, number],
): number {
  const [lng, lat] = cityCoords;
  const distA =
    a.latitude && a.longitude
      ? calculateDistance(lat, lng, a.latitude, a.longitude)
      : Infinity;
  const distB =
    b.latitude && b.longitude
      ? calculateDistance(lat, lng, b.latitude, b.longitude)
      : Infinity;
  return Math.abs(distA - distB) > PROXIMITY_MIN_DIFF ? distA - distB : 0;
}

function tiebreak(
  a: any,
  b: any,
  parsed?: ParsedQuery | null,
  cityCoords?: [number, number] | null,
  radiusMeters?: number,
): number {
  // 1. Likes
  const likesA = a.likes_count ?? 0;
  const likesB = b.likes_count ?? 0;
  if (likesB !== likesA) return likesB - likesA;

  const isSmallRadius =
    cityCoords != null &&
    radiusMeters != null &&
    radiusMeters < SMALL_RADIUS_THRESHOLD;

  // 2. Proximity — locality / small town (high priority)
  if (isSmallRadius) {
    const diff = proximityDiff(a, b, cityCoords);
    if (diff !== 0) return diff;
  }

  // 3. Description mentions any requested feature keywords (boolean)
  if (parsed?.features) {
    const featureTerms = Object.keys(parsed.features)
      .filter((f) => parsed.features[f as keyof typeof parsed.features])
      .flatMap((f) => FEATURE_KEYWORDS[f] ?? []);

    const descA = a.description?.toLowerCase() ?? "";
    const descB = b.description?.toLowerCase() ?? "";
    const mentionsA = featureTerms.some((term) => descA.includes(term)) ? 1 : 0;
    const mentionsB = featureTerms.some((term) => descB.includes(term)) ? 1 : 0;
    if (mentionsB !== mentionsA) return mentionsB - mentionsA;
  }

  // 4. Feature count
  const featuresA = FEATURE_COLUMNS.filter((col) => a[col] === true).length;
  const featuresB = FEATURE_COLUMNS.filter((col) => b[col] === true).length;
  if (featuresB !== featuresA) return featuresB - featuresA;

  // 5. Proximity — major city (low priority, last resort)
  if (cityCoords != null && !isSmallRadius) {
    return proximityDiff(a, b, cityCoords);
  }

  return 0;
}

// Scorers
function scoreSlugAndName(
  restaurant: any,
  terms: string[],
  parsed: ParsedQuery,
): number {
  if (terms.length === 0) return 0;

  const slug = restaurant.slug ?? "";
  const name = restaurant.name?.toLowerCase() ?? "";
  const isDiscoveryQuery =
    parsed.foodKeywords.length > 0 || parsed.cuisines.length > 0;

  if (isDiscoveryQuery) {
    const queryPhrase = terms.join(" ");
    if (slug.includes(normalizeToSlug(queryPhrase))) return POINTS.slugExact;
    if (name.includes(queryPhrase)) return POINTS.nameExact;
    return 0;
  }

  let score = 0;
  for (let n = terms.length; n >= 2; n--) {
    for (const ngram of getNgrams(terms, n)) {
      if (slug.includes(normalizeToSlug(ngram))) score += POINTS.slugExact;
      if (name.includes(ngram)) score += POINTS.nameExact;
    }
  }
  for (const term of terms) {
    if (slug.includes(normalizeToSlug(term))) score += POINTS.slugExact * 0.5;
    if (name.includes(term)) score += POINTS.nameExact * 0.5;
  }
  return score;
}

function scoreCuisine(restaurant: any, terms: string[]): number {
  if (terms.length === 0) return 0;
  const cuisine = restaurant.cuisine?.toLowerCase() ?? "";
  let score = 0;
  for (const term of terms) {
    if (cuisine.includes(term)) score += POINTS.cuisine;
  }
  return score;
}

function scoreDescription(restaurant: any, terms: string[]): number {
  if (terms.length === 0) return 0;
  const description = restaurant.description?.toLowerCase() ?? "";
  if (!description) return 0;
  let score = 0;
  for (const term of terms) {
    if (description.includes(term)) score += POINTS.description;
  }
  return score;
}

// PUBLIC ENTRY POINT
export function scoreAndRank(
  restaurants: any[],
  parsed: ParsedQuery | null,
  cityCoords?: [number, number] | null,
  radiusMeters?: number,
): any[] {
  if (!parsed || restaurants.length === 0) return restaurants;

  const allTerms = [
    ...new Set([
      ...parsed.searchTerms,
      ...parsed.foodKeywords,
      ...parsed.cuisines,
    ]),
  ]
    .map((t) => t.toLowerCase())
    .filter(Boolean);

  const hasTextTerms = allTerms.length > 0;

  // No text terms to score on (e.g. city-only or feature-only query) —
  // skip scoring and apply tiebreaker chain directly.
  if (!hasTextTerms) {
    return [...restaurants].sort((a, b) =>
      tiebreak(a, b, parsed, cityCoords, radiusMeters),
    );
  }

  const scored = restaurants
    .map((r) => {
      const slugName = scoreSlugAndName(r, allTerms, parsed);
      const cuisine = scoreCuisine(r, allTerms);
      const description = scoreDescription(r, allTerms);
      const total = slugName + cuisine + description;

      return { restaurant: r, score: total };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return tiebreak(a.restaurant, b.restaurant, parsed, cityCoords, radiusMeters);
    });

  return scored.map((r) => r.restaurant);
}
