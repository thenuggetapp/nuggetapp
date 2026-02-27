import { createClient } from "@supabase/supabase-js";
import {
  inferImageExtensionFromContentType,
  parseGooglePlacesEdgePhotoUrl,
} from "@/lib/google-places-photo";

type ImportResult = {
  publicUrl: string;
  storagePath: string;
  contentType: string;
};

export async function importGooglePlacesPhotoUrlToStorage(params: {
  restaurantId: string;
  googlePlacesPhotoUrl: string;
}): Promise<ImportResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  const { photoReference, maxWidth } = parseGooglePlacesEdgePhotoUrl(
    params.googlePlacesPhotoUrl
  );

  const photoEndpoint = new URL(`${supabaseUrl}/functions/v1/google-places`);
  photoEndpoint.searchParams.set("action", "photo");
  photoEndpoint.searchParams.set("photo_reference", photoReference);
  photoEndpoint.searchParams.set("maxwidth", String(maxWidth));

  const photoResp = await fetch(photoEndpoint.toString(), {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    cache: "no-store",
  });

  if (!photoResp.ok) {
    const body = await photoResp.text().catch(() => "");
    throw new Error(
      `Failed to fetch Google photo (${photoResp.status}): ${body.slice(0, 300)}`
    );
  }

  const contentType = photoResp.headers.get("content-type") || "image/jpeg";
  const ext = inferImageExtensionFromContentType(contentType);

  const arrayBuffer = await photoResp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const storagePath = `${params.restaurantId}/${Date.now()}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("restaurant-images")
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("restaurant-images")
    .getPublicUrl(uploadData.path);

  return {
    publicUrl: urlData.publicUrl,
    storagePath: uploadData.path,
    contentType,
  };
}

