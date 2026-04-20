import { ParsedQuery } from "@/lib/natural-language-search";
import { FILTER_KEY_TO_DB_COLUMN } from "@/lib/amenities";

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

function scoreSlugAndName(restaurant: any, terms: string[]): number {
  if (terms.length === 0) return 0;

  let score = 0;
  const slug = restaurant.slug ?? "";
  const name = restaurant.name?.toLowerCase() ?? "";

  // Pass 1 — multi-word n-grams (bigrams, trigrams)
  for (let n = terms.length; n >= 2; n--) {
    const ngrams = getNgrams(terms, n);
    for (const ngram of ngrams) {
      const normalizedNgram = normalizeToSlug(ngram);
      if (slug.includes(normalizedNgram)) score += 12;
      if (name.includes(ngram)) score += 10;
    }
  }

  // Pass 2 — individual terms
  for (const term of terms) {
    const normalizedTerm = normalizeToSlug(term);
    if (slug.includes(normalizedTerm)) score += 6;
    if (name.includes(term)) score += 5;
  }

  return score;
}

function scoreCuisine(restaurant: any, terms: string[]): number {
  if (terms.length === 0) return 0;

  let score = 0;
  const cuisine = restaurant.cuisine?.toLowerCase() ?? "";

  for (const term of terms) {
    if (cuisine.includes(term)) score += 3;
  }

  return score;
}

function scoreDescription(restaurant: any, terms: string[]): number {
  if (terms.length === 0) return 0;

  let score = 0;
  const description = restaurant.description?.toLowerCase() ?? "";

  if (!description) return 0;

  for (const term of terms) {
    if (description.includes(term)) score += 2;
  }

  return score;
}

function scoreFeatures(restaurant: any, parsed: ParsedQuery): number {
  const features = parsed.features;
  if (!features || Object.keys(features).length === 0) return 0;

  let score = 0;
  for (const [feature, required] of Object.entries(features)) {
    if (!required) continue;
    const dbColumn = FILTER_KEY_TO_DB_COLUMN[feature];
    if (!dbColumn) continue;
    if (restaurant[dbColumn] === true) score += 20;
  }

  return score;
}

function scoreQuality(restaurant: any): number {
  // TODO: when rating and likes data is reliable
  // const ratingScore = (restaurant.rating ?? 0) * 2
  // const popularityScore = Math.log1p(restaurant.likes_count ?? 0)
  return 0;
}

function scoreRestaurant(
  restaurant: any,
  parsed: ParsedQuery,
  allTerms: string[],
): number {
  const foodTerms = [...parsed.foodKeywords, ...parsed.cuisines];
  if (foodTerms.length > 0) {
    const text =
      `${restaurant.name} ${restaurant.cuisine} ${restaurant.description}`.toLowerCase();
    if (!foodTerms.some((t) => text.includes(t))) return 0;
  }

  const base =
    scoreSlugAndName(restaurant, allTerms) +
    scoreCuisine(restaurant, allTerms) +
    scoreDescription(restaurant, allTerms) +
    scoreFeatures(restaurant, parsed) +
    scoreQuality(restaurant);

  // Bonus for matching ALL food keywords
  if (parsed.foodKeywords.length > 1) {
    const text =
      `${restaurant.name} ${restaurant.cuisine} ${restaurant.description} ${restaurant.slug}`.toLowerCase();
    const matched = parsed.foodKeywords.filter((t) => text.includes(t)).length;
    if (matched === parsed.foodKeywords.length) return base + 50;
  }

  // Bonus for matching food AND features together
  if (
    parsed.foodKeywords.length > 0 &&
    Object.keys(parsed.features).length > 0
  ) {
    const text =
      `${restaurant.name} ${restaurant.cuisine} ${restaurant.description}`.toLowerCase();
    const foodMatched = parsed.foodKeywords.some((t) => text.includes(t));
    const featuresMatched = Object.entries(parsed.features).every(
      ([feature, required]) => {
        if (!required) return true;
        const dbColumn = FILTER_KEY_TO_DB_COLUMN[feature];
        return dbColumn && restaurant[dbColumn] === true;
      },
    );
    if (foodMatched && featuresMatched) return base + 40;
  }

  return base;
}

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

  if (
    allTerms.length === 0 &&
    Object.keys(parsed.features ?? {}).length === 0
  ) {
    return restaurants;
  }

  const scored = restaurants.map((r) => ({
    restaurant: r,
    score: scoreRestaurant(r, parsed, allTerms),
  }));

  const hasFeatures = Object.keys(parsed.features ?? {}).length > 0;
  const hasTextTerms = allTerms.length > 0;

  if (hasFeatures && !hasTextTerms) {
    return scored
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.restaurant);
  }

  return scored
    .filter((r) => r.score > 0)

    .sort((a, b) => b.score - a.score)
    .map((r) => r.restaurant);
}
