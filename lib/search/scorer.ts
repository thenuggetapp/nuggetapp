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
 *   3. Feature count tiebreaker
 */

import { ParsedQuery } from "@/lib/search/natural-language-parser";
import { FILTER_KEY_TO_DB_COLUMN } from "@/lib/db-amenities";
import { FEATURE_KEYWORDS } from "@/lib/search/synonym-map";

const POINTS = {
  slugExact: 20, // full query phrase in slug
  nameExact: 18, // full query phrase in name
  localHero: 5, // query term matches recommending local hero
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

function tiebreak(a: any, b: any, parsed?: ParsedQuery | null): number {
  // 1. Likes
  const likesA = a.likes_count ?? 0;
  const likesB = b.likes_count ?? 0;
  if (likesB !== likesA) return likesB - likesA;

  // 2. Description mentions any requested feature keywords (boolean)
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

  // 3. Feature count
  const featuresA = FEATURE_COLUMNS.filter((col) => a[col] === true).length;
  const featuresB = FEATURE_COLUMNS.filter((col) => b[col] === true).length;
  return featuresB - featuresA;
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
  const isDiscoveryQuery = parsed.cuisines.length > 0;

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

function scoreLocalHero(
  restaurant: any,
  matchedLocalHeroIds: Set<string>,
): number {
  if (matchedLocalHeroIds.size === 0) return 0;

  if (
    restaurant.added_by_user_id &&
    matchedLocalHeroIds.has(restaurant.added_by_user_id)
  ) {
    return POINTS.localHero;
  }

  return 0;
}

// PUBLIC ENTRY POINT
export function scoreAndRank(
  restaurants: any[],
  parsed: ParsedQuery | null,
  matchedLocalHeroIds: string[] = [],
): any[] {
  if (!parsed || restaurants.length === 0) return restaurants;

  const allTerms = [
    ...new Set([...parsed.searchTerms, ...parsed.cuisines]),
  ]
    .map((t) => t.toLowerCase())
    .filter(Boolean);

  const heroIdSet = new Set(matchedLocalHeroIds);
  const hasTextTerms = allTerms.length > 0;
  const hasHeroMatches = heroIdSet.size > 0;

  // No text terms to score on (e.g. city-only or feature-only query) —
  // skip scoring and apply tiebreaker chain directly.
  if (!hasTextTerms && !hasHeroMatches) {
    return [...restaurants].sort((a, b) => tiebreak(a, b, parsed));
  }

  const scored = restaurants
    .map((r) => {
      const slugName = scoreSlugAndName(r, allTerms, parsed);
      const cuisine = scoreCuisine(r, allTerms);
      const description = scoreDescription(r, allTerms);
      const localHero = scoreLocalHero(r, heroIdSet);
      const total = slugName + cuisine + description + localHero;

      return { restaurant: r, score: total };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return tiebreak(a.restaurant, b.restaurant, parsed);
    });

  return scored.map((r) => r.restaurant);
}
