import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Fuse from "fuse.js";
import { ParsedQuery } from "@/lib/search/natural-language-parser";
import { stemWord } from "@/lib/search/stem";

/** Minimum fraction of hero name words that must match (e.g. 2/3). */
export const LOCAL_HERO_NAME_MATCH_FRACTION = 2 / 3;

/** Fuse threshold for hero name word matching (aligned with cuisine/food search). */
export const LOCAL_HERO_FUSE_THRESHOLD = 0.15;

let heroLookupClient: SupabaseClient | null = null;

function getHeroLookupClient(fallback: SupabaseClient): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return fallback;

  if (!heroLookupClient) {
    heroLookupClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } },
    );
  }

  return heroLookupClient;
}

export function tokenizeLocalHeroName(name: string): string[] {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2);
}

export function collectHeroSearchTerms(
  parsed: ParsedQuery | null,
  safeQuery: string,
): string[] {
  const terms = new Set<string>();

  for (const term of parsed?.searchTerms ?? []) {
    const normalized = term.trim().toLowerCase();
    if (normalized.length >= 2) terms.add(normalized);
  }

  const isHeroFocusedQuery =
    !parsed?.location &&
    !(parsed?.foodKeywords.length ?? 0) &&
    !(parsed?.cuisines.length ?? 0) &&
    !Object.keys(parsed?.features ?? {}).length;

  if (isHeroFocusedQuery || (parsed?.searchTerms.length ?? 0) === 0) {
    for (const word of safeQuery.toLowerCase().split(/\s+/)) {
      if (word.length >= 2) terms.add(word);
    }
  }

  return [...terms];
}

export function searchTermMatchesNameWord(
  searchTerm: string,
  nameWord: string,
): boolean {
  if (searchTerm.length < 2) return false;

  const stemmedTerm = stemWord(searchTerm);
  const stemmedName = stemWord(nameWord);
  if (stemmedTerm === stemmedName) return true;

  const fuse = new Fuse([nameWord], {
    threshold: LOCAL_HERO_FUSE_THRESHOLD,
  });

  if (fuse.search(searchTerm).length > 0) return true;
  if (stemmedTerm !== searchTerm && fuse.search(stemmedTerm).length > 0) {
    return true;
  }

  return false;
}

export function countMatchedHeroNameWords(
  nameWords: string[],
  searchTerms: string[],
): number {
  if (nameWords.length === 0 || searchTerms.length === 0) return 0;

  return nameWords.filter((nameWord) =>
    searchTerms.some((term) => searchTermMatchesNameWord(term, nameWord)),
  ).length;
}

export function heroNameMeetsMatchThreshold(
  heroFullName: string,
  searchTerms: string[],
  matchFraction: number = LOCAL_HERO_NAME_MATCH_FRACTION,
): boolean {
  const nameWords = tokenizeLocalHeroName(heroFullName);
  if (nameWords.length === 0 || searchTerms.length === 0) return false;

  const matchedWords = countMatchedHeroNameWords(nameWords, searchTerms);
  const requiredMatches = Math.ceil(nameWords.length * matchFraction);

  return matchedWords >= requiredMatches;
}

export function shouldMatchLocalHeroNames(
  parsed: ParsedQuery | null,
  safeQuery: string,
): boolean {
  if (!safeQuery || safeQuery.length < 2) return false;
  if ((parsed?.searchTerms.length ?? 0) > 0) return true;

  return (
    !parsed?.location &&
    !(parsed?.foodKeywords.length ?? 0) &&
    !(parsed?.cuisines.length ?? 0) &&
    !Object.keys(parsed?.features ?? {}).length
  );
}

export async function findLocalHeroIdsMatchingTerms(
  supabase: SupabaseClient,
  parsed: ParsedQuery | null,
  safeQuery: string,
  matchFraction: number = LOCAL_HERO_NAME_MATCH_FRACTION,
): Promise<string[]> {
  const searchTerms = collectHeroSearchTerms(parsed, safeQuery);
  if (searchTerms.length === 0) return [];
  const orConditions = [...searchTerms]
    .map((pattern) => `full_name.ilike.%${pattern}%`)
    .join(",");

  const client = getHeroLookupClient(supabase);
  const { data, error } = await client
    .from("user_profiles")
    .select("id, full_name")
    .eq("role", "local_hero")
    .not("full_name", "is", null)
    .or(orConditions);

  if (error) {
    console.error("Local hero lookup error:", error);
    return [];
  }

  return (data ?? [])
    .filter(
      (hero) =>
        hero.full_name &&
        heroNameMeetsMatchThreshold(hero.full_name, searchTerms, matchFraction),
    )
    .map((hero) => hero.id);
}

export function buildAddedByUserIdCondition(heroIds: string[]): string | null {
  if (heroIds.length === 0) return null;
  return `added_by_user_id.in.(${heroIds.join(",")})`;
}

export async function resolveLocalHeroIdsForSearch(
  supabase: SupabaseClient,
  parsed: ParsedQuery | null,
  safeQuery: string,
  matchFraction: number = LOCAL_HERO_NAME_MATCH_FRACTION,
): Promise<string[]> {
  if (!shouldMatchLocalHeroNames(parsed, safeQuery)) return [];

  return findLocalHeroIdsMatchingTerms(
    supabase,
    parsed,
    safeQuery,
    matchFraction,
  );
}
