import { NextRequest, NextResponse } from 'next/server';
import { photoHasNonEmptyAuthorAttributions } from '@/lib/google-places-photo-attribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PLACE_ID_LEN = 512;
const MAX_PHOTO_REF_LEN = 2048;

async function proxyPlacePhoto(
  photoRef: string,
  maxwidth: string,
  apiKey: string
): Promise<Response> {
  const photoUrl = new URL(
    'https://maps.googleapis.com/maps/api/place/photo'
  );
  photoUrl.searchParams.set('photo_reference', photoRef);
  photoUrl.searchParams.set('maxwidth', maxwidth);
  photoUrl.searchParams.set('key', apiKey);
  return fetch(photoUrl.toString());
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API for google photo lookup' },
      { status: 503 }
    );
  }

  const maxwidth = request.nextUrl.searchParams.get('maxwidth') || '800';
  const photoRefParam = request.nextUrl.searchParams.get('photo_reference')?.trim();

  if (photoRefParam) {
    if (photoRefParam.length > MAX_PHOTO_REF_LEN) {
      return NextResponse.json({ error: 'Invalid photo_reference' }, { status: 400 });
    }
    const photoRes = await proxyPlacePhoto(photoRefParam, maxwidth, apiKey);
    if (!photoRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch photo' },
        { status: photoRes.status >= 400 ? photoRes.status : 502 }
      );
    }
    const contentType =
      photoRes.headers.get('Content-Type') || 'image/jpeg';
    return new NextResponse(photoRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const placeId = request.nextUrl.searchParams.get('place_id')?.trim();
  if (!placeId || placeId.length > MAX_PLACE_ID_LEN) {
    return NextResponse.json(
      { error: 'Invalid place_id or missing photo_reference' },
      { status: 400 }
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
    return NextResponse.json(
      { error: 'No photo available' },
      { status: 404 }
    );
  }

  const photos = detailsJson.result.photos as Array<{ photo_reference?: string }>;
  const chosen = photos.find(
    (p) =>
      p?.photo_reference &&
      !photoHasNonEmptyAuthorAttributions(p)
  );
  if (!chosen?.photo_reference) {
    return NextResponse.json(
      { error: 'No photo available' },
      { status: 404 }
    );
  }

  const photoRef = chosen.photo_reference;
  const photoRes = await proxyPlacePhoto(photoRef, maxwidth, apiKey);
  if (!photoRes.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: photoRes.status >= 400 ? photoRes.status : 502 }
    );
  }

  const contentType =
    photoRes.headers.get('Content-Type') || 'image/jpeg';

  return new NextResponse(photoRes.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      // Do not cache Google photo bytes long-term (ToS / freshness)

      'Cache-Control': 'private, no-store',
    },
  });
}
