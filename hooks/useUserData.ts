import useSWR from "swr";
import { apiFetcher } from "@/lib/swr-fetcher";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { mutate } from "swr";

// User bookmarks
export function useUserBookmarks() {
  const { user } = useAuth();

  const {
    data,
    error,
    isLoading,
    mutate: mutateBookmarks,
  } = useSWR(
    user ? `/api/user/bookmarks?user_id=${user.id}` : null,
    apiFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    },
  );

  // Convert array to Set for easy lookup
  const bookmarkedIds = new Set<string>(
    data?.map((f: any) => f.restaurant_id) || [],
  );

  return {
    bookmarkedIds,
    bookmarks: data || [],
    isLoading,
    isError: error,
    refresh: mutateBookmarks,
  };
}

// User likes
export function useUserLikes() {
  const { user } = useAuth();

  const {
    data,
    error,
    isLoading,
    mutate: mutateLikes,
  } = useSWR(user ? `/api/user/likes?user_id=${user.id}` : null, apiFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });

  // Convert array to Set for easy lookup
  const likedIds = new Set<string>(
    data?.map((r: any) => r.restaurant_id) || [],
  );

  return {
    likedIds,
    likes: data || [],
    isLoading,
    isError: error,
    refresh: mutateLikes,
  };
}

// Toggle bookmark with optimistic update
export function useToggleBookmark() {
  const { user } = useAuth();
  const { bookmarkedIds, refresh: refreshBookmarks } = useUserBookmarks();

  const toggleBookmark = async (restaurantId: string) => {
    if (!user) return;

    const isCurrentlyBookmarked = bookmarkedIds.has(restaurantId);

    // Optimistic update - immediately update the cache
    const optimisticKey = `/api/user/bookmarks?user_id=${user.id}`;

    // Update cache optimistically
    await mutate(
      optimisticKey,
      async (current: any) => {
        if (isCurrentlyBookmarked) {
          // Remove from bookmarks
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("restaurant_id", restaurantId);

          if (error) throw error;

          return (
            current?.filter((f: any) => f.restaurant_id !== restaurantId) || []
          );
        } else {
          // Add to bookmarks
          const { error } = await supabase.from("favorites").insert({
            user_id: user.id,
            restaurant_id: restaurantId,
          });

          if (error) throw error;

          return [
            ...(current || []),
            { user_id: user.id, restaurant_id: restaurantId },
          ];
        }
      },
      false, // Don't revalidate immediately
    );

    // Revalidate in background to ensure consistency
    refreshBookmarks();
  };

  return { toggleBookmark };
}

// Toggle like with optimistic update
export function useToggleLike() {
  const { user } = useAuth();
  const { likedIds, refresh: refreshLikes } = useUserLikes();

  const toggleLike = async (restaurantId: string) => {
    if (!user) return;

    const isCurrentlyLiked = likedIds.has(restaurantId);

    // Optimistic update
    const optimisticKey = `/api/user/likes?user_id=${user.id}`;

    try {
      await mutate(
        optimisticKey,
        async (current: any) => {
          if (isCurrentlyLiked) {
            // Unlike - delete review with liked = true
            const { error } = await supabase
              .from("reviews")
              .delete()
              .eq("user_id", user.id)
              .eq("restaurant_id", restaurantId)
              .eq("liked", true);

            if (error) throw error;

            // Decrement likes count
            await supabase.rpc("decrement_likes", {
              restaurant_id: restaurantId,
            });

            return (
              current?.filter((r: any) => r.restaurant_id !== restaurantId) ||
              []
            );
          } else {
            // Like - create review with liked = true
            const { error } = await supabase.from("reviews").insert({
              user_id: user.id,
              restaurant_id: restaurantId,
              liked: true,
            });

            if (error) throw error;

            // Increment likes count
            await supabase.rpc("increment_likes", {
              restaurant_id: restaurantId,
            });

            return [
              ...(current || []),
              { user_id: user.id, restaurant_id: restaurantId },
            ];
          }
        },
        false,
      );

      // Revalidate in background
      refreshLikes();
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revalidate to get correct state
      refreshLikes();
    }
  };

  return { toggleLike };
}
