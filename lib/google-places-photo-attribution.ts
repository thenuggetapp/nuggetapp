/**
 * Parsed credit for a Google Places photo (for UI: "Photo by …" link).
 */
export interface PlacesPhotoAttribution {
  name: string;
  uri: string;
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** First <a href="…">…</a> in legacy Place Details `html_attributions[]` strings. */
function parseHtmlAttributionString(html: string): PlacesPhotoAttribution | null {
  const trimmed = html.trim();
  const hrefMatch = trimmed.match(/href\s*=\s*["']([^"']+)["']/i);
  if (!hrefMatch?.[1]) return null;
  const textMatch = trimmed.match(/>([\s\S]*?)<\s*\/\s*a\s*>/i);
  const rawName = textMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Photographer';
  return {
    uri: hrefMatch[1],
    name: decodeBasicEntities(rawName),
  };
}

function coalesceDisplayName(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v.trim();
  if (v && typeof v === 'object' && 'text' in v) {
    const t = (v as { text: unknown }).text;
    if (typeof t === 'string' && t.trim()) return t.trim();
  }
  return null;
}

function parseAuthorAttributionObjects(arr: unknown): PlacesPhotoAttribution | null {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const first = arr[0];
  if (!first || typeof first !== 'object') return null;
  const o = first as Record<string, unknown>;
  const name =
    coalesceDisplayName(o.displayName) ??
    coalesceDisplayName(o.display_name) ??
    (typeof o.name === 'string' ? o.name.trim() || null : null);
  const uri = o.uri ?? o.url;
  if (name && typeof uri === 'string' && uri.trim()) {
    return { name, uri: uri.trim() };
  }
  return null;
}

/**
 * Extract display name + link from a Place Details `photos[]` entry.
 */
export function parsePlacesPhotoAttribution(
  photo: unknown
): PlacesPhotoAttribution | null {
  if (!photo || typeof photo !== 'object') return null;
  const p = photo as Record<string, unknown>;

  const fromObjects = parseAuthorAttributionObjects(
    p.authorAttributions ?? p.author_attributions
  );
  if (fromObjects) return fromObjects;

  const htmlArr = p.html_attributions;
  if (Array.isArray(htmlArr)) {
    for (const h of htmlArr) {
      if (typeof h === 'string') {
        const parsed = parseHtmlAttributionString(h);
        if (parsed) return parsed;
      }
    }
  }

  return null;
}
