import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ParsedQuery } from "@/lib/search/natural-language-parser";

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

export function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
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
  terms: string[],
  fullQuery?: string,
): Promise<string[]> {
  const patterns = new Set<string>();

  for (const term of terms) {
    const normalized = term.trim().toLowerCase();
    if (normalized.length >= 2) {
      patterns.add(escapeIlikePattern(normalized));
    }
  }

  if (fullQuery) {
    const normalizedQuery = fullQuery.trim().toLowerCase();
    if (normalizedQuery.length >= 2) {
      patterns.add(escapeIlikePattern(normalizedQuery));
    }
  }

  if (patterns.size === 0) return [];

  const orConditions = [...patterns]
    .map((pattern) => `full_name.ilike.%${pattern}%`)
    .join(",");

  const client = getHeroLookupClient(supabase);
  const { data, error } = await client
    .from("user_profiles")
    .select("id")
    .eq("role", "local_hero")
    .or(orConditions);

  if (error) {
    console.error("Local hero lookup error:", error);
    return [];
  }

  return [...new Set((data ?? []).map((hero) => hero.id))];
}

export function buildAddedByUserIdCondition(heroIds: string[]): string | null {
  if (heroIds.length === 0) return null;
  return `added_by_user_id.in.(${heroIds.join(",")})`;
}

export async function resolveLocalHeroIdsForSearch(
  supabase: SupabaseClient,
  parsed: ParsedQuery | null,
  safeQuery: string,
): Promise<string[]> {
  if (!shouldMatchLocalHeroNames(parsed, safeQuery)) return [];

  return findLocalHeroIdsMatchingTerms(
    supabase,
    parsed?.searchTerms ?? [],
    safeQuery,
  );
}
