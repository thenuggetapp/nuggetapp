import { SWRConfiguration } from "swr";

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  // Revalidate on focus (when user returns to tab)
  revalidateOnFocus: true,
  // Revalidate on reconnect
  revalidateOnReconnect: true,
  // Don't revalidate on mount if data exists
  revalidateIfStale: true,
  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,
  // Keep data in cache for 5 minutes
  focusThrottleInterval: 5000,
  // Error retry configuration
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  // Loading timeout
  loadingTimeout: 5000,
};
