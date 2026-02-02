"use client";

import useSWR from "swr";
import { supabase } from "@/lib/supabase/client";
import { Subscription } from "@/lib/types/roles";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Lazy-load user subscriptions only when needed
 *
 * This hook fetches subscriptions on-demand, separate from the auth flow.
 * Use this on subscription pages, billing pages, or when checking subscription status.
 *
 * @returns { subscriptions, isLoading, error, mutate }
 */
export function useUserSubscriptions() {
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<Subscription[]>(
    user ? `subscriptions-${user.id}` : null,
    async () => {
      if (!user) return [];

      console.log("[useUserSubscriptions] Fetching subscriptions for user:", user.id);

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("[useUserSubscriptions] Error fetching subscriptions:", error);
        throw error;
      }

      console.log("[useUserSubscriptions] Loaded", data?.length || 0, "subscriptions");
      return data || [];
    },
    {
      // Cache for 10 minutes
      dedupingInterval: 10 * 60 * 1000,
      // Revalidate when window regains focus
      revalidateOnFocus: true,
      // Revalidate on mount if cache is stale
      revalidateIfStale: true,
    }
  );

  return {
    subscriptions: data || [],
    isLoading,
    error,
    mutate,
  };
}
