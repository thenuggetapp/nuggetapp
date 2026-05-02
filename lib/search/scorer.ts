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

function tiebreak(a: any, b: any): number {
  const likesA = a.likes_count ?? 0;
  const likesB = b.likes_count ?? 0;
  if (likesB !== likesA) return likesB - likesA;

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

  const hasFeatures = Object.keys(parsed.features ?? {}).length > 0;
  const hasTextTerms = allTerms.length > 0;

  // No text terms to score on (e.g. city-only or feature-only query) —
  // skip scoring and apply tiebreaker chain directly.
  if (!hasTextTerms) {
    return [...restaurants].sort(tiebreak);
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
      return tiebreak(a.restaurant, b.restaurant);
    });

  return scored.map((r) => r.restaurant);
}
