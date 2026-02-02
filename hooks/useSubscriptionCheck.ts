"use client";

import { useUserSubscriptions } from "./useUserSubscriptions";
import { Subscription } from "@/lib/types/roles";

/**
 * Check if user has active Pro subscriptions
 *
 * This hook lazy-loads subscriptions and provides convenient helpers
 * to check for active Customer Pro or Owner Pro plans.
 *
 * Use this instead of the old hasCustomerPro/hasOwnerPro from AuthContext.
 *
 * @returns { hasCustomerPro, hasOwnerPro, isLoading, subscriptions }
 */
export function useSubscriptionCheck() {
  const { subscriptions, isLoading, error } = useUserSubscriptions();

  const hasActivePlan = (
    subscriptionType: "customer_subscription" | "owner_subscription",
    planTier: "pro"
  ): boolean => {
    return subscriptions.some(
      (sub) =>
        sub.subscription_type === subscriptionType &&
        sub.plan_tier === planTier &&
        sub.status === "active"
    );
  };

  const hasCustomerPro = hasActivePlan("customer_subscription", "pro");
  const hasOwnerPro = hasActivePlan("owner_subscription", "pro");

  return {
    hasCustomerPro,
    hasOwnerPro,
    isLoading,
    error,
    subscriptions,
  };
}
