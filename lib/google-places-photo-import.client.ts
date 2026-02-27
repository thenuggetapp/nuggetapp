'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  inferImageExtensionFromContentType,
  parseGooglePlacesEdgePhotoUrl,
} from '@/lib/google-places-photo';

export async function importGooglePlacesPhotoUrlToStorageClient(params: {
  supabase: SupabaseClient;
  restaurantId: string;
  googlePlacesPhotoUrl: string;
}): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data: sessionData } = await params.supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    throw new Error('You must be logged in to import Google Places photos.');
  }

  const { photoReference, maxWidth } = parseGooglePlacesEdgePhotoUrl(
    params.googlePlacesPhotoUrl
  );

  const photoEndpoint = new URL(`${supabaseUrl}/functions/v1/google-places`);
  photoEndpoint.searchParams.set('action', 'photo');
  photoEndpoint.searchParams.set('photo_reference', photoReference);
  photoEndpoint.searchParams.set('maxwidth', String(maxWidth));

  const photoResp = await fetch(photoEndpoint.toString(), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: supabaseAnonKey,
    },
    cache: 'no-store',
  });

  if (!photoResp.ok) {
    const body = await photoResp.text().catch(() => '');
    throw new Error(`Failed to fetch Google photo (${photoResp.status}): ${body.slice(0, 300)}`);
  }

  const contentType = photoResp.headers.get('content-type') || 'image/jpeg';
  const ext = inferImageExtensionFromContentType(contentType);

  const blob = await photoResp.blob();
  const storagePath = `${params.restaurantId}/${Date.now()}.${ext}`;

  const { data: uploadData, error: uploadError } = await params.supabase.storage
    .from('restaurant-images')
    .upload(storagePath, blob, {
      contentType,
      upsert: false,
      cacheControl: '3600',
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = params.supabase.storage
    .from('restaurant-images')
    .getPublicUrl(uploadData.path);

  return urlData.publicUrl;
}

