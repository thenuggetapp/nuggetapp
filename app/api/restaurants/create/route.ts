import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Create server-side Supabase client (can read HttpOnly cookies)
    const supabase = createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse the request body
    const restaurantData = await request.json();

    // Validate required fields
    if (!restaurantData.name || !restaurantData.city) {
      return NextResponse.json(
        { error: 'Missing required fields: name and city are required' },
        { status: 400 }
      );
    }

    // Generate slug from restaurant name
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    const baseSlug = generateSlug(restaurantData.name);

    let slug = baseSlug;
    const { data: slugConflict } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (slugConflict) {
      const timestamp = Date.now().toString().slice(-6);
      slug = `${slug}-${timestamp}`;
    }

    // Insert the restaurant
    const { data: restaurant, error: insertError } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantData.name,
        slug: slug,
        cuisine: restaurantData.cuisine || null,
        description: restaurantData.description || null,
        phone: restaurantData.phone || null,
        price_level: restaurantData.price_level || 2,
        address: restaurantData.address || null,
        city: restaurantData.city,
        country: restaurantData.country || 'United Kingdom',
        latitude: restaurantData.latitude || 0,
        longitude: restaurantData.longitude || 0,
        image_url: restaurantData.image_url || null,
        google_place_id: restaurantData.google_place_id || null,
        website_url: restaurantData.website_url || null,
        google_maps_url: restaurantData.google_maps_url || null,
        opening_times: restaurantData.opening_times || {},
        visible: restaurantData.visible !== undefined ? restaurantData.visible : true,
        // Amenities
        nugget_verified: restaurantData.nugget_verified || false,
        kids_menu: restaurantData.kids_menu || false,
        high_chairs: restaurantData.high_chairs || false,
        wheelchair_access: restaurantData.wheelchair_access || false,
        outdoor_seating: restaurantData.outdoor_seating || false,
        changing_table: restaurantData.changing_table || false,
        vegetarian_options: restaurantData.vegetarian_options || false,
        vegan_options: restaurantData.vegan_options || false,
        gluten_free_options: restaurantData.gluten_free_options || false,
        dog_friendly: restaurantData.dog_friendly || false,
        playground_nearby: restaurantData.playground_nearby || false,
        quick_service: restaurantData.quick_service || false,
        good_for_groups: restaurantData.good_for_groups || false,
        air_conditioning: restaurantData.air_conditioning || false,
        baby_change_mens: restaurantData.baby_change_mens || false,
        baby_change_unisex: restaurantData.baby_change_unisex || false,
        baby_change_womens: restaurantData.baby_change_womens || false,
        kids_potty_toilet: restaurantData.kids_potty_toilet || false,
        pram_storage: restaurantData.pram_storage || false,
        small_plates: restaurantData.small_plates || false,
        healthy_options: restaurantData.healthy_options || false,
        halal: restaurantData.halal || false,
        kosher: restaurantData.kosher || false,
        fun_quirky: restaurantData.fun_quirky || false,
        relaxed: restaurantData.relaxed || false,
        buzzy: restaurantData.buzzy || false,
        posh: restaurantData.posh || false,
        kids_coloring: restaurantData.kids_coloring || false,
        games_available: restaurantData.games_available || false,
        kids_play_space: restaurantData.kids_play_space || false,
        teen_favourite: restaurantData.teen_favourite || false,
        friendly_staff: restaurantData.friendly_staff || false,
        takeaway: restaurantData.takeaway || false,
        free_kids_meal: restaurantData.free_kids_meal || false,
        one_pound_kids_meal: restaurantData.one_pound_kids_meal || false,
        tourist_attraction_nearby: restaurantData.tourist_attraction_nearby || false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Restaurant insert error:', insertError);
      return NextResponse.json(
        { error: `Failed to create restaurant: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Create ownership record
    const { error: ownershipError } = await supabase
      .from('restaurant_ownership')
      .insert({
        restaurant_id: restaurant.id,
        owner_id: user.id,
      });

    if (ownershipError) {
      console.error('Ownership insert error:', ownershipError);
      // Don't fail the entire operation if ownership insert fails
      // The restaurant was created successfully
    }

    // Create analytics record
    const { error: analyticsError } = await supabase
      .from('restaurant_analytics')
      .insert({
        restaurant_id: restaurant.id,
        views: 0,
        clicks: 0,
        bookmarks: 0,
      });

    if (analyticsError) {
      console.error('Analytics insert error:', analyticsError);
      // Don't fail the entire operation if analytics insert fails
    }

    return NextResponse.json(
      {
        success: true,
        restaurant,
        message: 'Restaurant created successfully'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
