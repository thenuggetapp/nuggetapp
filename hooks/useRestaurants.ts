import useSWR from "swr";
import { apiFetcher } from "@/lib/swr-fetcher";

// Featured restaurants
export function useFeaturedRestaurants() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/restaurants?type=featured",
    apiFetcher,
    {
      revalidateOnFocus: false, // Featured restaurants don't change often
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    restaurants: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// London restaurants
export function useLondonRestaurants(excludeIds?: string[]) {
  const key =
    excludeIds && excludeIds.length > 0
      ? `/api/restaurants?type=london&exclude=${excludeIds.join(",")}`
      : "/api/restaurants?type=london";

  const { data, error, isLoading, mutate } = useSWR(key, apiFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    restaurants: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Search suggestions (with debouncing)
export function useSearchSuggestions(query: string) {
  const shouldFetch = query.trim().length > 1;

  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? `/api/restaurants?type=suggestions&q=${encodeURIComponent(query)}`
      : null,
    apiFetcher,
    {
      dedupingInterval: 200, // Cache for 200ms (debouncing effect)
      revalidateOnFocus: false,
    }
  );

  return {
    suggestions: data || [],
    isLoading,
    isError: error,
  };
}

// Search results
export function useSearchResults(searchParams: URLSearchParams) {
  const queryString = searchParams.toString();
  const key = queryString
    ? `/api/restaurants?type=search&${queryString}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(key, apiFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000, // Cache for 5 seconds
  });

  return {
    restaurants: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// Restaurant detail
export function useRestaurantDetail(restaurantId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    restaurantId ? `/api/restaurants/${restaurantId}` : null,
    apiFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    restaurant: data || null,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
