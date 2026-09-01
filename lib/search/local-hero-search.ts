import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Fuse from "fuse.js";
import { ParsedQuery } from "@/lib/search/natural-language-parser";

/** Per-term fuzziness for hero-token matching (0 = exact, 1 = match anything). */
export const LOCAL_HERO_FUSE_THRESHOLD = 0.35;
export const LOCAL_HERO_NAME_TOKEN_SCORE_THRESHOLD = 0;

export interface LocalHeroCandidate {
  id: string;
  full_name: string;
}

interface ScoredHeroCandidate {
  candidate: LocalHeroCandidate;
  score: number;
  tokenScores: Array<{
    token: string;
    fuseScore: number;
    tokenScore: number;
  }>;
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

function tokenizeHeroName(fullName: string): string[] {
  return fullName.trim().split(/\s+/).filter(Boolean);
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
 * Score one hero by fuzzy-matching each name token against the full search phrase.
 * Per matching token: (tokenLength / searchPhraseLength) * (1 - fuseScore).
 */
export function scoreHeroCandidate(
  candidate: LocalHeroCandidate,
  safeQuery: string,
  fuseThreshold: number = LOCAL_HERO_FUSE_THRESHOLD,
): ScoredHeroCandidate {
  const searchPhrase = safeQuery.trim();
  const searchPhraseLength = searchPhrase.length;
  const tokenScores: ScoredHeroCandidate["tokenScores"] = [];
  let score = 0;

  if (searchPhraseLength === 0) {
    return { candidate, score, tokenScores };
  }

  for (const token of tokenizeHeroName(candidate.full_name)) {
    const match = Fuse.match(token, searchPhrase, { threshold: fuseThreshold });
    if (!match.isMatch) continue;

    const fuseScore = match.score ?? 1;
    const tokenScore =
      (token.length / searchPhraseLength) * (1 - fuseScore);

    score += tokenScore;
    tokenScores.push({ token, fuseScore, tokenScore });
  }

  return { candidate, score, tokenScores };
}

/**
 * Stage 2: rank ILIKE candidates by locally computed token scores.
 * Each hero name token is fuzzy-matched against the full safeQuery (not token search).
 */
export function rankHeroCandidatesByLocalScore(
  candidates: LocalHeroCandidate[],
  safeQuery: string,
  fuseThreshold: number = LOCAL_HERO_FUSE_THRESHOLD,
  maxResults: number = 3,
): LocalHeroCandidate[] {
  const searchPhrase = safeQuery.trim();
  if (candidates.length === 0 || !searchPhrase) return [];

  const ranked = candidates
    .map((candidate) => scoreHeroCandidate(candidate, searchPhrase, fuseThreshold))
    .filter((entry) => entry.score > LOCAL_HERO_NAME_TOKEN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  const rankedIds = new Set(ranked.map((entry) => entry.candidate.id));

  for (const candidate of candidates) {
    if (rankedIds.has(candidate.id)) continue;
    console.log("Local hero score:", {
      query: searchPhrase,
      id: candidate.id,
      full_name: candidate.full_name,
      score: LOCAL_HERO_NAME_TOKEN_SCORE_THRESHOLD,
      tokenScores: [],
    });
  }

  for (const entry of ranked) {
    console.log("Local hero score:", {
      query: searchPhrase,
      id: entry.candidate.id,
      full_name: entry.candidate.full_name,
      score: entry.score,
      tokenScores: entry.tokenScores,
    });
  }

  return ranked.slice(0, maxResults).map((entry) => entry.candidate);
}

export async function findLocalHeroIdsMatchingTerms(
  supabase: SupabaseClient,
  _parsed: ParsedQuery | null,
  safeQuery: string,
  fuseThreshold: number = LOCAL_HERO_FUSE_THRESHOLD,
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

  return rankHeroCandidatesByLocalScore(candidates, safeQuery, fuseThreshold).map(
    (hero) => hero.id,
  );
}

export function buildAddedByUserIdCondition(heroIds: string[]): string | null {
  if (heroIds.length === 0) return null;
  return `added_by_user_id.in.(${heroIds.join(",")})`;
}

export async function resolveLocalHeroIdsForSearch(
  supabase: SupabaseClient,
  parsed: ParsedQuery | null,
  safeQuery: string,
  fuseThreshold: number = LOCAL_HERO_FUSE_THRESHOLD,
): Promise<string[]> {
  if (!shouldMatchLocalHeroNames(parsed, safeQuery)) return [];

  return findLocalHeroIdsMatchingTerms(
    supabase,
    parsed,
    safeQuery,
    fuseThreshold,
  );
}
