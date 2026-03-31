/**
 * Resolve display image URL: prefer user-hosted image_url over Google (place_id) proxy.
 * Does not persist Google photo_reference; legacy edge-function photo URLs are deprioritized when place_id exists.
 */

const LEGACY_GOOGLE_PHOTO_PROXY =
  /googleusercontent.com/i;

export const DEFAULT_RESTAURANT_IMAGE =
  '/nugget_colour_logo.png';

/** True if image_url should be treated as user (or third-party) hosted, not our legacy Google proxy. */
export function isPreferredUserImageUrl(url: string | null | undefined): boolean {
  const u = url?.trim();
  if (!u) return false;
  if (LEGACY_GOOGLE_PHOTO_PROXY.test(u)) return false;
  return true;
}

/**
 * Hero/cover image for listings: user image_url first, then runtime Google photo by place_id, then legacy URL, else empty.
 * A request to api/place/photo returns the image from the Google Places API, so can be used like a direct link to photo
 */
export function getRestaurantDisplayImageUrl(params: {
  image_url?: string | null;
  google_place_id?: string | null;
}): string {
  const raw = params.image_url?.trim();
  if (raw && isPreferredUserImageUrl(raw)) return raw;

  const placeId = params.google_place_id?.trim();
  if (placeId) {
    return `/api/places/photo?place_id=${encodeURIComponent(placeId)}`;
  }

  if (raw) return raw;
  return '';
}

export function getRestaurantDisplayImageUrlOrFallback(params: {
  image_url?: string | null;
  google_place_id?: string | null;
}): string {
  return getRestaurantDisplayImageUrl(params) || DEFAULT_RESTAURANT_IMAGE;
}

/** Absolute URL for Open Graph / JSON-LD when src may be same-origin /api path. */
export function toAbsolutePublicImageUrl(
  pathOrUrl: string,
  origin?: string | null
): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const base =
    origin?.replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    (typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
          : '')
      : '');
  if (!base) return pathOrUrl;
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Server-side Open Graph / absolute URL for listing or detail hero. */
export function resolveRestaurantImageUrlForMetadata(params: {
  image_url?: string | null;
  google_place_id?: string | null;
}): string {
  const display = getRestaurantDisplayImageUrl(params);
  if (!display) return '/nugget_colour_logo.png';
  if (display.startsWith('http')) return display;
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
      : '');
  if (!origin) return display;
  return `${origin}${display.startsWith('/') ? display : `/${display}`}`;
}
