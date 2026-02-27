import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { isGooglePlacesEdgePhotoUrl } from '@/lib/google-places-photo';
import { importGooglePlacesPhotoUrlToStorage } from '@/lib/google-places-photo-import.server';

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL.');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

async function attachImportedGooglePlacesPhoto(params: {
  restaurantId: string;
  googlePlacesPhotoUrl: string;
}) {
  const supabaseAdmin = getSupabaseAdminClient();
  const { publicUrl } = await importGooglePlacesPhotoUrlToStorage({
    restaurantId: params.restaurantId,
    googlePlacesPhotoUrl: params.googlePlacesPhotoUrl,
  });

  // Update primary restaurant image_url
  const { error: updateError } = await supabaseAdmin
    .from('restaurants')
    .update({ image_url: publicUrl })
    .eq('id', params.restaurantId);

  if (updateError) {
    throw new Error(`Failed to update restaurants.image_url: ${updateError.message}`);
  }

  // Ensure an entry exists in restaurant_images too (used by ImageCarousel)
  const { data: existingImage, error: existingError } = await supabaseAdmin
    .from('restaurant_images')
    .select('id')
    .eq('restaurant_id', params.restaurantId)
    .eq('image_url', publicUrl)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to check existing restaurant_images: ${existingError.message}`);
  }

  if (!existingImage) {
    const { error: insertError } = await supabaseAdmin
      .from('restaurant_images')
      .insert({
        restaurant_id: params.restaurantId,
        image_url: publicUrl,
        is_featured: true,
        display_order: 0,
      });

    if (insertError) {
      throw new Error(`Failed to insert restaurant_images: ${insertError.message}`);
    }
  }

  return publicUrl;
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    // Verify admin access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check if admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all restaurants (admins see everything including hidden ones)
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error('Admin API Route Error:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Verify admin access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get restaurant data from request body
    const restaurantData = await request.json();
    const maybeGooglePhotoUrl: string | undefined = restaurantData?.image_url;

    // Never store the edge function photo URL directly; it 401s in browsers.
    if (isGooglePlacesEdgePhotoUrl(maybeGooglePhotoUrl)) {
      restaurantData.image_url = null;
    }

    // Insert new restaurant
    let { data, error } = await supabase
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();

    if (error) throw error;

    // If this was a Google Places photo URL, import it into Storage and persist a public URL.
    if (data?.id && isGooglePlacesEdgePhotoUrl(maybeGooglePhotoUrl)) {
      const publicUrl = await attachImportedGooglePlacesPhoto({
        restaurantId: data.id,
        googlePlacesPhotoUrl: maybeGooglePhotoUrl!,
      });
      data = { ...data, image_url: publicUrl };
    }

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error('Admin Create Restaurant Error:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient();
    
    // Verify admin access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get restaurant ID and update data from request body
    const { id, ...updateData } = await request.json();
    const maybeGooglePhotoUrl: string | undefined = updateData?.image_url;

    // Don't store edge function photo URLs directly.
    if (isGooglePlacesEdgePhotoUrl(maybeGooglePhotoUrl)) {
      delete updateData.image_url;
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Update restaurant (if there are non-image updates)
    let data: any = null;
    if (Object.keys(updateData).length > 0) {
      const resp = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      data = resp.data;
      if (resp.error) throw resp.error;
    } else {
      const resp = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      data = resp.data;
      if (resp.error) throw resp.error;
    }

    // If this was a Google Places photo URL, import it into Storage and update.
    if (isGooglePlacesEdgePhotoUrl(maybeGooglePhotoUrl)) {
      const publicUrl = await attachImportedGooglePlacesPhoto({
        restaurantId: id,
        googlePlacesPhotoUrl: maybeGooglePhotoUrl!,
      });
      data = { ...data, image_url: publicUrl };
    }

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error('Admin Update Restaurant Error:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    
    // Verify admin access
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get restaurant ID from search params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Delete restaurant
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('Admin Delete Restaurant Error:', error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}

