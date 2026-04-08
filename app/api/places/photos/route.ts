import { NextRequest, NextResponse } from 'next/server';
import {
  parsePlacesPhotoAttribution,
  type PlacesPhotoAttribution,
} from '@/lib/google-places-photo-attribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PLACE_ID_LEN = 512;

export type PlacesPhotoListItem = {
  url: string;
  attribution: PlacesPhotoAttribution | null;
};

/**
 * Returns same-origin proxy URLs and optional attribution for each Place photo.
 * Bytes are served by /api/places/photo.
 */
export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')?.trim();
  if (!placeId || placeId.length > MAX_PLACE_ID_LEN) {
    return NextResponse.json({ error: 'Invalid place_id' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API for google photo lookup' },
      { status: 503 }
    );
  }

  const detailsUrl = new URL(
    'https://maps.googleapis.com/maps/api/place/details/json'
  );
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('fields', 'photos');
  detailsUrl.searchParams.set('key', apiKey);

  const detailsRes = await fetch(detailsUrl.toString());
  const detailsJson = await detailsRes.json();

  if (detailsJson.status !== 'OK' || !Array.isArray(detailsJson.result?.photos)) {
    return NextResponse.json({
      photos: [] as PlacesPhotoListItem[],
      imageUrls: [] as string[],
    });
  }

  const maxwidth = request.nextUrl.searchParams.get('maxwidth') || '800';
  const photosRaw = detailsJson.result.photos as Array<{ photo_reference?: string }>;

  const photos: PlacesPhotoListItem[] = photosRaw
    .filter((p) => p?.photo_reference)
    .map((p) => {
      const url = `/api/places/photo?photo_reference=${encodeURIComponent(p.photo_reference!)}&maxwidth=${encodeURIComponent(maxwidth)}`;
      return {
        url,
        attribution: parsePlacesPhotoAttribution(p),
      };
    });

  const imageUrls = photos.map((p) => p.url);

  return NextResponse.json(
    { photos, imageUrls },
    {
      headers: {
        'Cache-Control': 'private, max-age=300',
      },
    }
  );
}
