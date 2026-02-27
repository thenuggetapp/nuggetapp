export function isGooglePlacesEdgePhotoUrl(value?: string | null): boolean {
  if (!value) return false;
  return value.includes("/functions/v1/google-places") && value.includes("action=photo") && value.includes("photo_reference=");
}

export function parseGooglePlacesEdgePhotoUrl(photoUrl: string): {
  photoReference: string;
  maxWidth: number;
} {
  const url = new URL(photoUrl);

  const action = url.searchParams.get("action");
  const photoReference = url.searchParams.get("photo_reference");
  const maxWidthRaw = url.searchParams.get("maxwidth");

  if (action !== "photo" || !photoReference) {
    throw new Error("Invalid Google Places photo URL (missing action=photo or photo_reference).");
  }

  const maxWidth = maxWidthRaw ? Number(maxWidthRaw) : 800;
  return {
    photoReference,
    maxWidth: Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : 800,
  };
}

export function inferImageExtensionFromContentType(contentType?: string | null): string {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("image/webp")) return "webp";
  if (ct.includes("image/png")) return "png";
  if (ct.includes("image/jpeg") || ct.includes("image/jpg")) return "jpg";
  if (ct.startsWith("image/")) return ct.replace("image/", "");
  return "jpg";
}

