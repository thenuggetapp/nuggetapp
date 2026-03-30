import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PLACE_ID_LEN = 512;

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')?.trim();
  if (!placeId || placeId.length > MAX_PLACE_ID_LEN) {
    return NextResponse.json({ error: 'Invalid place_id' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Photo service unavailable' },
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

  if (
    detailsJson.status !== 'OK' ||
    !detailsJson.result?.photos?.[0]?.photo_reference
  ) {
    return NextResponse.json(
      { error: 'No photo available' },
      { status: 404 }
    );
  }

  const photoRef = detailsJson.result.photos[0].photo_reference as string;
  const maxwidth =
    request.nextUrl.searchParams.get('maxwidth') || '800';

  const photoUrl = new URL(
    'https://maps.googleapis.com/maps/api/place/photo'
  );
  photoUrl.searchParams.set('photo_reference', photoRef);
  photoUrl.searchParams.set('maxwidth', maxwidth);
  photoUrl.searchParams.set('key', apiKey);

  const photoRes = await fetch(photoUrl.toString());
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
