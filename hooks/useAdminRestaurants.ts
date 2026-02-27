import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/swr-fetcher";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { isGooglePlacesEdgePhotoUrl } from "@/lib/google-places-photo";
import { importGooglePlacesPhotoUrlToStorageClient } from "@/lib/google-places-photo-import.client";

interface Restaurant {
  id?: string;
  name: string;
  slug?: string;
  cuisine: string;
  likes_count: number;
  price_level: number;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  description?: string;
  latitude: number;
  longitude: number;
  google_maps_url?: string;
  website_url?: string;
  nugget_verified: boolean;
  kids_menu: boolean;
  high_chairs: boolean;
  wheelchair_access: boolean;
  outdoor_seating: boolean;
  changing_table: boolean;
  vegetarian_options: boolean;
  vegan_options: boolean;
  gluten_free_options: boolean;
  image_url?: string;
  dog_friendly: boolean;
  playground_nearby: boolean;
  quick_service: boolean;
  good_for_groups: boolean;
  air_conditioning: boolean;
  baby_change_mens: boolean;
  baby_change_unisex: boolean;
  baby_change_womens: boolean;
  buzzy: boolean;
  free_kids_meal: boolean;
  friendly_staff: boolean;
  fun_quirky: boolean;
  games_available: boolean;
  halal: boolean;
  healthy_options: boolean;
  kids_coloring: boolean;
  kids_play_space: boolean;
  kids_potty_toilet: boolean;
  kosher: boolean;
  one_pound_kids_meal: boolean;
  posh: boolean;
  pram_storage: boolean;
  relaxed: boolean;
  small_plates: boolean;
  takeaway: boolean;
  teen_favourite: boolean;
  tourist_attraction_nearby: boolean;
  visible: boolean;
  opening_times?: any;
}

// Detect if running in iframe
const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

async function ensureRestaurantImagesRow(params: {
  restaurantId: string;
  imageUrl: string;
}) {
  const { data: existing, error: existingError } = await supabase
    .from("restaurant_images")
    .select("id")
    .eq("restaurant_id", params.restaurantId)
    .eq("image_url", params.imageUrl)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return;

  const { error: insertError } = await supabase.from("restaurant_images").insert({
    restaurant_id: params.restaurantId,
    image_url: params.imageUrl,
    is_featured: true,
    display_order: 0,
  });

  if (insertError) throw insertError;
}

// Direct Supabase fetcher for iframe mode
const directSupabaseFetcher = async () => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

// Hook to fetch all restaurants for admin
export function useAdminRestaurants() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";

  // In iframe mode, use direct Supabase client; otherwise use API route
  const fetcher = isInIframe ? directSupabaseFetcher : apiFetcher;
  const key = isAdmin ? (isInIframe ? 'supabase-restaurants' : "/api/admin/restaurants") : null;

  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR(key, fetcher, {
    revalidateOnFocus: false, // Don't refetch when switching tabs
    dedupingInterval: 30000, // Cache for 30 seconds
    revalidateOnMount: true, // Always fetch on mount
  });

  return {
    restaurants: data || [],
    isLoading,
    isError: error,
    refresh,
  };
}

// Hook to create a restaurant
export function useCreateRestaurant() {
  const createRestaurant = async (restaurantData: Restaurant) => {
    try {
      if (isInIframe) {
        const maybeGooglePhotoUrl = restaurantData.image_url;
        const shouldImportGooglePhoto = isGooglePlacesEdgePhotoUrl(maybeGooglePhotoUrl);

        // Never store edge function photo URLs directly (they 401 in browsers).
        const insertData: Restaurant = shouldImportGooglePhoto
          ? { ...restaurantData, image_url: undefined }
          : restaurantData;

        // Direct Supabase insert in iframe mode
        const { data: created, error } = await supabase
          .from("restaurants")
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;

        // If the Google Places mapper set image_url to an edge-function URL, import it
        // into Storage and persist the resulting public URL.
        if (created?.id && shouldImportGooglePhoto && maybeGooglePhotoUrl) {
          const publicUrl = await importGooglePlacesPhotoUrlToStorageClient({
            supabase,
            restaurantId: created.id,
            googlePlacesPhotoUrl: maybeGooglePhotoUrl,
          });

          const { error: updateError } = await supabase
            .from("restaurants")
            .update({ image_url: publicUrl })
            .eq("id", created.id);

          if (updateError) throw updateError;

          await ensureRestaurantImagesRow({
            restaurantId: created.id,
            imageUrl: publicUrl,
          });

          created.image_url = publicUrl;
        }

        // Refresh the restaurants list
        await mutate('supabase-restaurants');

        return { success: true, data: created };
      } else {
        // Use API route in normal mode
        const response = await fetch("/api/admin/restaurants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(restaurantData),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.error || "Failed to create restaurant");
        }

        // Refresh the restaurants list
        await mutate("/api/admin/restaurants");

        return { success: true, data: result.data };
      }
    } catch (error: any) {
      console.error("Create restaurant error:", error);
      return { success: false, error: error.message };
    }
  };

  return { createRestaurant };
}

// Hook to update a restaurant
export function useUpdateRestaurant() {
  const updateRestaurant = async (
    id: string,
    restaurantData: Partial<Restaurant>
  ) => {
    try {
      const cacheKey = isInIframe ? 'supabase-restaurants' : "/api/admin/restaurants";

      if (isInIframe) {
        const maybeGooglePhotoUrl = restaurantData.image_url;
        const shouldImportGooglePhoto = isGooglePlacesEdgePhotoUrl(maybeGooglePhotoUrl);

        // Never store edge function photo URLs directly.
        const updateData: Partial<Restaurant> = shouldImportGooglePhoto
          ? { ...restaurantData, image_url: undefined }
          : restaurantData;

        // Direct Supabase update in iframe mode
        const { data, error } = await supabase
          .from("restaurants")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        if (shouldImportGooglePhoto && maybeGooglePhotoUrl) {
          const publicUrl = await importGooglePlacesPhotoUrlToStorageClient({
            supabase,
            restaurantId: id,
            googlePlacesPhotoUrl: maybeGooglePhotoUrl,
          });

          const { error: updateError } = await supabase
            .from("restaurants")
            .update({ image_url: publicUrl })
            .eq("id", id);

          if (updateError) throw updateError;

          await ensureRestaurantImagesRow({
            restaurantId: id,
            imageUrl: publicUrl,
          });

          data.image_url = publicUrl;
        }

        // Optimistically update the cache
        await mutate(
          cacheKey,
          async (current: Restaurant[] | undefined) => {
            if (!current) return current;
            return current.map((r) =>
              r.id === id ? { ...r, ...restaurantData, image_url: data.image_url } : r
            );
          },
          false
        );

        // Revalidate in background
        mutate(cacheKey);

        return { success: true, data };
      } else {
        // Use API route in normal mode
        const response = await fetch("/api/admin/restaurants", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, ...restaurantData }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.error || "Failed to update restaurant");
        }

        const updatedRestaurant: Restaurant | undefined = result.data;

        // Optimistically update the cache
        await mutate(
          cacheKey,
          async (current: Restaurant[] | undefined) => {
            if (!current) return current;
            return current.map((r) =>
              r.id === id
                ? {
                    ...r,
                    ...restaurantData,
                    image_url:
                      updatedRestaurant?.image_url ?? restaurantData.image_url,
                  }
                : r
            );
          },
          false
        );

        // Revalidate in background
        mutate(cacheKey);

        return { success: true, data: result.data };
      }
    } catch (error: any) {
      console.error("Update restaurant error:", error);
      // Revalidate on error to ensure consistency
      const cacheKey = isInIframe ? 'supabase-restaurants' : "/api/admin/restaurants";
      mutate(cacheKey);
      return { success: false, error: error.message };
    }
  };

  return { updateRestaurant };
}

// Hook to delete a restaurant
export function useDeleteRestaurant() {
  const deleteRestaurant = async (id: string) => {
    try {
      const cacheKey = isInIframe ? 'supabase-restaurants' : "/api/admin/restaurants";

      if (isInIframe) {
        // Direct Supabase delete in iframe mode
        const { error } = await supabase
          .from('restaurants')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Optimistically update the cache
        await mutate(
          cacheKey,
          async (current: Restaurant[] | undefined) => {
            if (!current) return current;
            return current.filter((r) => r.id !== id);
          },
          false
        );

        // Revalidate in background
        mutate(cacheKey);

        return { success: true };
      } else {
        // Use API route in normal mode
        const response = await fetch(`/api/admin/restaurants?id=${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.error || "Failed to delete restaurant");
        }

        // Optimistically update the cache
        await mutate(
          cacheKey,
          async (current: Restaurant[] | undefined) => {
            if (!current) return current;
            return current.filter((r) => r.id !== id);
          },
          false
        );

        // Revalidate in background
        mutate(cacheKey);

        return { success: true };
      }
    } catch (error: any) {
      console.error("Delete restaurant error:", error);
      // Revalidate on error to ensure consistency
      const cacheKey = isInIframe ? 'supabase-restaurants' : "/api/admin/restaurants";
      mutate(cacheKey);
      return { success: false, error: error.message };
    }
  };

  return { deleteRestaurant };
}

// Hook to toggle restaurant visibility
export function useToggleRestaurantVisibility() {
  const { updateRestaurant } = useUpdateRestaurant();

  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    return await updateRestaurant(id, { visible: !currentVisible });
  };

  return { toggleVisibility };
}
