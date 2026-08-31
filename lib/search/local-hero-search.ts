import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Fuse from "fuse.js";
import { ParsedQuery } from "@/lib/search/natural-language-parser";

/** Per-term fuzziness for token search (0 = exact, 1 = match anything). */
export const LOCAL_HERO_FUSE_TOKEN_THRESHOLD = 0.35;

/** Max combined Fuse score to accept (0 = perfect, 1 = worst). */
export const LOCAL_HERO_MAX_MATCH_SCORE = 0.85;

export interface LocalHeroCandidate {
  id: string;
  full_name: string;
}

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

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/** Tokens from the full query used for stage-1 ILIKE candidate retrieval. */
export function collectIlikeCandidateTerms(safeQuery: string): string[] {
  const terms = new Set<string>();

  for (const word of safeQuery.toLowerCase().split(/\s+/)) {
    const normalized = word.trim();
    if (normalized.length >= 2) terms.add(normalized);
  }

  return [...terms];
}

export function shouldMatchLocalHeroNames(
  _parsed: ParsedQuery | null,
  safeQuery: string,
): boolean {
  return safeQuery.trim().length >= 2;
}

/**
 * Stage 2: Fuse token search over ILIKE candidates using the full safeQuery.
 * tokenMatch 'any' — a hero matches if any query token fuzzy-matches their name.
 */
export function filterHeroCandidatesWithTokenSearch(
  candidates: LocalHeroCandidate[],
  safeQuery: string,
  fuseThreshold: number = LOCAL_HERO_FUSE_TOKEN_THRESHOLD,
  maxScore: number = LOCAL_HERO_MAX_MATCH_SCORE,
  maxResults: number = 3,
): LocalHeroCandidate[] {
  if (candidates.length === 0 || !safeQuery.trim()) return [];

  const fuse = new Fuse(candidates, {
    useTokenSearch: true,
    tokenMatch: "any",
    keys: ["full_name"],
    threshold: fuseThreshold,
    ignoreFieldNorm: true,
    includeScore: true,
  });

  return fuse
    .search(safeQuery.trim())
    .filter((result) => (result.score ?? 1) <= maxScore)
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    .slice(0, maxResults)
    .map((result) => result.item);
}

export async function findLocalHeroIdsMatchingTerms(
  supabase: SupabaseClient,
  _parsed: ParsedQuery | null,
  safeQuery: string,
  fuseThreshold: number = LOCAL_HERO_FUSE_TOKEN_THRESHOLD,
): Promise<string[]> {
  const ilikeTerms = collectIlikeCandidateTerms(safeQuery);
  if (ilikeTerms.length === 0) return [];

  const orConditions = ilikeTerms
    .map((term) => `full_name.ilike.%${escapeIlikePattern(term)}%`)
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

  const candidates = (data ?? []).filter(
    (hero): hero is LocalHeroCandidate =>
      Boolean(hero.id && hero.full_name),
  );

  return filterHeroCandidatesWithTokenSearch(
    candidates,
    safeQuery,
    fuseThreshold,
  ).map((hero) => hero.id);
}

export function buildAddedByUserIdCondition(heroIds: string[]): string | null {
  if (heroIds.length === 0) return null;
  return `added_by_user_id.in.(${heroIds.join(",")})`;
}

export async function resolveLocalHeroIdsForSearch(
  supabase: SupabaseClient,
  parsed: ParsedQuery | null,
  safeQuery: string,
  fuseThreshold: number = LOCAL_HERO_FUSE_TOKEN_THRESHOLD,
): Promise<string[]> {
  if (!shouldMatchLocalHeroNames(parsed, safeQuery)) return [];

  return findLocalHeroIdsMatchingTerms(
    supabase,
    parsed,
    safeQuery,
    fuseThreshold,
  );
}
