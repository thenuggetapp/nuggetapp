/**
 * One-off migration: restaurants whose image_url contains "google" (legacy proxy URLs).
 *
 * For each row, calls Google Places Text Search (Legacy). If any result's name matches
 * the DB restaurant name (normalized), sets google_place_id and clears image_url.
 * Also deletes `restaurant_images` rows for that restaurant whose `image_url` contains
 * "google" (legacy Google proxy / CDN links).
 *
 * Usage:
 *   npx tsx scripts/migrate-google-image-urls-to-place-id.ts           # apply
 *   npx tsx scripts/migrate-google-image-urls-to-place-id.ts --dry-run # log only
 *   npx tsx scripts/migrate-google-image-urls-to-place-id.ts --limit=5
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_PLACES_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googleApiKey = process.env.GOOGLE_PLACES_API_KEY!;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!googleApiKey) {
  console.error('Missing GOOGLE_PLACES_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RestaurantRow {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  image_url: string | null;
  google_place_id: string | null;
}

interface TextSearchHit {
  name: string;
  place_id: string;
}

function normalizeRestaurantName(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[''`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function namesMatch(dbName: string, apiName: string): boolean {
  return normalizeRestaurantName(dbName) === normalizeRestaurantName(apiName);
}

function buildSearchQuery(row: RestaurantRow): string {
  const parts = [row.name, row.city || '', row.address || '']
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.join(' ');
}

async function textSearchLegacy(query: string): Promise<TextSearchHit[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('key', googleApiKey);

  const res = await fetch(url.toString());
  const json = (await res.json()) as {
    status: string;
    error_message?: string;
    results?: Array<{ name: string; place_id: string }>;
  };

  if (json.status === 'ZERO_RESULTS') {
    return [];
  }
  if (json.status !== 'OK') {
    throw new Error(
      `Text Search ${json.status}: ${json.error_message || 'unknown error'}`
    );
  }

  return (json.results || []).map((r) => ({
    name: r.name,
    place_id: r.place_id,
  }));
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Rows in restaurant_images for this restaurant with "google" in the image URL (case-insensitive). */
async function fetchGoogleLinkedGalleryRows(restaurantId: string): Promise<
  { id: string; image_url: string | null }[]
> {
  const { data, error } = await supabase
    .from('restaurant_images')
    .select('id, image_url')
    .eq('restaurant_id', restaurantId)
    .ilike('image_url', '%google%');

  if (error) throw new Error(`restaurant_images select: ${error.message}`);
  return data || [];
}

async function main() {
  let q = supabase
    .from('restaurants')
    .select('id, name, city, address, image_url, google_place_id')
    .ilike('image_url', '%google%');

  if (limit != null && !Number.isNaN(limit)) {
    q = q.limit(limit);
  }

  const { data: rows, error } = await q;

  if (error) {
    console.error('Supabase query failed:', error.message);
    process.exit(1);
  }

  const list = (rows || []) as RestaurantRow[];
  console.log(
    `Found ${list.length} restaurant(s) with "google" in image_url${dryRun ? ' (dry-run)' : ''}.`
  );

  let updated = 0;
  let skippedNoMatch = 0;
  let skippedError = 0;
  let galleryRowsRemoved = 0;

  for (let i = 0; i < list.length; i++) {
    const row = list[i];
    const query = buildSearchQuery(row);
    console.log(`\n[${i + 1}/${list.length}] ${row.name} (${row.id})`);
    const iu = row.image_url || '';
    console.log(`  image_url: ${iu.length > 80 ? `${iu.slice(0, 80)}…` : iu || '(empty)'}`);
    console.log(`  search query: ${query.slice(0, 120)}${query.length > 120 ? '…' : ''}`);

    try {
      const hits = await textSearchLegacy(query);
      await sleep(250);

      const match = hits.find((h) => namesMatch(row.name, h.name));

      if (!match) {
        console.log(
          `  SKIP: no Text Search result with matching name (${hits.length} result(s) returned).`
        );
        if (hits.length > 0) {
          console.log(
            `  First result names: ${hits
              .slice(0, 3)
              .map((h) => `"${h.name}"`)
              .join(', ')}`
          );
        }
        skippedNoMatch++;
        continue;
      }

      console.log(
        `  MATCH: "${match.name}" -> place_id ${match.place_id}${dryRun ? ' (dry-run, no DB write)' : ''}`
      );

      let galleryRows: { id: string; image_url: string | null }[] = [];
      try {
        galleryRows = await fetchGoogleLinkedGalleryRows(row.id);
      } catch (ge: any) {
        console.error('  restaurant_images query failed:', ge?.message || ge);
        skippedError++;
        continue;
      }

      if (galleryRows.length > 0) {
        console.log(
          dryRun
            ? `  dry-run: would delete ${galleryRows.length} restaurant_images row(s) with "google" in image_url`
            : `  found ${galleryRows.length} restaurant_images row(s) with "google" in image_url (remove after restaurant update)`
        );
      }

      if (!dryRun) {
        const { error: upErr } = await supabase
          .from('restaurants')
          .update({
            google_place_id: match.place_id,
            image_url: null,
          })
          .eq('id', row.id);

        if (upErr) {
          console.error('  UPDATE failed:', upErr.message);
          skippedError++;
          continue;
        }

        if (galleryRows.length > 0) {
          const ids = galleryRows.map((r) => r.id);
          const { error: delErr } = await supabase
            .from('restaurant_images')
            .delete()
            .in('id', ids);

          if (delErr) {
            console.error('  restaurant_images DELETE failed:', delErr.message);
            skippedError++;
            continue;
          }
          console.log(
            `  deleted ${galleryRows.length} restaurant_images row(s) with "google" in image_url`
          );
          galleryRowsRemoved += galleryRows.length;
        }
      } else if (galleryRows.length > 0) {
        galleryRowsRemoved += galleryRows.length;
      }

      updated++;
    } catch (e: any) {
      console.error('  ERROR:', e?.message || e);
      skippedError++;
    }
  }

  console.log('\n---');
  console.log(
    `Done. updated=${updated} restaurant_images_google_urls_removed=${galleryRowsRemoved}${
      dryRun ? ' (dry-run: includes rows that would be deleted)' : ''
    } skipped_no_name_match=${skippedNoMatch} errors=${skippedError}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
